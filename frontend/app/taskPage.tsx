import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppBottomNav } from '../components/app-bottom-nav';

type Filter = 'All' | 'Weekly' | 'In Progress' | 'Completed';

type TaskItem = {
  id: string;
  note: string;
  title: string;
  time: string;
  status: 'Done' | 'Urgent' | 'To-do';
  accent: string;
  dateKey: string;
  done: boolean;
};

const DAY = 24 * 60 * 60 * 1000;

function addDays(base: Date, days: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
}

function toDateKey(date: Date) {
  return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-');
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
      accent: '#f7d5de',
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: '2',
      note: 'Recurring',
      title: 'Competitive Analysis',
      time: '12:00 PM',
      status: 'Urgent',
      accent: '#f7d5de',
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: '3',
      note: 'Uber Eats redesign challange',
      title: 'Create Low-fidelity Wireframe',
      time: '07:00 PM',
      status: 'To-do',
      accent: '#e5d9f8',
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: '4',
      note: 'About design sprint',
      title: 'How to pitch a Design Sprint',
      time: '09:00 PM',
      status: 'To-do',
      accent: '#fde1c6',
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: '5',
      note: 'Cleanup tasks for week',
      title: 'Kitchen Deep Clean',
      time: '06:30 PM',
      status: 'Done',
      accent: '#d7f0cf',
      dateKey: toDateKey(addDays(today, 1)),
      done: true,
    },
  ];
}

function statusColors(status: TaskItem['status']) {
  if (status === 'Done') return { background: '#cfe58f', color: '#70813b' };
  if (status === 'Urgent') return { background: '#ffd8d2', color: '#ea5f43' };
  return { background: '#89afff', color: '#ffffff' };
}

export default function TaskPage() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const dateOptions = useMemo(() => getDateOptions(today), [today]);
  const [selectedDateId, setSelectedDateId] = useState(toDateKey(today));
  const [tasks, setTasks] = useState(() => buildSeedTasks(today));
  const [filter, setFilter] = useState<Filter>('All');

  const visibleTasks = useMemo(() => {
    const selectedDate = new Date(selectedDateId);

    return tasks.filter((task) => {
      const taskDate = new Date(task.dateKey);
      const isSameDate = task.dateKey === selectedDateId;
      const isInWeek = Math.abs(taskDate.getTime() - selectedDate.getTime()) <= 6 * DAY;

      if (filter === 'Weekly') return isInWeek;
      if (filter === 'In Progress') return isSameDate && !task.done && task.status !== 'Done';
      if (filter === 'Completed') return isSameDate && (task.done || task.status === 'Done');
      return isSameDate;
    });
  }, [filter, selectedDateId, tasks]);

  const addTask = () => {
    setTasks((prev) => [
      {
        id: `${Date.now()}`,
        note: 'New task',
        title: 'Untitled Task',
        time: '08:00 PM',
        status: 'To-do',
        accent: '#e5d9f8',
        dateKey: selectedDateId,
        done: false,
      },
      ...prev,
    ]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              done: !task.done,
              status: task.done ? 'To-do' : 'Done',
            }
          : task
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.replace('/')} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={23} color="#1d2030" />
          </Pressable>
          <Text style={styles.title}>Today&apos;s Tasks</Text>
          <View style={styles.bellWrap}>
            <Ionicons name="notifications" size={22} color="#1d2030" />
            <View style={styles.bellDot} />
          </View>
        </View>

        <FlatList
          data={dateOptions}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
          renderItem={({ item }) => {
            const isActive = item.id === selectedDateId;

            return (
              <Pressable
                onPress={() => setSelectedDateId(item.id)}
                style={[styles.dateCard, isActive && styles.dateCardActive]}
              >
                <Text style={[styles.dateMonth, isActive && styles.dateTextActive]}>{item.month}</Text>
                <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>{item.day}</Text>
                <Text style={[styles.dateWeekday, isActive && styles.dateTextActive]}>{item.weekday}</Text>
              </Pressable>
            );
          }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {(['All', 'Weekly', 'In Progress', 'Completed'] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.filterPill, filter === item && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.cardsWrap}>
          {visibleTasks.map((task) => {
            const statusStyle = statusColors(task.status);

            return (
              <View key={task.id} style={styles.taskCard}>
                <View style={[styles.cardAccent, { backgroundColor: task.accent }]} />
                <Text style={styles.taskNote}>{task.note}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.timeWrap}>
                    <Ionicons name="time" size={17} color="#6f5543" />
                    <Text style={styles.timeText}>{task.time}</Text>
                  </View>

                  <View style={styles.statusWrap}>
                    <View style={[styles.statusPill, { backgroundColor: statusStyle.background }]}>
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>{task.status}</Text>
                    </View>
                    <Pressable onPress={() => toggleTask(task.id)} style={styles.doneCircle}>
                      {task.done ? <View style={styles.doneCircleInner} /> : null}
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}

          {visibleTasks.length === 0 ? <Text style={styles.empty}>No tasks for this date.</Text> : null}
        </View>

        <View style={styles.bottomBuffer} />
      </ScrollView>

      <Pressable style={styles.floatingButton} onPress={addTask}>
        <View style={styles.plusCircle}>
          <AntDesign name="plus" size={24} color="#dfe6ff" />
        </View>
        <Text style={styles.floatingButtonText}>Add Task</Text>
      </Pressable>

      <AppBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#edeff6',
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 14,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  iconButton: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    right: 4,
    top: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d8d8dc',
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: '#232633',
  },
  dateList: {
    gap: 10,
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  dateCard: {
    width: 94,
    backgroundColor: '#c6d6fb',
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateCardActive: {
    backgroundColor: '#596eae',
  },
  dateMonth: {
    fontSize: 16,
    lineHeight: 20,
    color: '#293046',
    marginBottom: 10,
  },
  dateDay: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: '#283148',
    marginBottom: 8,
  },
  dateWeekday: {
    fontSize: 16,
    lineHeight: 20,
    color: '#293046',
  },
  dateTextActive: {
    color: '#ffffff',
  },
  filterRow: {
    gap: 10,
    paddingHorizontal: 6,
    marginBottom: 18,
  },
  filterPill: {
    backgroundColor: '#d7e3ff',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 128,
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#6277b7',
  },
  filterText: {
    fontSize: 17,
    lineHeight: 22,
    color: '#5b6dad',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  cardsWrap: {
    paddingHorizontal: 2,
  },
  taskCard: {
    position: 'relative',
    backgroundColor: '#becbf1',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#849dd4',
  },
  cardAccent: {
    position: 'absolute',
    right: 16,
    top: 18,
    width: 36,
    height: 36,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4,
  },
  taskNote: {
    fontSize: 15,
    lineHeight: 20,
    color: '#6c6e7d',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: '#262936',
    fontWeight: '600',
    marginBottom: 16,
    paddingRight: 52,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#6a5545',
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusPill: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#2f3650',
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  doneCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#1f2433',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5a70b3',
  },
  empty: {
    fontSize: 15,
    lineHeight: 20,
    color: '#7a7f91',
    paddingVertical: 6,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 94,
    backgroundColor: '#7787bf',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#a9b7e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonText: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  bottomBuffer: {
    height: 172,
  },
});