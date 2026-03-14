import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

type Task = {
  id: string;
  label: string;
  done: boolean;
};

const initialTasks: Task[] = [
  { id: 'task-1', label: 'Task 1', done: false },
  { id: 'task-2', label: 'Task 2', done: false },
  { id: 'task-3', label: 'Expense 1', done: false },
  { id: 'task-4', label: 'Expense 2', done: false },
  { id: 'task-5', label: 'Shopping 1', done: false },
  { id: 'task-6', label: 'Event Today', done: false },
];

type Announcement = {
  id: string;
  message: string;
  time: string;
};

const announcements: Announcement[] = [
  {
    id: 'a-1',
    message: "I’m gonna have guests over at 7PM...",
    time: '1:09 PM',
  },
  {
    id: 'a-2',
    message: 'Does anyone have any lettuce?',
    time: '2:40 AM',
  },
];

export default function HomeScreen() {
  const [tasks, setTasks] = useState(initialTasks);
  const [announcementsOpen, setAnnouncementsOpen] = useState(true);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.placeholderText}>?</Text>
          </View>
          <Text style={styles.title}>Welcome Home</Text>
          <View style={styles.avatarSpacer} />
        </View>

        <Text style={styles.todayTitle}>Today</Text>

        <View style={styles.taskCard}>
          {tasks.map((task) => (
            <Pressable key={task.id} style={styles.taskRow} onPress={() => toggleTask(task.id)}>
              <Ionicons
                name={task.done ? 'checkmark-circle-outline' : 'ellipse-outline'}
                size={24}
                color="#3f342f"
              />
              <Text style={[styles.taskLabel, task.done && styles.rowDone]}>{task.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.announcementsHeader} onPress={() => setAnnouncementsOpen((prev) => !prev)}>
          <Text style={styles.announcementsTitle}>Announcements</Text>
          <Feather name={announcementsOpen ? 'chevron-down' : 'chevron-right'} size={34} color="#15161e" />
        </Pressable>

        {announcementsOpen && announcements.map((item, index) => (
          <View key={item.id} style={[styles.announcementCard, index === 0 && styles.announcementCardPrimary]}>
            <View style={styles.announcementPlaceholder}>
              <Text style={styles.placeholderText}>?</Text>
            </View>
            <View style={styles.announcementTextWrap}>
              <Text style={styles.announcementMessage} numberOfLines={1}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        ))}

        <View style={styles.studyCard}>
          <View style={styles.studyIconWrap}>
            <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#ef8d42" />
          </View>
          <View style={styles.studyTextWrap}>
            <Text style={styles.studyTitle}>Daily Study</Text>
            <Text style={styles.studySubtext}>30 Tasks</Text>
          </View>
          <View style={styles.progressWrap}>
            <Text style={styles.progressText}>87%</Text>
          </View>
        </View>

        <View style={styles.bottomBuffer} />
      </ScrollView>

      <AppBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e7e8ee',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d9dce6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSpacer: {
    width: 44,
    height: 44,
  },
  placeholderText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#6d7284',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: '#232632',
    textAlign: 'center',
  },
  todayTitle: {
    fontSize: 40,
    lineHeight: 46,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: '#2a2d39',
    marginBottom: 8,
  },
  taskCard: {
    backgroundColor: '#b7c3ea',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 9,
  },
  taskLabel: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    color: '#3b312c',
  },
  rowDone: {
    textDecorationLine: 'line-through',
    color: '#6d7184',
  },
  announcementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementsTitle: {
    fontFamily: 'Georgia',
    fontSize: 24,
    lineHeight: 31,
    color: '#1f2230',
    fontWeight: '700',
  },
  announcementCard: {
    backgroundColor: '#f7f7f8',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 4,
  },
  announcementCardPrimary: {
    borderWidth: 1,
    borderColor: '#aab8df',
  },
  announcementPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eceef4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  announcementTextWrap: {
    flex: 1,
  },
  announcementMessage: {
    fontSize: 17,
    lineHeight: 22,
    color: '#272a37',
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    lineHeight: 16,
    color: '#6f7385',
  },
  studyCard: {
    marginTop: 8,
    backgroundColor: '#f7f7f8',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 4,
  },
  studyIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f1dfd0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studyTextWrap: {
    flex: 1,
  },
  studyTitle: {
    fontSize: 18,
    lineHeight: 22,
    color: '#2a2d3b',
    fontWeight: '600',
  },
  studySubtext: {
    fontSize: 13,
    lineHeight: 18,
    color: '#7b7e8d',
  },
  progressWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderColor: '#f08d41',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#2a2d3b',
    fontWeight: '600',
  },
  bottomBuffer: {
    height: 88,
  },
});