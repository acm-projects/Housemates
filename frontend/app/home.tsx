import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppBottomNav } from '../components/app-bottom-nav';

const COLORS = {
  bg:          '#FDFDFF',
  cardBg:      '#D1DAE6',
  primary:     '#0A2239',
  secondary:   '#176087',
  accent:      '#ADB6C4',
  textDark:    '#132E32',
  textMuted:   '#98AAC5',
  border:      '#3590F3',
  white:       '#FFFFFF',
}

type Task = {
  id: string;
  label: string;
  done: boolean;
};

const initialTasks: Task[] = [
  { id: 'task-1', label: 'Task 1',      done: false },
  { id: 'task-2', label: 'Task 2',      done: false },
  { id: 'task-3', label: 'Expense 1',   done: false },
  { id: 'task-4', label: 'Expense 2',   done: false },
  { id: 'task-5', label: 'Shopping 1',  done: false },
  { id: 'task-6', label: 'Event Today', done: false },
];

type Announcement = {
  id: string;
  message: string;
  time: string;
};

const announcements: Announcement[] = [
  { id: 'a-1', message: "I'm gonna have guests over at 7PM...", time: '1:09 PM' },
  { id: 'a-2', message: 'Does anyone have any lettuce?',        time: '2:40 AM' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [tasks, setTasks]                     = useState(initialTasks);
  const [announcementsOpen, setAnnouncementsOpen] = useState(true);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
        <Pressable style={styles.avatarPlaceholder} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
        </Pressable>
          <Text style={styles.headerTitle}>Welcome Home</Text>
          <View style={styles.avatarSpacer} />
        </View>

        {/* Accent bar */}
        <View style={styles.accentBar} />

        {/* Today heading + progress */}
        <View style={styles.todayRow}>
          <Text style={styles.todayTitle}>Today</Text>
          <View style={styles.progressChip}>
            <Text style={styles.progressChipText}>{doneCount}/{tasks.length} done</Text>
          </View>
        </View>

        {/* Task card */}
        <View style={styles.taskCard}>
          {tasks.map((task, index) => (
            <Pressable
              key={task.id}
              style={[styles.taskRow, index < tasks.length - 1 && styles.taskRowBorder]}
              onPress={() => toggleTask(task.id)}
            >
              <Ionicons
                name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={task.done ? COLORS.secondary : COLORS.accent}
              />
              <Text style={[styles.taskLabel, task.done && styles.taskLabelDone]}>
                {task.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Announcements */}
        <Pressable
          style={styles.announcementsHeader}
          onPress={() => setAnnouncementsOpen((prev) => !prev)}
        >
          <Text style={styles.announcementsTitle}>Announcements</Text>
          <View style={styles.chevronBox}>
          <Ionicons
            name={announcementsOpen ? 'chevron-down-outline' : 'chevron-forward-outline'}
            size={20}
            color={COLORS.primary}
          />
          </View>
        </Pressable>

        {announcementsOpen &&
          announcements.map((item, index) => (
            <View
              key={item.id}
              style={[styles.announcementCard, index === 0 && styles.announcementCardPrimary]}
            >
              <View style={styles.announcementAvatar}>
                <Text style={styles.avatarText}>?</Text>
              </View>
              <View style={styles.announcementTextWrap}>
                <Text style={styles.announcementMessage} numberOfLines={1}>
                  {item.message}
                </Text>
                <Text style={styles.announcementTime}>{item.time}</Text>
              </View>
            </View>
          ))}

        {/* Progress / study card */}
        <View style={styles.studyCard}>
          <View style={styles.studyIconWrap}>
            <MaterialCommunityIcons name="book-open-page-variant" size={26} color={COLORS.secondary} />
          </View>
          <View style={styles.studyTextWrap}>
            <Text style={styles.studyTitle}>Daily Study</Text>
            <Text style={styles.studySubtext}>30 Tasks</Text>
          </View>
          <View style={styles.progressRing}>
            <Text style={styles.progressRingText}>87%</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <AppBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  content:  { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18 },

  // Header
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  avatarText:   { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  avatarSpacer: { width: 42, height: 42 },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: COLORS.textDark },

  accentBar: {
    height: 3, backgroundColor: COLORS.secondary,
    borderRadius: 2, marginBottom: 16,
  },

  // Today
  todayRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  todayTitle: { fontSize: 36, fontWeight: '800', color: COLORS.primary },
  progressChip: {
    backgroundColor: `${COLORS.secondary}20`,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  progressChipText: { fontSize: 13, fontWeight: '700', color: COLORS.secondary },

  // Task card
  taskCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 18,
    marginBottom: 20,
    borderWidth: 1, borderColor: `${COLORS.border}40`,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  taskRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 12,
  },
  taskRowBorder: {
    borderBottomWidth: 1, borderBottomColor: `${COLORS.accent}40`,
  },
  taskLabel:     { flex: 1, fontSize: 16, color: COLORS.textDark, fontWeight: '500' },
  taskLabelDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },

  // Announcements
  announcementsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  announcementsTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  chevronBox: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${COLORS.border}40`,
  },
  announcementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 12, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1, borderColor: '#E8EDF5',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  announcementCardPrimary: {
    borderColor: COLORS.border,
    backgroundColor: `${COLORS.border}08`,
  },
  announcementAvatar: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1, borderColor: `${COLORS.border}40`,
  },
  announcementTextWrap:  { flex: 1 },
  announcementMessage:   { fontSize: 15, color: COLORS.textDark, fontWeight: '600' },
  announcementTime:      { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  // Study card
  studyCard: {
    marginTop: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    paddingVertical: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: `${COLORS.border}40`,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  studyIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: `${COLORS.secondary}20`,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  studyTextWrap: { flex: 1 },
  studyTitle:    { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  studySubtext:  { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  progressRing: {
    width: 54, height: 54, borderRadius: 27,
    borderWidth: 4, borderColor: COLORS.secondary,
    justifyContent: 'center', alignItems: 'center',
  },
  progressRingText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});
