import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { HomeHeader } from '@/components/HomeHeader';
import { TaskCard } from '@/components/TaskCard';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { StudyProgressCard } from '@/components/StudyProgressCard';
import { colors } from '@/constants/theme';
import { useFadeIn } from '@/hooks/useFadeIn';

const initialTasks = [
  { id: 'task-1', label: 'Task 1', done: false },
  { id: 'task-2', label: 'Task 2', done: false },
  { id: 'expense-1', label: 'Expense 1', done: false },
  { id: 'expense-2', label: 'Expense 2', done: false },
  { id: 'shopping-1', label: 'Shopping 1', done: false },
  { id: 'event-today', label: 'Event Today', done: false },
];

const announcementItems = [
  {
    id: 'a-1',
    message: "I'm gonna have guests over at 7PM...",
    time: '1:09 PM',
  },
  {
    id: 'a-2',
    message: 'Does anyone have any lettuce?',
    time: '2:40 AM',
  },
];

export default function HomeScreen() {
  const introAnim = useFadeIn(20);
  const listAnim = useFadeIn(140);
  const [tasks, setTasks] = useState(initialTasks);
  const [announcementsOpen, setAnnouncementsOpen] = useState(true);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const toggleAnnouncement = (id: string) => {
    setSelectedAnnouncementId((prev) => (prev === id ? null : id));
  };

  return (
    <LinearGradient
      colors={['#e9e9ee', '#f0f0f6', '#e4e5ec']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.page}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={introAnim}>
            <HomeHeader />

            <Text style={styles.today}>Today</Text>
            <TaskCard items={tasks} onToggle={toggleTask} />

            <Pressable
              style={styles.announcementRow}
              onPress={() => setAnnouncementsOpen((prev) => !prev)}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.announcements}>
                Announcements
              </Text>
              <Feather
                name={announcementsOpen ? 'chevron-down' : 'chevron-right'}
                size={28}
                color="#111"
              />
            </Pressable>
          </Animated.View>

          <Animated.View style={listAnim}>
            {announcementsOpen &&
              announcementItems.map((item) => (
                <AnnouncementCard
                  key={item.id}
                  message={item.message}
                  time={item.time}
                  isActive={selectedAnnouncementId === item.id}
                  onPress={() => toggleAnnouncement(item.id)}
                />
              ))}

            <StudyProgressCard progressPercent={87} />
            <View style={{ height: 88 }} />
          </Animated.View>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 0,
    paddingBottom: 8,
  },
  today: {
    color: colors.subtitle,
    fontFamily: 'Georgia',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 2,
  },
  announcementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  announcements: {
    flex: 1,
    color: colors.title,
    fontFamily: 'Georgia',
    fontSize: 34,
    fontWeight: '700',
  },
});
