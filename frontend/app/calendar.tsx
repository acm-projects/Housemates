import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Pressable, SafeAreaView, ScrollView, StyleSheet,
  Text, View, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard, GLASS_COLORS } from "@/components/glass-ui";
import { AppBottomNav } from "./AppBottomNav";
import { GradientBackground } from "./gradientBg";
import { taskStore, Task } from "./store";
import { FONTS, PALETTE } from "./fonts";

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function toDateKey(d: Date) {
  return [d.getFullYear(), `${d.getMonth()+1}`.padStart(2,'0'), `${d.getDate()}`.padStart(2,'0')].join('-')
}
function addDays(base: Date, n: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n)
}
function getDateOptions(today: Date) {
  return [-2,-1,0,1,2].map(offset => {
    const d = addDays(today, offset)
    return {
      id:      toDateKey(d),
      month:   d.toLocaleString('en-US', { month: 'short' }),
      day:     `${d.getDate()}`,
      weekday: d.toLocaleString('en-US', { weekday: 'short' }),
    }
  })
}

function statusColors(status: Task['status']) {
  if (status === 'Done')   return { bg: '#b8e0d2', text: '#1a1a1a' }
  if (status === 'Urgent') return { bg: '#f5a08c', text: '#1a1a1a' }
  return                          { bg: '#c9b8e8', text: '#1a1a1a' }
}

export default function CalendarPage() {
  const router      = useRouter()
  const today       = useMemo(() => new Date(), [])
  const dateOptions = useMemo(() => getDateOptions(today), [today])
  const [selectedId, setSelectedId] = useState(toDateKey(today))
  const [tasks,      setTasks]      = useState<Task[]>(() => taskStore.getTasks())
  const [viewMode,   setViewMode]   = useState<'Day View' | 'Month View'>('Day View')
  const [calMonth,   setCalMonth]   = useState(today.getMonth())
  const [calYear,    setCalYear]    = useState(today.getFullYear())

  useEffect(() => taskStore.subscribe(() => setTasks([...taskStore.getTasks()])), [])

  const visibleTasks = useMemo(
    () => tasks.filter(t => t.dateKey === selectedId),
    [tasks, selectedId]
  )

  const daysIn   = (y: number, m: number) => new Date(y, m+1, 0).getDate()
  const firstDay = (y: number, m: number) => new Date(y, m, 1).getDay()
  const hasTask  = (y: number, m: number, d: number) => {
    const k = [y, `${m+1}`.padStart(2,'0'), `${d}`.padStart(2,'0')].join('-')
    return tasks.some(t => t.dateKey === k)
  }

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>

        {/* Header */}
        <View style={s.topRow}>
          <View style={s.iconBtn} />
          <Text style={s.title}>Calendar</Text>
          <Pressable style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}>
            <Ionicons name="notifications" size={22} color={PALETTE.textDark} />
            <View style={s.dot} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Date strip — tall cards like screenshot ── */}
          <View style={s.dateStrip}>
            {dateOptions.map(d => {
              const on = d.id === selectedId
              return (
                <Pressable
                  key={d.id}
                  onPress={() => { setSelectedId(d.id); setViewMode('Day View') }}
                  style={({ pressed }) => [s.dateTall, on ? s.dateTallOn : s.dateTallOff, pressed && s.pressed]}
                >
                  <Text style={[s.dateSm,  on && s.dateTextOn]}>{d.month}</Text>
                  <Text style={[s.dateLg,  on && s.dateTextOn]}>{d.day}</Text>
                  <Text style={[s.dateSm,  on && s.dateTextOn]}>{d.weekday}</Text>
                </Pressable>
              )
            })}
          </View>

          {/* ── View toggle — rectangular buttons ── */}
          <View style={s.modeRow}>
            <Pressable
              style={({ pressed }) => [s.modeBtn, viewMode==='Day View' && s.modeBtnOn, pressed && s.pressed]}
              onPress={() => setViewMode('Day View')}
            >
              <Text style={[s.modeBtnText, viewMode==='Day View' && s.modeBtnTextOn]}>Day View</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.modeBtn, viewMode==='Month View' && s.modeBtnOn, pressed && s.pressed]}
              onPress={() => setViewMode('Month View')}
            >
              <Text style={[s.modeBtnText, viewMode==='Month View' && s.modeBtnTextOn]}>Month View</Text>
            </Pressable>
          </View>

          {/* ── Month View ── */}
          {viewMode === 'Month View' && (
            <GlassCard style={s.monthCard}>
              <View style={s.calNav}>
                <TouchableOpacity style={s.calNavBtn}
                  onPress={() => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1) }}>
                  <Text style={s.calArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={s.calMonthLbl}>{MONTH_NAMES[calMonth]} {calYear}</Text>
                <TouchableOpacity style={s.calNavBtn}
                  onPress={() => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1) }}>
                  <Text style={s.calArrow}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={s.weekRow}>
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                  <Text key={d} style={s.weekDay}>{d}</Text>
                ))}
              </View>
              <View style={s.calGrid}>
                {Array.from({length: firstDay(calYear,calMonth)}, (_,i) => (
                  <View key={`e${i}`} style={s.calCellBlank} />
                ))}
                {Array.from({length: daysIn(calYear,calMonth)}, (_,i) => {
                  const day = i+1
                  const key = [calYear,`${calMonth+1}`.padStart(2,'0'),`${day}`.padStart(2,'0')].join('-')
                  const sel = key === selectedId
                  return (
                    <TouchableOpacity key={day}
                      style={[s.calCell, sel && s.calCellOn]}
                      onPress={() => { setSelectedId(key); setViewMode('Day View') }}>
                      <Text style={[s.calCellTxt, sel && s.calCellTxtOn]}>{day}</Text>
                      {hasTask(calYear,calMonth,day) && (
                        <View style={[s.taskDot, sel && s.taskDotOn]} />
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </GlassCard>
          )}

          {/* ── Day View tasks ── */}
          {viewMode === 'Day View' && (
            <View style={s.cardsWrap}>
              {visibleTasks.length === 0 ? (
                <GlassCard style={s.emptyCard}>
                  <Text style={s.emptyTitle}>No tasks for this day</Text>
                  <Text style={s.emptySub}>Tap "Add Task" to add one</Text>
                </GlassCard>
              ) : visibleTasks.map(task => {
                const sc = statusColors(task.status)
                return (
                  <GlassCard key={task.id} style={s.taskCard}>
                    <View style={s.taskTopRow}>
                      <Text style={s.taskNote}>{task.note || 'Task'}</Text>
                      <View style={[s.swatch, { backgroundColor: task.color }]} />
                    </View>
                    <Text style={s.taskTitle}>{task.title}</Text>
                    <View style={s.taskBottom}>
                      <View style={s.timeRow}>
                        <Ionicons name="time-outline" size={14} color={PALETTE.textMuted} />
                        <Text style={s.timeText}>{task.time}</Text>
                      </View>
                      <View style={s.statusRow}>
                        <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                          <Text style={[s.statusText, { color: sc.text }]}>{task.status}</Text>
                        </View>
                        <Pressable
                          onPress={() => taskStore.toggleDone(task.id)}
                          style={[s.doneCircle, task.done ? s.doneOn : s.doneOff]}
                        >
                          {task.done && <Text style={s.doneCheck}>✓</Text>}
                        </Pressable>
                      </View>
                    </View>
                  </GlassCard>
                )
              })}
            </View>
          )}

          {/* Tasks under Month View for selected day */}
          {viewMode === 'Month View' && visibleTasks.length > 0 && (
            <View style={[s.cardsWrap, { marginTop: 16 }]}>
              <Text style={s.selectedDayLbl}>
                {new Date(selectedId + 'T12:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </Text>
              {visibleTasks.map(task => {
                const sc = statusColors(task.status)
                return (
                  <GlassCard key={task.id} style={s.taskCard}>
                    <Text style={s.taskTitle}>{task.title}</Text>
                    <View style={s.taskBottom}>
                      <View style={s.timeRow}>
                        <Ionicons name="time-outline" size={14} color={PALETTE.textMuted} />
                        <Text style={s.timeText}>{task.time}</Text>
                      </View>
                      <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                        <Text style={[s.statusText, { color: sc.text }]}>{task.status}</Text>
                      </View>
                    </View>
                  </GlassCard>
                )
              })}
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Add Task FAB — rectangular */}
        <Pressable
          style={({ pressed }) => [s.fab, pressed && s.fabPressed]}
          onPress={() => router.push('/AddTask')}
        >
          <View style={s.fabIcon}><Ionicons name="add" size={20} color="#1a1a1a" /></View>
          <Text style={s.fabText}>Add Task</Text>
        </Pressable>

        <AppBottomNav />
      </SafeAreaView>
    </GradientBackground>
  )
}

const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: 'transparent' },
  topRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 12, paddingHorizontal: 16 },
  iconBtn:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dot:      { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: PALETTE.active, borderWidth: 1, borderColor: '#fff' },
  title:    { flex: 1, textAlign: 'center', fontSize: 26, fontWeight: '700', color: PALETTE.textDark, fontFamily: FONTS.title },
  pressed:  { opacity: 0.6 },
  scroll:   { paddingHorizontal: 16, paddingBottom: 24 },

  // ── Date strip — tall cards ──────────────────────────────────────────────
  dateStrip: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dateTall:  {
    flex: 1, borderRadius: 18, alignItems: 'center',
    paddingTop: 14, paddingBottom: 14, minHeight: 110,
    justifyContent: 'space-between', borderWidth: 1,
  },
  dateTallOn:  { backgroundColor: PALETTE.active,             borderColor: PALETTE.active },
  dateTallOff: { backgroundColor: PALETTE.glass,              borderColor: PALETTE.glassBorder },
  dateSm:    { fontSize: 12, color: PALETTE.textDark, fontFamily: FONTS.body },
  dateLg:    { fontSize: 26, fontWeight: '700', color: PALETTE.textDark, fontFamily: FONTS.title },
  dateTextOn:{ color: '#fff' },

  // ── View toggle ──────────────────────────────────────────────────────────
  modeRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  modeBtn:       { flex: 1, height: 48, borderRadius: 14, backgroundColor: PALETTE.glass, borderWidth: 1, borderColor: PALETTE.glassBorder, alignItems: 'center', justifyContent: 'center' },
  modeBtnOn:     { backgroundColor: PALETTE.active, borderColor: PALETTE.active },
  modeBtnText:   { fontSize: 15, fontWeight: '600', color: PALETTE.textDark, fontFamily: FONTS.body },
  modeBtnTextOn: { color: '#fff' },

  // ── Month calendar ───────────────────────────────────────────────────────
  monthCard:    { padding: 16, marginBottom: 8 },
  calNav:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  calNavBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  calArrow:     { fontSize: 24, color: PALETTE.active, fontWeight: '700' },
  calMonthLbl:  { fontSize: 17, fontWeight: '700', color: PALETTE.textDark, fontFamily: FONTS.title },
  weekRow:      { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  weekDay:      { width: 36, textAlign: 'center', fontSize: 10, fontWeight: '700', color: PALETTE.textMuted, fontFamily: FONTS.body },
  calGrid:      { flexDirection: 'row', flexWrap: 'wrap' },
  calCellBlank: { width: 36, height: 44, margin: 2 },
  calCell:      { width: 36, height: 44, margin: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  calCellOn:    { backgroundColor: PALETTE.active },
  calCellTxt:   { fontSize: 14, color: PALETTE.textDark, fontFamily: FONTS.body },
  calCellTxtOn: { color: '#fff', fontWeight: '700' },
  taskDot:      { width: 5, height: 5, borderRadius: 3, backgroundColor: PALETTE.active, marginTop: 2 },
  taskDotOn:    { backgroundColor: '#fff' },
  selectedDayLbl: { fontSize: 14, fontWeight: '700', color: PALETTE.textMuted, marginBottom: 10, fontFamily: FONTS.body },

  // ── Task cards ───────────────────────────────────────────────────────────
  cardsWrap:  { gap: 12 },
  taskCard:   { padding: 16 },
  taskTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  taskNote:   { fontSize: 13, color: PALETTE.textMuted, flex: 1, paddingRight: 8, fontFamily: FONTS.body },
  swatch:     { width: 28, height: 28, borderRadius: 8 },
  taskTitle:  { fontSize: 18, fontWeight: '600', color: PALETTE.textDark, marginBottom: 10, fontFamily: FONTS.titleReg },
  taskBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText:   { fontSize: 13, color: PALETTE.textMuted, fontFamily: FONTS.body },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '600', fontFamily: FONTS.body },
  doneCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  doneOn:     { backgroundColor: '#b8e0d2', borderColor: '#b8e0d2' },
  doneOff:    { borderColor: '#c9b8e8' },
  doneCheck:  { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyCard:  { padding: 40, alignItems: 'center', gap: 8 },
  emptyTitle: { color: PALETTE.textMuted, fontSize: 16, fontWeight: '600', fontFamily: FONTS.titleReg },
  emptySub:   { color: PALETTE.textMuted, fontSize: 13, fontFamily: FONTS.body },

  // ── FAB — rectangular ────────────────────────────────────────────────────
  fab: {
    position: 'absolute', right: 16, bottom: 90,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(236,133,117,0.90)',
    borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14,
  },
  fabIcon:    { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  fabPressed: { backgroundColor: PALETTE.activeDark },
  fabText:    { color: '#1a1a1a', fontWeight: '600', fontSize: 15, fontFamily: FONTS.body },
})
