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
import { API_HOUSE_ID, API_USER_ID } from './apiConfig'
import { AppBottomNav } from '../components/app-bottom-nav'

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
  bg: '#FDFDFF',
  cardBg: '#D1DAE6',
  primary: '#0A2239',
  secondary: '#176087',
  accent: '#ADB6C4',
  textDark: '#132E32',
  textMuted: '#98AAC5',
  border: '#3590F3',
  white: '#FFFFFF',
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
      accent: COLORS.accent,
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: '2',
      note: 'Recurring',
      title: 'Competitive Analysis',
      time: '12:00 PM',
      status: 'Urgent',
      accent: COLORS.accent,
      dateKey: toDateKey(today),
      done: false,
    },
    {
      id: '3',
      note: 'Uber Eats redesign challange',
      title: 'Create Low-fidelity Wireframe',
      time: '07:00 PM',
      status: 'To-do',
      accent: COLORS.accent,
      dateKey: toDateKey(today),
      done: false,
    },
  ]
}

function statusColors(status: TaskItem['status']) {
  if (status === 'Done') return { background: COLORS.secondary, color: COLORS.white }
  if (status === 'Urgent') return { background: COLORS.border, color: COLORS.white }
  return { background: COLORS.primary, color: COLORS.white }
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconButton: {
    padding: 6,
  },
  title: {
    fontSize: 22,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  dateCard: {
    backgroundColor: COLORS.cardBg,
    padding: 12,
    borderRadius: 14,
    marginRight: 10,
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
  },
  dateText: {
    color: COLORS.textDark,
  },
  activeText: {
    color: COLORS.white,
  },
  cardsWrap: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  taskCard: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  taskNote: {
    color: COLORS.textMuted,
  },
  taskTitle: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
    marginVertical: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: COLORS.secondary,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  apiRow: {
    marginTop: 20,
    padding: 12,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  apiLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  apiInput: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    color: COLORS.textDark,
  },
  apiButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  apiButtonDanger: { backgroundColor: '#B0524A' },
  apiButtonText: { color: COLORS.white, fontWeight: '700' },
  fetchBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    maxHeight: 160,
  },
  fetchBoxTitle: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, marginBottom: 6 },
  fetchBoxText: { fontSize: 11, color: COLORS.textDark },
})

export default function TaskPage() {
  const router = useRouter()
  const today = useMemo(() => new Date(), [])
  const dateOptions = useMemo(() => getDateOptions(today), [today])
  const [selectedDateId, setSelectedDateId] = useState(toDateKey(today))
  const [tasks, setTasks] = useState(() => buildSeedTasks(today))
  const [filter, setFilter] = useState<Filter>('All')
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
      setChoresHousePreview(
        JSON.stringify(
          houseItems.map((c) => ({
            chore_id: c.chore_id,
            name: c.name,
            house_id: c.house_id,
          })),
          null,
          2,
        ).slice(0, 2000),
      )
      const userItems = extractDynamoItems(userRes)
      setChoresUserPreview(
        JSON.stringify(
          userItems.map((c) => ({
            chore_id: c.chore_id,
            name: c.name,
            current_user: c.current_user,
          })),
          null,
          2,
        ).slice(0, 2000),
      )
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
      await apiDelete('/chores', {
        house_id: API_HOUSE_ID,
        chore_id: choreIdToDelete.trim(),
      })
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.replace('/')} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={23} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.title}>Today's Tasks</Text>
          <Ionicons name="notifications" size={22} color={COLORS.primary} />
        </View>

        <FlatList
          data={dateOptions}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isActive = item.id === selectedDateId
            return (
              <Pressable
                onPress={() => setSelectedDateId(item.id)}
                style={[styles.dateCard, isActive && styles.dateCardActive]}
              >
                <Text style={[styles.dateText, isActive && styles.activeText]}>{item.month}</Text>
                <Text style={[styles.dateText, isActive && styles.activeText]}>{item.day}</Text>
                <Text style={[styles.dateText, isActive && styles.activeText]}>{item.weekday}</Text>
              </Pressable>
            )
          }}
        />

        <View style={styles.cardsWrap}>
          {visibleTasks.map((task) => {
            const statusStyle = statusColors(task.status)
            return (
              <View key={task.id} style={styles.taskCard}>
                <Text style={styles.taskNote}>{task.note}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.timeText}>{task.time}</Text>
                  <View style={[styles.statusPill, { backgroundColor: statusStyle.background }]}>
                    <Text style={{ color: statusStyle.color }}>{task.status}</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>

        <View style={styles.apiRow}>
          <Text style={styles.apiLabel}>GET /chores/house · GET /chores/user</Text>
          <Pressable style={styles.apiButton} onPress={loadChoresFromApi} disabled={apiBusy}>
            {apiBusy ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.apiButtonText}>Refresh chore lists</Text>
            )}
          </Pressable>
          <ScrollView style={styles.fetchBox} nestedScrollEnabled>
            <Text style={styles.fetchBoxTitle}>House</Text>
            <Text style={styles.fetchBoxText}>{choresHousePreview}</Text>
            <Text style={[styles.fetchBoxTitle, { marginTop: 8 }]}>Current user</Text>
            <Text style={styles.fetchBoxText}>{choresUserPreview}</Text>
          </ScrollView>
          <Text style={styles.apiLabel}>PUT /chores</Text>
          <TextInput
            style={styles.apiInput}
            placeholder="chore_id"
            placeholderTextColor={COLORS.textMuted}
            value={updateChoreId}
            onChangeText={setUpdateChoreId}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.apiInput}
            placeholder="new name"
            placeholderTextColor={COLORS.textMuted}
            value={updateChoreName}
            onChangeText={setUpdateChoreName}
          />
          <Pressable style={styles.apiButton} onPress={updateChoreViaApi} disabled={apiBusy}>
            <Text style={styles.apiButtonText}>Update chore</Text>
          </Pressable>
        </View>

        <View style={styles.apiRow}>
          <Text style={styles.apiLabel}>Chores API (uses apiConfig house / user ids)</Text>
          <Pressable
            style={styles.apiButton}
            onPress={createChoreViaApi}
            disabled={apiBusy}
          >
            {apiBusy ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.apiButtonText}>POST /chores — create sample chore</Text>
            )}
          </Pressable>
          <TextInput
            style={styles.apiInput}
            placeholder="chore_id to delete"
            placeholderTextColor={COLORS.textMuted}
            value={choreIdToDelete}
            onChangeText={setChoreIdToDelete}
            autoCapitalize="none"
          />
          <Pressable
            style={[styles.apiButton, styles.apiButtonDanger]}
            onPress={deleteChoreViaApi}
            disabled={apiBusy}
          >
            <Text style={styles.apiButtonText}>DELETE /chores</Text>
          </Pressable>
        </View>
      </ScrollView>
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/AddTask')}
      >
        <Ionicons name="add" size={26} color={COLORS.white} />
      </Pressable>
      <AppBottomNav />
    </SafeAreaView>
  )
}
