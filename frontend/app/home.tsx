import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiDelete, apiGetWithBody, apiPost, apiPut, extractDynamoItems } from '@/utils/api';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_HOUSE_ID, API_USER_ID } from './apiConfig';
import { AppBottomNav } from './AppBottomNav';

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
  announcement_id?: string;
};

const seedAnnouncements: Announcement[] = [
  { id: 'a-1', message: "I'm gonna have guests over at 7PM...", time: '1:09 PM' },
  { id: 'a-2', message: 'Does anyone have any lettuce?', time: '2:40 AM' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [announcementsOpen, setAnnouncementsOpen] = useState(true);
  const [announcementFeed, setAnnouncementFeed] = useState<Announcement[]>(seedAnnouncements);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [announcementBusy, setAnnouncementBusy] = useState(false);
  const [updateAnnouncementId, setUpdateAnnouncementId] = useState('');
  const [updateAnnouncementText, setUpdateAnnouncementText] = useState('');

  const loadAnnouncements = useCallback(async () => {
    setAnnouncementBusy(true);
    try {
      const data = await apiGetWithBody('/announcements', { house_id: API_HOUSE_ID });
      const rows = extractDynamoItems(data);
      if (rows.length === 0) return;
      const mapped: Announcement[] = rows.map((it) => {
        const announcement_id = String(it.announcement_id ?? '');
        const text = String(it.text ?? '');
        const dateRaw = it.date;
        const time =
          typeof dateRaw === 'string'
            ? new Date(dateRaw).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            : '';
        return {
          id: announcement_id || `a-${text.slice(0, 8)}`,
          announcement_id: announcement_id || undefined,
          message: text,
          time: time || '—',
        };
      });
      setAnnouncementFeed(mapped);
    } catch (e) {
      Alert.alert('Load announcements failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAnnouncementBusy(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  async function saveAnnouncementUpdate() {
    const announcement_id = updateAnnouncementId.trim();
    const text = updateAnnouncementText.trim();
    if (!announcement_id || !text) {
      Alert.alert('Update', 'Enter announcement_id and new text.');
      return;
    }
    setAnnouncementBusy(true);
    try {
      await apiPut('/announcements', {
        house_id: API_HOUSE_ID,
        announcement_id,
        text,
        date: new Date().toISOString(),
      });
      Alert.alert('Updated', 'Announcement saved.');
      await loadAnnouncements();
    } catch (e) {
      Alert.alert('Update failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAnnouncementBusy(false);
    }
  }

  async function postAnnouncement() {
    const text = newAnnouncementText.trim();
    if (!text) {
      Alert.alert('Empty message', 'Type something to post.');
      return;
    }
    setAnnouncementBusy(true);
    try {
      const res = (await apiPost('/announcements', {
        house_id: API_HOUSE_ID,
        user_id: API_USER_ID,
        text,
      })) as { announcement_id?: string; message?: string };
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      setAnnouncementFeed((prev) => [
        {
          id: res.announcement_id ?? `local-${Date.now()}`,
          announcement_id: res.announcement_id,
          message: text,
          time,
        },
        ...prev,
      ]);
      setNewAnnouncementText('');
      Alert.alert('Posted', res.message ?? 'Announcement created');
      await loadAnnouncements();
    } catch (e) {
      Alert.alert('Post failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAnnouncementBusy(false);
    }
  }

  async function removeAnnouncement(item: Announcement) {
    if (!item.announcement_id) {
      Alert.alert(
        'Local only',
        'This row was not created via the API, so there is no announcement_id to delete.',
      );
      return;
    }
    setAnnouncementBusy(true);
    try {
      await apiDelete('/announcements', {
        house_id: API_HOUSE_ID,
        announcement_id: item.announcement_id,
      });
      setAnnouncementFeed((prev) => prev.filter((a) => a.id !== item.id));
      await loadAnnouncements();
    } catch (e) {
      Alert.alert('Delete failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAnnouncementBusy(false);
    }
  }

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
        <View style={styles.announcementsHeader}>
          <Pressable
            style={styles.announcementsHeaderToggle}
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
          <Pressable style={styles.refreshAnnouncementsHit} onPress={loadAnnouncements} hitSlop={8}>
            <Ionicons name="refresh-outline" size={22} color={COLORS.secondary} />
          </Pressable>
        </View>

        {announcementsOpen && (
          <>
            <View style={styles.composeRow}>
              <TextInput
                style={styles.composeInput}
                placeholder="New announcement…"
                placeholderTextColor={COLORS.textMuted}
                value={newAnnouncementText}
                onChangeText={setNewAnnouncementText}
                multiline
              />
              <Pressable
                style={styles.composeButton}
                onPress={postAnnouncement}
                disabled={announcementBusy}
              >
                {announcementBusy ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.composeButtonText}>Post</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.updateRow}>
              <Text style={styles.updateLabel}>PUT /announcements</Text>
              <TextInput
                style={styles.updateInput}
                placeholder="announcement_id"
                placeholderTextColor={COLORS.textMuted}
                value={updateAnnouncementId}
                onChangeText={setUpdateAnnouncementId}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.updateInput}
                placeholder="New text"
                placeholderTextColor={COLORS.textMuted}
                value={updateAnnouncementText}
                onChangeText={setUpdateAnnouncementText}
              />
              <Pressable
                style={styles.updateButton}
                onPress={saveAnnouncementUpdate}
                disabled={announcementBusy}
              >
                <Text style={styles.composeButtonText}>Save update</Text>
              </Pressable>
            </View>

            {announcementFeed.map((item, index) => (
              <Pressable
                key={item.id}
                style={[styles.announcementCard, index === 0 && styles.announcementCardPrimary]}
                onPress={() => {
                  if (item.announcement_id) {
                    setUpdateAnnouncementId(item.announcement_id);
                    setUpdateAnnouncementText(item.message);
                  }
                }}
                onLongPress={() => removeAnnouncement(item)}
              >
                <View style={styles.announcementAvatar}>
                  <Text style={styles.avatarText}>?</Text>
                </View>
                <View style={styles.announcementTextWrap}>
                  <Text style={styles.announcementMessage} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={styles.announcementTime}>
                    {item.time}
                    {item.announcement_id ? ' · tap to edit ids · long-press delete' : ''}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  announcementsHeaderToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  announcementsTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  refreshAnnouncementsHit: { padding: 4, marginRight: 4 },
  updateRow: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: `${COLORS.cardBg}cc`,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${COLORS.border}50`,
    gap: 8,
  },
  updateLabel: { fontSize: 11, fontWeight: '700', color: COLORS.secondary },
  updateInput: {
    borderWidth: 1,
    borderColor: `${COLORS.border}60`,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    color: COLORS.textDark,
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  composeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 12,
  },
  composeInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${COLORS.border}60`,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    color: COLORS.textDark,
    fontSize: 15,
  },
  composeButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
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
