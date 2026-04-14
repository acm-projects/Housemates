import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "./pageHeader";
import {AppBottomNav} from "./AppBottomNav";
import { GLASS_COLORS } from "@/components/glass-ui";
import { GradientBackground } from "./gradientBg";
import { apiGetWithBody, extractDynamoItems } from "@/utils/api";
import { API_HOUSE_ID } from "./apiConfig";

type TaskItem = {
  id: string
  note: string
  title: string
  time: string
  status: "Done" | "Urgent" | "To-do"
  color: string
  dateKey: string
  done: boolean
}

function addDays(base: Date, days: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days)
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, "0"),
    `${date.getDate()}`.padStart(2, "0"),
  ].join("-")
}

function getDateOptions(today: Date) {
  return [-2, -1, 0, 1, 2].map((offset) => {
    const date = addDays(today, offset)
    return {
      id: toDateKey(date),
      month: date.toLocaleString("en-US", { month: "short" }),
      day: `${date.getDate()}`,
      weekday: date.toLocaleString("en-US", { weekday: "short" }),
    }
  })
}

function buildSeedTasks(today: Date): TaskItem[] {
  return [
    {
      id: "1",
      note: "Grocery shopping app design",
      title: "Market Research",
      time: "10:00 AM",
      status: "Done",
      color: "#c9b8e8",
      dateKey: toDateKey(today),
      done: true,
    },
    {
      id: "2",
      note: "Recurring",
      title: "Competitive Analysis",
      time: "12:00 PM",
      status: "Urgent",
      color: "#f5c6d0",
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: "3",
      note: "Uber Eats redesign challange",
      title: "Create Low-fidelity Wireframe",
      time: "07:00 PM",
      status: "To-do",
      color: "#c9b8e8",
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: "4",
      note: "About design sprint",
      title: "How to pitch a Design Sprint",
      time: "09:00 PM",
      status: "To-do",
      color: "#fde5b0",
      dateKey: toDateKey(today),
      done: false,
    },
  ]
}

function statusColors(status: TaskItem["status"]) {
  if (status === "Done") return { bgColor: "#b8e0d2", textColor: "#1a1a1a" }
  if (status === "Urgent") return { bgColor: "#f5a08c", textColor: "#1a1a1a" }
  return { bgColor: "#c9b8e8", textColor: "#1a1a1a" }
}

export default function CalendarPage() {
  const router = useRouter();
  const today = useMemo(() => new Date(), [])
  const dateOptions = useMemo(() => getDateOptions(today), [today])
  const [selectedDateId, setSelectedDateId] = useState(toDateKey(today))
  const [tasks, setTasks] = useState(() => buildSeedTasks(today))
  const [viewMode, setViewMode] = useState<"Day View" | "Week View">("Day View")
  const [loading, setLoading] = useState(false)

  const loadEventsFromApi = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGetWithBody("/events", { house_id: API_HOUSE_ID })
      const rows = extractDynamoItems(data)
      // Process API results if needed
    } catch (e) {
      console.error("Load events failed", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEventsFromApi()
  }, [loadEventsFromApi])

  const visibleTasks = useMemo(() => {
    if (viewMode === "Week View") {
      const DAY = 24 * 60 * 60 * 1000
      const selectedDate = new Date(selectedDateId)
      return tasks.filter((task) => {
        const taskDate = new Date(task.dateKey)
        return Math.abs(taskDate.getTime() - selectedDate.getTime()) <= 6 * DAY
      })
    }
    return tasks.filter((task) => task.dateKey === selectedDateId)
  }, [viewMode, selectedDateId, tasks])

  const toggleTaskDone = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, done: !task.done, status: task.done ? "To-do" : "Done" as const }
          : task
      )
    )
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <PageHeader title="Calendar" />
        <View style={styles.container}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {dateOptions.map((date) => {
              const isActive = date.id === selectedDateId
              return (
                <Pressable
                  key={date.id}
                  onPress={() => setSelectedDateId(date.id)}
                  style={[styles.datePill, isActive ? styles.datePillActive : styles.datePillInactive]}
                >
                  <Text style={[styles.dateMonth, isActive && styles.dateTextActive]}>{date.month}</Text>
                  <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>{date.day}</Text>
                  <Text style={[styles.dateWeekday, isActive && styles.dateTextActive]}>{date.weekday}</Text>
                </Pressable>
              )
            })}
          </ScrollView>

          <View style={styles.modeRow}>
            <Text style={styles.monthViewText}>Month View</Text>
            <Pressable
              onPress={() => setViewMode((v) => (v === "Day View" ? "Week View" : "Day View"))}
              style={styles.modeButton}
            >
              <Text style={styles.modeText}>{viewMode}</Text>
              <Ionicons name="chevron-down" size={18} color="#1a1a1a" />
            </Pressable>
          </View>

          <View style={styles.tasksWrap}>
            {visibleTasks.map((task) => {
              const statusStyle = statusColors(task.status);
              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskTopRow}>
                    <Text style={styles.taskNote}>{task.note}</Text>
                    <View style={[styles.colorSwatch, { backgroundColor: task.color }]} />
                  </View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskBottomRow}>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={16} color="#8b7b6b" />
                      <Text style={styles.timeText}>{task.time}</Text>
                    </View>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusPill, { backgroundColor: statusStyle.bgColor }]}>
                        <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{task.status}</Text>
                      </View>
                      <Pressable
                        onPress={() => toggleTaskDone(task.id)}
                        style={[
                          styles.doneCircle,
                          task.done ? styles.doneCircleActive : styles.doneCircleInactive,
                        ]}
                      >
                        {task.done ? <Text style={styles.doneCheck}>✓</Text> : null}
                      </Pressable>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>

          {visibleTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tasks for this day</Text>
            </View>
          )}
          <Pressable style={styles.fab} onPress={() => router.push("/AddTask")}>
            <View style={styles.fabIconWrap}>
              <Ionicons name="add" size={20} color="#1a1a1a" />
            </View>
            <Text style={styles.fabText}>Add Task</Text>
          </Pressable>
          <AppBottomNav />
        </View>
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
  dateRow: { gap: 8, paddingVertical: 10 },
  datePill: {
    width: 70,
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
  },
  datePillActive: { backgroundColor: "#f5a08c", borderColor: "#f5a08c" },
  datePillInactive: { backgroundColor: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.4)" },
  dateMonth: { fontSize: 12, color: "#1a1a1a", opacity: 0.8 },
  dateDay: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
  dateWeekday: { fontSize: 12, color: "#1a1a1a", opacity: 0.8 },
  dateTextActive: { color: "#FFFFFF", opacity: 1 },
  modeRow: { flexDirection: "row", justifyContent: "flex-end", gap: 16, marginBottom: 12, alignItems: "center" },
  monthViewText: { color: "#8b7b6b", fontWeight: "500" },
  modeButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  modeText: { color: "#1a1a1a", fontWeight: "500" },
  tasksWrap: { gap: 12 },
  taskCard: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    padding: 14,
  },
  taskTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  taskNote: { fontSize: 13, color: "#8b7b6b", flex: 1, paddingRight: 8 },
  colorSwatch: { width: 28, height: 28, borderRadius: 8 },
  taskTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a", marginBottom: 10 },
  taskBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeText: { fontSize: 13, color: "#8b7b6b" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: "600" },
  doneCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  doneCircleActive: { backgroundColor: "#b8e0d2", borderColor: "#b8e0d2" },
  doneCircleInactive: { borderColor: "#c9b8e8" },
  doneCheck: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  emptyState: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#8b7b6b" },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245,160,140,0.9)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fabIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "#1a1a1a", fontWeight: "600" },
});
