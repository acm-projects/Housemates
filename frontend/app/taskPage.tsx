import { Ionicons } from '@expo/vector-icons'
import { apiDelete, apiGetWithBody, apiPost, apiPut, extractDynamoItems } from '@/utils/api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { API_HOUSE_ID, API_USER_ID } from './apiConfig'
import { AppBottomNav } from '../components/app-bottom-nav'
import { GlassCard } from '@/components/glass-ui'
import { GradientBackground } from './gradientBg'

type Filter = 'All' | 'Weekly' | 'In Progress' | 'Completed'
type TaskItem = {
  id: string
  note: string
  title: string
  time: string
  status: 'Done' | 'Urgent' | 'To-do'
  accent: string
  dateKey: string
  done: boolean
}

const COLORS = {
  bg: '#F7F3F2',
  title: '#EC8575',
  active: '#EC8575',
  inactive: '#000000',
  textDark: '#000000',
  textMuted: '#5E5A58',
  white: '#FFFFFF',
  glass: 'rgba(255,255,255,0.18)',
  border: 'rgba(255,255,255,0.35)',
}

const DAY = 24 * 60 * 60 * 1000

function addDays(base: Date, days: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days)
}

function toDateKey(date: Date) {
  return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-')
}

function getDateOptions(today: Date) {
  return [-2, -1, 0, 1, 2].map((offset) => {
    const date = addDays(today, offset)
    return {
      id: toDateKey(date),
      month: date.toLocaleString('en-US', { month: 'short' }),
      day: `${date.getDate()}`,
      weekday: date.toLocaleString('en-US', { weekday: 'short' }),
    }
  })
}

function buildSeedTasks(today: Date): TaskItem[] {
  return [
    {
      id: '1',
      note: 'Grocery shopping app design',
      title: 'Market Research',
      time: '10:00 AM',
      status: 'Done',
      accent: COLORS.title,
      dateKey: toDateKey(today),
      done: true,
    },
    {
      id: '2',
      note: 'Recurring',
      title: 'Competitive Analysis',
      time: '12:00 PM',
      status: 'Urgent',
      accent: COLORS.title,
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: '3',
      note: 'Uber Eats redesign challenge',
      title: 'Create Low Fidelity Wireframe',
      time: '07:00 PM',
      status: 'To-do',
      accent: COLORS.title,
      dateKey: toDateKey(today),
      done: false,
    },
  ]
}

function statusColors(status: TaskItem['status']) {
  if (status === 'Done') return { background: '#EC8575', color: COLORS.white }
  if (status === 'Urgent') return { background: '#000000', color: COLORS.white }
  return { background: 'rgba(0,0,0,0.78)', color: COLORS.white }
}

export default function TaskPage() {
  const router = useRouter()
  const today = useMemo(() => new Date(), [])
  const dateOptions = useMemo(() => getDateOptions(today), [today])
  const [selectedDateId, setSelectedDateId] = useState(toDateKey(today))
  const [tasks] = useState(() => buildSeedTasks(today))
  const [filter] = useState<Filter>('All')
  const [choreIdToDelete, setChoreIdToDelete] = useState('')
  const [apiBusy, setApiBusy] = useState(false)
  const [choresHousePreview, setChoresHousePreview] = useState('(not loaded)')
  const [choresUserPreview, setChoresUserPreview] = useState('(not loaded)')
  const [updateChoreId, setUpdateChoreId] = useState('')
  const [updateChoreName, setUpdateChoreName] = useState('')

  const loadChoresFromApi = useCallback(async () => {
    setApiBusy(true)
    try {
      const [houseRes, userRes] = await Promise.all([
        apiGetWithBody('/chores/house', { house_id: API_HOUSE_ID }),
        apiGetWithBody('/chores/user', { user_id: API_USER_ID }),
      ])
      const houseItems = extractDynamoItems(houseRes)
      setChoresHousePreview(JSON.stringify(houseItems.map((c) => ({ chore_id: c.chore_id, name: c.name, house_id: c.house_id })), null, 2).slice(0, 2000))
      const userItems = extractDynamoItems(userRes)
      setChoresUserPreview(JSON.stringify(userItems.map((c) => ({ chore_id: c.chore_id, name: c.name, current_user: c.current_user })), null, 2).slice(0, 2000))
    } catch (e) {
      Alert.alert('Load chores failed', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setApiBusy(false)
    }
  }, [])

  useEffect(() => {
    loadChoresFromApi()
  }, [loadChoresFromApi])

  async function updateChoreViaApi() {
    const chore_id = updateChoreId.trim()
    const name = updateChoreName.trim()
    if (!chore_id || !name) {
      Alert.alert('PUT /chores', 'Enter chore_id and new name.')
      return
    }
    setApiBusy(true)
    try {
      await apiPut('/chores', { chore_id, house_id: API_HOUSE_ID, name })
      Alert.alert('Updated', 'Chore saved.')
      await loadChoresFromApi()
    } catch (e) {
      Alert.alert('Update chore failed', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setApiBusy(false)
    }
  }

  async function createChoreViaApi() {
    setApiBusy(true)
    try {
      const res = (await apiPost('/chores', {
        house_id: API_HOUSE_ID,
        name: 'Chore from tasks',
        description: 'Created from the tasks screen',
        rotation: [API_USER_ID],
        rrule: 'FREQ=WEEKLY',
      })) as { chore_id?: string; message?: string }
      Alert.alert('Chore created', res.chore_id ?? res.message ?? 'OK')
      await loadChoresFromApi()
    } catch (e) {
      Alert.alert('Create chore failed', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setApiBusy(false)
    }
  }

  async function deleteChoreViaApi() {
    if (!choreIdToDelete.trim()) {
      Alert.alert('Missing id', 'Enter a chore_id to delete.')
      return
    }
    setApiBusy(true)
    try {
      await apiDelete('/chores', { house_id: API_HOUSE_ID, chore_id: choreIdToDelete.trim() })
      Alert.alert('Deleted', 'Chore removed.')
      setChoreIdToDelete('')
      await loadChoresFromApi()
    } catch (e) {
      Alert.alert('Delete chore failed', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setApiBusy(false)
    }
  }

  const visibleTasks = useMemo(() => {
    const selectedDate = new Date(selectedDateId)
    return tasks.filter((task) => {
      const taskDate = new Date(task.dateKey)
      const isSameDate = task.dateKey === selectedDateId
      const isInWeek = Math.abs(taskDate.getTime() - selectedDate.getTime()) <= 6 * DAY
      if (filter === 'Weekly') return isInWeek
      if (filter === 'In Progress') return isSameDate && !task.done
      if (filter === 'Completed') return isSameDate && task.done
      return isSameDate
    })
  }, [filter, selectedDateId, tasks])

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.replace('/')} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={22} color={COLORS.inactive} />
            </Pressable>
            <View>
              <Text style={styles.headerTitle}>Today&apos;s Tasks</Text>
              <Text style={styles.headerSubtitle}>Keep your house on track</Text>
            </View>
            <View style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.inactive} />
            </View>
          </View>

          <FlatList
            data={dateOptions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isActive = item.id === selectedDateId
              return (
                <Pressable onPress={() => setSelectedDateId(item.id)}>
                  <BlurView intensity={26} tint="light" style={[styles.dateCard, isActive && styles.dateCardActive]}>
                    <Text style={[styles.dateText, isActive && styles.dateTextActive]}>{item.month}</Text>
                    <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>{item.day}</Text>
                    <Text style={[styles.dateText, isActive && styles.dateTextActive]}>{item.weekday}</Text>
                  </BlurView>
                </Pressable>
              )
            }}
          />

          <View style={styles.cardsWrap}>
            {visibleTasks.map((task) => {
              const statusStyle = statusColors(task.status)
              return (
                <GlassCard key={task.id} style={{ marginBottom: 14 }}>
                  <Text style={styles.taskNote}>{task.note}</Text>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.timeText}>{task.time}</Text>
                    <View style={[styles.statusPill, { backgroundColor: statusStyle.background }]}>
                      <Text style={{ color: statusStyle.color, fontWeight: '700' }}>{task.status}</Text>
                    </View>
                  </View>
                </GlassCard>
              )
            })}
          </View>

          <GlassCard style={{ marginBottom: 14 }}>
            <Text style={styles.sectionLabel}>GET /chores/house · GET /chores/user</Text>
            <Pressable style={styles.primaryButton} onPress={loadChoresFromApi} disabled={apiBusy}>
              {apiBusy ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryButtonText}>Refresh chore lists</Text>}
            </Pressable>
            <View style={styles.fetchBox}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 160 }}>
                <Text style={styles.fetchBoxTitle}>House</Text>
                <Text style={styles.fetchBoxText}>{choresHousePreview}</Text>
                <Text style={[styles.fetchBoxTitle, { marginTop: 8 }]}>Current user</Text>
                <Text style={styles.fetchBoxText}>{choresUserPreview}</Text>
              </ScrollView>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>PUT /chores</Text>
            <TextInput style={styles.apiInput} placeholder="chore_id" placeholderTextColor={COLORS.textMuted} value={updateChoreId} onChangeText={setUpdateChoreId} autoCapitalize="none" />
            <TextInput style={styles.apiInput} placeholder="new name" placeholderTextColor={COLORS.textMuted} value={updateChoreName} onChangeText={setUpdateChoreName} />
            <Pressable style={styles.primaryButton} onPress={updateChoreViaApi} disabled={apiBusy}>
              <Text style={styles.primaryButtonText}>Update chore</Text>
            </Pressable>
          </GlassCard>

          <GlassCard style={{ marginBottom: 14 }}>
            <Text style={styles.sectionLabel}>Chores API</Text>
            <Pressable style={styles.primaryButton} onPress={createChoreViaApi} disabled={apiBusy}>
              <Text style={styles.primaryButtonText}>Create sample chore</Text>
            </Pressable>
            <TextInput style={styles.apiInput} placeholder="chore_id to delete" placeholderTextColor={COLORS.textMuted} value={choreIdToDelete} onChangeText={setChoreIdToDelete} autoCapitalize="none" />
            <Pressable style={styles.dangerButton} onPress={deleteChoreViaApi} disabled={apiBusy}>
              <Text style={styles.primaryButtonText}>Delete chore</Text>
            </Pressable>
          </GlassCard>
        </ScrollView>

        <Pressable style={styles.fab} onPress={() => router.push('/AddTask')}>
          <Ionicons name="add" size={26} color={COLORS.white} />
        </Pressable>
        <AppBottomNav />
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 24, color: COLORS.title, fontWeight: '800', textAlign: 'center' },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },
  dateCard: {
    width: 82,
    paddingVertical: 14,
    borderRadius: 22,
    marginRight: 10,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateCardActive: { backgroundColor: 'rgba(236,133,117,0.24)', borderColor: 'rgba(236,133,117,0.5)' },
  dateText: { color: COLORS.textDark, fontSize: 12 },
  dateDay: { color: COLORS.textDark, fontSize: 20, fontWeight: '800', marginVertical: 4 },
  dateTextActive: { color: COLORS.title },
  cardsWrap: { marginTop: 16 },
  taskNote: { color: COLORS.textMuted },
  taskTitle: { fontSize: 17, color: COLORS.textDark, fontWeight: '700', marginVertical: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeText: { color: COLORS.textDark, fontWeight: '600' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.title, letterSpacing: 1, marginBottom: 12 },
  apiInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  primaryButton: { height: 52, borderRadius: 18, backgroundColor: COLORS.title, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  dangerButton: { height: 52, borderRadius: 18, backgroundColor: '#B0524A', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  primaryButtonText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  fetchBox: {
    marginTop: 2,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  fetchBoxTitle: { fontSize: 12, fontWeight: '800', color: COLORS.title, marginBottom: 6 },
  fetchBoxText: { fontSize: 11, color: COLORS.textDark },
  fab: {
    position: 'absolute',
    bottom: 94,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.title,
    alignItems: 'center',
    justifyContent: 'center',
  },
})