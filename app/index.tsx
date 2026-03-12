import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "../components/BottomNav";
import { DATE_CHIP_GAP, DATE_CHIP_WIDTH, DateChip } from "../components/DateChip";
import { FilterPill } from "../components/FilterPill";
import { TaskCard } from "../components/TaskCard";
import type { TaskItem, TaskStatus } from "../constants/tasks";
import { colors } from "../constants/theme";
import { useTaskData } from "../hooks/useTaskData";

type FilterType = "All" | "Weekly" | "In Progress" | "Completed";

function cycleTaskStatus(status: TaskStatus): TaskStatus {
  if (status === "To-do") return "Urgent";
  if (status === "Urgent") return "Done";
  return "To-do";
}

export default function HomeScreen() {
  const { dateItems, filters, taskItems } = useTaskData();
  const { width } = useWindowDimensions();
  const [selectedDateId, setSelectedDateId] = useState(dateItems[2]?.id ?? dateItems[0]?.id ?? "");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const [bellEnabled, setBellEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "bag" | "home" | "calendar" | "bookmark">("home");
  const [tasks, setTasks] = useState<TaskItem[]>(taskItems);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const dateListRef = useRef<FlatList<(typeof dateItems)[number]>>(null);

  const todayIndex = 2;
  const sidePadding = Math.max((width - DATE_CHIP_WIDTH) / 2, 0);

  const visibleTasks = useMemo(() => {
    if (selectedFilter === "Completed") {
      return tasks.filter((task) => doneMap[task.id] || task.status === "Done");
    }

    if (selectedFilter === "In Progress") {
      return tasks.filter((task) => !doneMap[task.id] && task.status !== "Done");
    }

    return tasks;
  }, [doneMap, selectedFilter, tasks]);

  const onSelectDate = (index: number) => {
    const selected = dateItems[index];
    if (!selected) return;

    setSelectedDateId(selected.id);
    dateListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  };

  const onCycleStatus = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: cycleTaskStatus(task.status) } : task)));
  };

  const onToggleDone = (taskId: string) => {
    setDoneMap((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const onAddTask = () => {
    setTasks((prev) => [
      {
        id: `${Date.now()}`,
        category: "New task",
        title: "Untitled Task",
        time: "08:00 PM",
        status: "To-do",
        stickyColor: "#E5D9F2",
      },
      ...prev,
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => onSelectDate(todayIndex)} accessibilityRole="button">
            <AntDesign name="left" size={22} color={colors.textMain} />
          </Pressable>
          <Text style={styles.title}>Today's Tasks</Text>
          <Pressable
            style={styles.bellWrap}
            onPress={() => setBellEnabled((prev) => !prev)}
            accessibilityRole="button"
          >
            <Ionicons
              name={bellEnabled ? "notifications" : "notifications-off"}
              size={24}
              color={colors.textMain}
            />
            {bellEnabled ? <View style={styles.bellDot} /> : null}
          </Pressable>
        </View>

        <FlatList
          ref={dateListRef}
          horizontal
          data={dateItems}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.dateRow, { paddingHorizontal: sidePadding }]}
          ItemSeparatorComponent={() => <View style={{ width: DATE_CHIP_GAP }} />}
          initialScrollIndex={todayIndex}
          getItemLayout={(_, index) => ({
            length: DATE_CHIP_WIDTH + DATE_CHIP_GAP,
            offset: index * (DATE_CHIP_WIDTH + DATE_CHIP_GAP),
            index,
          })}
          onScrollToIndexFailed={() => {
            dateListRef.current?.scrollToOffset({ offset: todayIndex * (DATE_CHIP_WIDTH + DATE_CHIP_GAP), animated: true });
          }}
          renderItem={({ item, index }) => (
            <DateChip
              item={item}
              selected={item.id === selectedDateId}
              onPress={() => onSelectDate(index)}
            />
          )}
        />

        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const filterValue = filter as FilterType;
            return (
              <FilterPill
                key={filter}
                label={filter}
                active={filterValue === selectedFilter}
                onPress={() => setSelectedFilter(filterValue)}
                style={styles.filterPill}
                textStyle={styles.filterText}
              />
            );
          })}
        </View>

        <View style={styles.cardsWrap}>
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              done={Boolean(doneMap[task.id] || task.status === "Done")}
              onPress={() => setSelectedDateId(selectedDateId)}
              onPressSticky={() => onCycleStatus(task.id)}
              onPressStatus={() => onCycleStatus(task.id)}
              onToggleDone={() => onToggleDone(task.id)}
            />
          ))}
        </View>
      </ScrollView>

      <Pressable style={styles.floatingAddTaskButton} onPress={onAddTask} accessibilityRole="button">
        <View style={styles.plusCircle}>
          <AntDesign name="plus" size={26} color="#97AADF" />
        </View>
        <Text style={styles.addTaskText}>Add Task</Text>
      </Pressable>

      <View style={styles.floatingNavWrap}>
        <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 200,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  title: {
    color: colors.textMain,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
    lineHeight: 31,
    fontFamily: "Georgia",
  },
  bellWrap: {
    position: "relative",
  },
  bellDot: {
    width: 11,
    height: 11,
    borderRadius: 99,
    backgroundColor: "#D8D8DC",
    position: "absolute",
    right: 0,
    top: -3,
  },
  dateRow: {
    paddingBottom: 10,
  },
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexDirection: "row",
    gap: 6,
  },
  filterPill: {
    flex: 1,
    minWidth: 0,
    borderRadius: 24,
  },
  filterText: {
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  cardsWrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  floatingAddTaskButton: {
    position: "absolute",
    right: 20,
    bottom: 108,
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  floatingNavWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  plusCircle: {
    width: 52,
    height: 52,
    borderRadius: 99,
    borderWidth: 3,
    borderColor: "#9BB0E4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B7BBC",
  },
  addTaskText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
});
