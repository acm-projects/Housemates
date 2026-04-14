import { Ionicons } from '@expo/vector-icons';
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
import { extractDynamoItems, housematesApi } from '@/lib/housematesApi';
import { GradientBackground } from './gradientBg';
import { GlassCard, GLASS_COLORS } from '@/components/glass-ui';
import { AppBottomNav } from '../components/app-bottom-nav';
import { API_HOUSE_ID, API_USER_ID } from './apiConfig';

type Announcement = {
  id: string;
  message: string;
  time: string;
  dateLabel: string;
  announcement_id?: string;
};

type TaskPreview = {
  id: string;
  title: string;
};

const initialTasks: TaskPreview[] = [
  { id: '1', title: 'Task 1' },
  { id: '2', title: 'Task 2' },
];

const seedAnnouncements: Announcement[] = [
  {
    id: 'seed-1',
    message: 'Welcome to Housemates',
    time: '9:00 AM',
    dateLabel: 'Apr 13',
  },
];

function firstTwoLines(items: string[], fallback: [string, string]): [string, string] {
  const a = items[0] ?? fallback[0];
  const b = items[1] ?? fallback[1];
  return [a, b];
}

export default function HomeScreen() {
  const router = useRouter();

  const [userName, setUserName] = useState('Roomie');
  const [tasks, setTasks] = useState<TaskPreview[]>(initialTasks);
  const [announcementsOpen, setAnnouncementsOpen] = useState(true);
  const [announcementFeed, setAnnouncementFeed] = useState<Announcement[]>(seedAnnouncements);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [announcementBusy, setAnnouncementBusy] = useState(false);
  const [homeBusy, setHomeBusy] = useState(true);

  const [todayLines, setTodayLines] = useState<[string, string]>(
    firstTwoLines(initialTasks.map((task) => task.title), ['Task 1', 'Task 2'])
  );
  const [shoppingLines, setShoppingLines] = useState<[string, string]>(['Item 1', 'Item 2']);
  const [expenseLines, setExpenseLines] = useState<[string, string]>(['Expense 1', 'Expense 2']);

  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await housematesApi.getAnnouncements(API_HOUSE_ID);
      const rows = extractDynamoItems(data);

      if (rows.length === 0) {
        setAnnouncementFeed(seedAnnouncements);
        return;
      }

      const mapped: Announcement[] = rows.map((it) => {
        const announcement_id = String(it.announcement_id ?? '');
        const text = String(it.text ?? '');
        const dateRaw = it.date;
        const d = typeof dateRaw === 'string' ? new Date(dateRaw) : new Date();

        return {
          id: announcement_id || `a-${text.slice(0, 8)}`,
          announcement_id: announcement_id || undefined,
          message: text,
          time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
      });

      setAnnouncementFeed(mapped);
    } catch {
      setAnnouncementFeed(seedAnnouncements);
    }
  }, []);

  const loadHomeData = useCallback(async () => {
    setHomeBusy(true);

    try {
      const [userRes, choreRes, expRes, listsRes] = await Promise.all([
        housematesApi.getUser(API_USER_ID).catch(() => null),
        housematesApi.getChoresByHouse(API_HOUSE_ID).catch(() => null),
        housematesApi.getExpensesByHouse({ house_id: API_HOUSE_ID }).catch(() => null),
        housematesApi.getShoppingListsByHouse(API_HOUSE_ID).catch(() => null),
      ]);

      const userRows = extractDynamoItems(userRes ?? {});
      const u = userRows[0];

      if (u) {
        const n = String(u.name ?? u.given_name ?? u.email ?? '').trim();
        if (n) setUserName(n.split('@')[0] ?? n);
      }

      const choreRows = extractDynamoItems(choreRes ?? {});
      const choreNames = choreRows.map((c) => String(c.name ?? c.description ?? 'Chore'));

      if (choreNames.length > 0) {
        setTasks(choreNames.map((name, index) => ({ id: String(index + 1), title: name })));
        setTodayLines(firstTwoLines(choreNames, ['Task 1', 'Task 2']));
      } else {
        setTasks(initialTasks);
        setTodayLines(firstTwoLines(initialTasks.map((task) => task.title), ['Task 1', 'Task 2']));
      }

      const expenses = extractDynamoItems(expRes ?? {}).map((e) => String(e.name ?? 'Expense'));
      setExpenseLines(firstTwoLines(expenses, ['Expense 1', 'Expense 2']));

      const lists = extractDynamoItems(listsRes ?? {});
      const firstListId = lists[0] ? String(lists[0].list_id ?? '') : '';

      if (firstListId) {
        try {
          const itemsRes = await housematesApi.getShoppingItems(firstListId);
          const names = extractDynamoItems(itemsRes ?? {}).map((x) => String(x.name ?? 'Item'));
          setShoppingLines(firstTwoLines(names, ['Item 1', 'Item 2']));
        } catch {
          setShoppingLines(['Item 1', 'Item 2']);
        }
      } else {
        setShoppingLines(['Item 1', 'Item 2']);
      }

      await loadAnnouncements();
    } catch (e) {
      console.warn('Home load partial failure', e);
    } finally {
      setHomeBusy(false);
    }
  }, [loadAnnouncements]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  async function postAnnouncement() {
    const text = newAnnouncementText.trim();

    if (!text) {
      Alert.alert('Empty message', 'Type something to post.');
      return;
    }

    setAnnouncementBusy(true);

    try {
      const res = (await housematesApi.createAnnouncement({
        house_id: API_HOUSE_ID,
        user_id: API_USER_ID,
        text,
      })) as { announcement_id?: string; message?: string };

      const now = new Date();

      setAnnouncementFeed((prev) => [
        {
          id: res.announcement_id ?? `local-${Date.now()}`,
          announcement_id: res.announcement_id,
          message: text,
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          dateLabel: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        },
        ...prev,
      ]);

      setNewAnnouncementText('');
      await loadAnnouncements();
    } catch (e) {
      Alert.alert('Post failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAnnouncementBusy(false);
    }
  }

  async function removeAnnouncement(item: Announcement) {
    if (!item.announcement_id) return;

    setAnnouncementBusy(true);

    try {
      await housematesApi.deleteAnnouncement({
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

  const taskPreviewLines = firstTwoLines(
    tasks.map((task) => task.title),
    ['Task 1', 'Task 2']
  );

  const quickAccess = [
    {
      key: 'today',
      title: 'Today',
      lines: taskPreviewLines,
      route: '/taskPage' as const,
    },
    {
      key: 'shopping',
      title: 'Shopping',
      lines: shoppingLines,
      route: '/ShoppingList' as const,
    },
    {
      key: 'expenses',
      title: 'Expenses',
      lines: expenseLines,
      route: '/expenses' as const,
    },
    {
      key: 'calendar',
      title: 'Calendar',
      lines: ['View schedule', 'Month & week'] as [string, string],
      route: '/calendar' as const,
    },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.avatar} onPress={() => router.push('/settings')}>
            <Ionicons name="person" size={22} color={GLASS_COLORS.textDark} />
          </Pressable>

          <Text style={styles.welcomeSerif} numberOfLines={1}>
            Welcome Home, {userName}
          </Text>

          <Pressable style={styles.bellWrap} hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={GLASS_COLORS.textDark} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>

        {homeBusy ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={GLASS_COLORS.title} />
          </View>
        ) : null}

        <GlassCard style={styles.heroCard}>
          <View style={styles.heroInner} />
        </GlassCard>

        <Text style={styles.sectionSerif}>Quick Access:</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
        >
          {quickAccess.map((qa) => (
            <Pressable key={qa.key} onPress={() => router.push(qa.route)} style={styles.quickCardWrap}>
              <GlassCard style={styles.quickCard}>
                <Text style={styles.quickTitle}>{qa.title}</Text>

                <View style={styles.quickLine}>
                  <Ionicons name="ellipse-outline" size={18} color={GLASS_COLORS.textMuted} />
                  <Text style={styles.quickLineText}>{qa.lines[0]}</Text>
                </View>

                <View style={styles.quickLine}>
                  <Ionicons name="ellipse-outline" size={18} color={GLASS_COLORS.textMuted} />
                  <Text style={styles.quickLineText}>{qa.lines[1]}</Text>
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionSerif, { marginTop: 8, marginBottom: 0 }]}>Announcements:</Text>
          <Pressable onPress={() => setAnnouncementsOpen((prev) => !prev)}>
            <Text style={styles.toggleText}>{announcementsOpen ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>

        {announcementsOpen ? (
          <>
            <GlassCard style={styles.composeGlass}>
              <TextInput
                style={styles.composeInput}
                placeholder="New announcement…"
                placeholderTextColor={GLASS_COLORS.textMuted}
                value={newAnnouncementText}
                onChangeText={setNewAnnouncementText}
                multiline
              />
              <Pressable style={styles.postBtn} onPress={postAnnouncement} disabled={announcementBusy}>
                {announcementBusy ? (
                  <ActivityIndicator color={GLASS_COLORS.white} size="small" />
                ) : (
                  <Text style={styles.postBtnText}>Post</Text>
                )}
              </Pressable>
            </GlassCard>

            {announcementFeed.map((item) => {
              const title = item.message.split('\n')[0]?.slice(0, 48) || 'Update';
              const sub = item.message.split('\n')[1]?.slice(0, 40) || item.message.slice(0, 36);

              return (
                <Pressable key={item.id} onLongPress={() => removeAnnouncement(item)}>
                  <GlassCard style={styles.announceCard}>
                    <View style={styles.announceThumb}>
                      <Ionicons name="image-outline" size={22} color={GLASS_COLORS.textMuted} />
                    </View>

                    <View style={styles.announceBody}>
                      <Text style={styles.announceTitle}>{title}</Text>
                      <Text style={styles.announceSub} numberOfLines={1}>
                        {sub}
                      </Text>
                      <Text style={styles.announceMeta}>
                        {item.dateLabel} · {item.time}
                      </Text>
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </>
        ) : null}

        <View style={{ height: 120 }} />
      </ScrollView>

      <AppBottomNav />
  </SafeAreaView>
  </GradientBackground>
);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GLASS_COLORS.bg },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  loadingRow: { paddingVertical: 8, alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: GLASS_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSerif: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: GLASS_COLORS.textDark,
    textAlign: 'center',
  },
  bellWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GLASS_COLORS.title,
    borderWidth: 1,
    borderColor: '#fff',
  },
  heroCard: {
    marginBottom: 18,
    minHeight: 120,
    padding: 0,
  },
  heroInner: {
    minHeight: 112,
    borderRadius: 18,
    margin: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sectionSerif: {
    fontSize: 20,
    fontWeight: '800',
    color: GLASS_COLORS.textDark,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: GLASS_COLORS.title,
  },
  quickRow: {
    gap: 12,
    paddingBottom: 6,
  },
  quickCardWrap: {
    marginRight: 4,
  },
  quickCard: {
    width: 168,
    minHeight: 120,
  },
  quickTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: GLASS_COLORS.textDark,
    marginBottom: 10,
  },
  quickLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  quickLineText: {
    fontSize: 14,
    color: GLASS_COLORS.textDark,
    flex: 1,
  },
  composeGlass: {
    marginBottom: 12,
    gap: 10,
  },
  composeInput: {
    minHeight: 44,
    maxHeight: 90,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: GLASS_COLORS.textDark,
    fontSize: 15,
  },
  postBtn: {
    alignSelf: 'flex-end',
    backgroundColor: GLASS_COLORS.title,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  postBtnText: {
    color: GLASS_COLORS.white,
    fontWeight: '700',
  },
  announceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 12,
  },
  announceThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GLASS_COLORS.border,
  },
  announceBody: {
    flex: 1,
  },
  announceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GLASS_COLORS.textDark,
  },
  announceSub: {
    fontSize: 13,
    color: GLASS_COLORS.textMuted,
    marginTop: 2,
  },
  announceMeta: {
    fontSize: 11,
    color: GLASS_COLORS.textMuted,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
});