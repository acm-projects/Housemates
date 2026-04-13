import { apiGetWithBody, extractDynamoItems } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { API_HOUSE_ID } from './apiConfig';
import { AppBottomNav } from '@/components/app-bottom-nav';
import { BackgroundGlows, GLASS_COLORS } from '@/components/glass-ui';
import { PageHeader } from '@/components/pageHeader';

type TaskItem = {
  id: string;
  note: string;
  title: string;
  time: string;
  status: 'Done' | 'Urgent' | 'To-do';
  color: string;
  dateKey: string;
  done: boolean;
};

function addDays(base: Date, days: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0'),
  ].join('-');
}

function getDateOptions(today: Date) {
  return [-2, -1, 0, 1, 2].map((offset) => {
    const date = addDays(today, offset);
    return {
      id: toDateKey(date),
      month: date.toLocaleString('en-US', { month: 'short' }),
      day: `${date.getDate()}`,
      weekday: date.toLocaleString('en-US', { weekday: 'short' }),
    };
  });
}

function buildSeedTasks(today: Date): TaskItem[] {
  return [
    {
      id: '1',
      note: 'Grocery shopping app design',
      title: 'Market Research',
      time: '10:00 AM',
      status: 'Done',
      color: '#c9b8e8',
      dateKey: toDateKey(today),
      done: true,
    },
    {
      id: '2',
      note: 'Recurring',
      title: 'Competitive Analysis',
      time: '12:00 PM',
      status: 'Urgent',
      color: '#f5c6d0',
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: '3',
      note: 'Uber Eats redesign challange',
      title: 'Create Low-fidelity Wireframe',
      time: '07:00 PM',
      status: 'To-do',
      color: '#c9b8e8',
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: '4',
      note: 'About design sprint',
      title: 'How to pitch a Design Sprint',
      time: '09:00 PM',
      status: 'To-do',
      color: '#fde5b0',
      dateKey: toDateKey(today),
      done: false,
    },
  ];
}

function statusPillStyle(status: TaskItem['status']) {
  if (status === 'Done') return { bg: '#b8e0d2', text: '#1a1a1a' };
  if (status === 'Urgent') return { bg: '#f5a08c', text: '#1a1a1a' };
  return { bg: '#c9b8e8', text: '#1a1a1a' };
}

export default function CalendarPage() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const dateOptions = useMemo(() => getDateOptions(today), [today]);
  const [selectedDateId, setSelectedDateId] = useState(toDateKey(today));
  const [tasks, setTasks] = useState(() => buildSeedTasks(today));
  const [viewMode, setViewMode] = useState<'Day View' | 'Week View'>('Day View');
  const [loading, setLoading] = useState(false);

  const loadEventsFromApi = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetWithBody('/events', { house_id: API_HOUSE_ID });
      extractDynamoItems(data);
    } catch (e) {
      console.error('Load events failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEventsFromApi();
  }, [loadEventsFromApi]);

  const visibleTasks = useMemo(() => {
    if (viewMode === 'Week View') {
      const DAY = 24 * 60 * 60 * 1000;
      const selectedDate = new Date(selectedDateId);
      return tasks.filter((task) => {
        const taskDate = new Date(task.dateKey);
        return Math.abs(taskDate.getTime() - selectedDate.getTime()) <= 6 * DAY;
      });
    }
    return tasks.filter((task) => task.dateKey === selectedDateId);
  }, [viewMode, selectedDateId, tasks]);

  const toggleTaskDone = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              done: !task.done,
              status: !task.done ? 'Done' : ('To-do' as const),
            }
          : task,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BackgroundGlows />
      <View style={styles.gradient}>
        <PageHeader title="Calendar" />

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#f5a08c" />
          </View>
        ) : null}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {dateOptions.map((date) => {
              const isActive = date.id === selectedDateId;
              return (
                <Pressable
                  key={date.id}
                  onPress={() => setSelectedDateId(date.id)}
                  style={[styles.dateChip, isActive && styles.dateChipActive]}
                >
                  <Text style={[styles.dateMonth, isActive && styles.dateChipTextActive]}>
                    {date.month}
                  </Text>
                  <Text style={[styles.dateDay, isActive && styles.dateChipTextActive]}>
                    {date.day}
                  </Text>
                  <Text style={[styles.dateWeekday, isActive && styles.dateChipTextActive]}>
                    {date.weekday}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            style={styles.viewModeBtn}
            onPress={() => setViewMode((v) => (v === 'Day View' ? 'Week View' : 'Day View'))}
          >
            <Text style={styles.viewModeText}>{viewMode}</Text>
            <Ionicons name="chevron-down" size={20} color="#1a1a1a" />
          </Pressable>

          <View style={styles.taskList}>
            {visibleTasks.map((task) => {
              const pill = statusPillStyle(task.status);
              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskTop}>
                    <Text style={styles.taskNote}>{task.note}</Text>
                    <View style={[styles.colorSwatch, { backgroundColor: task.color }]} />
                  </View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskFooter}>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={16} color="#8b7b6b" />
                      <Text style={styles.timeText}>{task.time}</Text>
                    </View>
                    <View style={styles.footerRight}>
                      <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                        <Text style={[styles.pillText, { color: pill.text }]}>{task.status}</Text>
                      </View>
                      <Pressable
                        onPress={() => toggleTaskDone(task.id)}
                        style={[styles.checkOuter, task.done && styles.checkOuterDone]}
                      >
                        {task.done ? <Text style={styles.checkMark}>✓</Text> : null}
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {visibleTasks.length === 0 ? (
            <Text style={styles.empty}>No tasks for this day</Text>
          ) : null}

          <View style={{ height: 120 }} />
        </ScrollView>

        <Pressable style={styles.fab} onPress={() => router.push('/AddTask')}>
          <View style={styles.fabIcon}>
            <Ionicons name="add" size={22} color="#1a1a1a" />
          </View>
          <Text style={styles.fabLabel}>Add Task</Text>
        </Pressable>

        <AppBottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: GLASS_COLORS.bg },
  gradient: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingRow: { paddingVertical: 8, alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: '#f5a08c',
    borderColor: '#f5a08c',
  },
  dateMonth: { fontSize: 11, color: '#1a1a1a', opacity: 0.8 },
  dateDay: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  dateWeekday: { fontSize: 11, color: '#1a1a1a', opacity: 0.8 },
  dateChipTextActive: { color: '#fff', opacity: 1 },
  viewModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginBottom: 16,
  },
  viewModeText: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  taskList: { gap: 16 },
  taskCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  taskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskNote: { fontSize: 13, color: '#8b7b6b', flex: 1 },
  colorSwatch: { width: 32, height: 32, borderRadius: 8 },
  taskTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 12 },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 13, color: '#8b7b6b' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: '600' },
  checkOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#c9b8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOuterDone: {
    backgroundColor: '#b8e0d2',
    borderColor: '#b8e0d2',
  },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '800' },
  empty: { textAlign: 'center', color: '#8b7b6b', paddingVertical: 40 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245,160,140,0.85)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fabIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
});
