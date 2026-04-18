import { Ionicons } from '@expo/vector-icons'
import { apiGetWithBody, extractDynamoItems } from '@/utils/api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import {
  Pressable, SafeAreaView, ScrollView,
  StyleSheet, Text, View,
} from 'react-native'
import { API_HOUSE_ID, API_USER_ID } from './apiConfig'
import { AppBottomNav } from './AppBottomNav'
import { GradientBackground } from './gradientBg'
import { taskStore, Task } from './store'

type Filter = 'All' | 'Weekly' | 'In Progress' | 'Completed'
const FILTERS: Filter[] = ['All', 'Weekly', 'In Progress', 'Completed']

const C = {
  active: '#EC8575',
  textDark: '#000000',
  textMuted: '#8b7b6b',
  glass: 'rgba(255,255,255,0.65)',
  glassBorder: 'rgba(255,255,255,0.55)',
}

function addDays(base: Date, n: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n)
}
function toDateKey(d: Date) {
  return [d.getFullYear(), `${d.getMonth()+1}`.padStart(2,'0'), `${d.getDate()}`.padStart(2,'0')].join('-')
}
function getDateOptions(today: Date) {
  return [-2,-1,0,1,2].map(offset => {
    const d = addDays(today, offset)
    return {
      id: toDateKey(d),
      month: d.toLocaleString('en-US',{month:'short'}),
      day: `${d.getDate()}`,
      weekday: d.toLocaleString('en-US',{weekday:'short'}),
    }
  })
}
function statusColors(status: Task['status']) {
  if (status==='Done')   return {bg:'#b8e0d2', text:'#1a1a1a'}
  if (status==='Urgent') return {bg:'#f5a08c', text:'#1a1a1a'}
  return                         {bg:'#c9b8e8', text:'#1a1a1a'}
}

export default function TaskPage() {
  const router = useRouter()
  const today  = useMemo(() => new Date(), [])
  const dateOptions = useMemo(() => getDateOptions(today), [today])
  const [selectedDateId, setSelectedDateId] = useState(toDateKey(today))
  const [tasks, setTasks] = useState<Task[]>(() => taskStore.getTasks())
  const [filter, setFilter] = useState<Filter>('All')

  useEffect(() => taskStore.subscribe(() => setTasks([...taskStore.getTasks()])), [])

  // Load chores silently in background — no UI panel
  const loadChores = useCallback(async () => {
    try {
      await Promise.all([
        apiGetWithBody('/chores/house', {house_id: API_HOUSE_ID}),
        apiGetWithBody('/chores/user',  {user_id:  API_USER_ID}),
      ])
    } catch { /* silent */ }
  }, [])
  useEffect(() => { loadChores() }, [loadChores])

  const DAY = 24*60*60*1000
  const visibleTasks = useMemo(() => {
    const selDate = new Date(selectedDateId)
    return tasks.filter(task => {
      const sameDay = task.dateKey === selectedDateId
      const inWeek  = Math.abs(new Date(task.dateKey).getTime() - selDate.getTime()) <= 6*DAY
      if (filter==='Weekly')      return inWeek
      if (filter==='In Progress') return sameDay && !task.done
      if (filter==='Completed')   return sameDay &&  task.done
      return sameDay
    })
  }, [filter, selectedDateId, tasks])

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>

        {/* Header */}
        <View style={s.topRow}>
          <Pressable style={({pressed})=>[s.iconBtn, pressed&&s.pressed]} onPress={()=>router.back()}>
            <Ionicons name="chevron-back" size={22} color={C.textDark}/>
          </Pressable>
          <Text style={s.title}>Today's Tasks</Text>
          <Pressable style={({pressed})=>[s.iconBtn, pressed&&s.pressed]}>
            <Ionicons name="notifications" size={22} color={C.textDark}/>
            <View style={s.dot}/>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Date strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dateRow}>
            {dateOptions.map(d => {
              const on = d.id === selectedDateId
              return (
                <Pressable key={d.id} onPress={()=>setSelectedDateId(d.id)}
                  style={({pressed})=>[s.datePill, on?s.datePillOn:s.datePillOff, pressed&&s.pressed]}>
                  <Text style={[s.dateSm, on&&s.dateTextOn]}>{d.month}</Text>
                  <Text style={[s.dateLg, on&&s.dateTextOn]}>{d.day}</Text>
                  <Text style={[s.dateSm, on&&s.dateTextOn]}>{d.weekday}</Text>
                </Pressable>
              )
            })}
          </ScrollView>

          {/* Filter pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {FILTERS.map(f => (
              <Pressable key={f} onPress={()=>setFilter(f)}
                style={({pressed})=>[s.pill, filter===f&&s.pillOn, pressed&&s.pressed]}>
                <Text style={[s.pillText, filter===f&&s.pillTextOn]}>{f}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Task cards — glass style */}
          <View style={s.cardsWrap}>
            {visibleTasks.length===0 ? (
              <View style={s.empty}>
                <Text style={s.emptyTitle}>No tasks for this day</Text>
                <Text style={s.emptySub}>Tap "Add Task" to add one</Text>
              </View>
            ) : visibleTasks.map(task => {
              const sc = statusColors(task.status)
              return (
                <View key={task.id} style={s.glassCard}>
                  <View style={s.cardTop}>
                    <Text style={s.cardNote}>{task.note || 'Task'}</Text>
                    <View style={[s.swatch,{backgroundColor:task.color}]}/>
                  </View>
                  <Text style={s.cardTitle}>{task.title}</Text>
                  <View style={s.cardBottom}>
                    <View style={s.timeRow}>
                      <Ionicons name="time-outline" size={14} color={C.textMuted}/>
                      <Text style={s.timeText}>{task.time}</Text>
                    </View>
                    <View style={s.statusRow}>
                      <View style={[s.statusPill,{backgroundColor:sc.bg}]}>
                        <Text style={[s.statusText,{color:sc.text}]}>{task.status}</Text>
                      </View>
                      <Pressable onPress={()=>taskStore.toggleDone(task.id)}
                        style={[s.doneCircle, task.done?s.doneOn:s.doneOff]}>
                        {task.done&&<Text style={s.doneCheck}>✓</Text>}
                      </Pressable>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>

          <View style={{height:110}}/>
        </ScrollView>

        {/* Add Task FAB */}
        <Pressable style={({pressed})=>[s.fab, pressed&&s.fabPressed]} onPress={()=>router.push('/AddTask')}>
          <View style={s.fabIcon}><Ionicons name="add" size={20} color="#1a1a1a"/></View>
          <Text style={s.fabText}>Add Task</Text>
        </Pressable>

        <AppBottomNav/>
      </SafeAreaView>
    </GradientBackground>
  )
}

const s = StyleSheet.create({
  safe:      {flex:1, backgroundColor:'transparent'},
  topRow:    {flexDirection:'row', alignItems:'center', marginTop:10, marginBottom:8, paddingHorizontal:16},
  iconBtn:   {width:36, height:36, alignItems:'center', justifyContent:'center', position:'relative'},
  dot:       {position:'absolute',top:6,right:6,width:8,height:8,borderRadius:4,backgroundColor:C.active,borderWidth:1,borderColor:'#fff'},
  title:     {flex:1, textAlign:'center', fontSize:22, fontWeight:'700', color:C.textDark},
  pressed:   {opacity:0.6},
  scroll:    {paddingHorizontal:16, paddingBottom:24},
  dateRow:   {gap:8, paddingVertical:10},
  datePill:  {width:70, borderRadius:16, alignItems:'center', paddingVertical:10, borderWidth:1},
  datePillOn:{backgroundColor:C.active, borderColor:C.active},
  datePillOff:{backgroundColor:'rgba(255,255,255,0.6)', borderColor:'rgba(255,255,255,0.4)'},
  dateSm:    {fontSize:12, color:'#1a1a1a', opacity:0.8},
  dateLg:    {fontSize:20, fontWeight:'700', color:'#1a1a1a'},
  dateTextOn:{color:'#fff', opacity:1},
  filterRow: {gap:8, paddingBottom:14},
  pill:      {paddingHorizontal:18, paddingVertical:9, borderRadius:22, backgroundColor:'rgba(255,255,255,0.65)', borderWidth:1, borderColor:'rgba(255,255,255,0.5)'},
  pillOn:    {backgroundColor:C.active, borderColor:C.active},
  pillText:  {fontSize:14, fontWeight:'600', color:C.textDark},
  pillTextOn:{color:'#fff'},
  cardsWrap: {gap:12},
  glassCard: {backgroundColor:C.glass, borderRadius:18, borderWidth:1, borderColor:C.glassBorder, padding:16, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2},
  cardTop:   {flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8},
  cardNote:  {fontSize:13, color:C.textMuted, flex:1, paddingRight:8},
  swatch:    {width:28, height:28, borderRadius:8},
  cardTitle: {fontSize:18, fontWeight:'600', color:'#1a1a1a', marginBottom:10},
  cardBottom:{flexDirection:'row', justifyContent:'space-between', alignItems:'center'},
  timeRow:   {flexDirection:'row', alignItems:'center', gap:6},
  timeText:  {fontSize:13, color:C.textMuted},
  statusRow: {flexDirection:'row', alignItems:'center', gap:8},
  statusPill:{paddingHorizontal:10, paddingVertical:4, borderRadius:999},
  statusText:{fontSize:12, fontWeight:'600'},
  doneCircle:{width:20, height:20, borderRadius:10, borderWidth:2, alignItems:'center', justifyContent:'center'},
  doneOn:    {backgroundColor:'#b8e0d2', borderColor:'#b8e0d2'},
  doneOff:   {borderColor:'#c9b8e8'},
  doneCheck: {color:'#fff', fontSize:12, fontWeight:'700'},
  empty:     {paddingVertical:60, alignItems:'center', gap:8},
  emptyTitle:{color:C.textMuted, fontSize:16, fontWeight:'600'},
  emptySub:  {color:C.textMuted, fontSize:13},
  fab:       {position:'absolute', right:16, bottom:90, flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(236,133,117,0.88)', borderRadius:999, paddingHorizontal:16, paddingVertical:10},
  fabIcon:   {width:30, height:30, borderRadius:15, backgroundColor:'rgba(255,255,255,0.35)', alignItems:'center', justifyContent:'center'},
  fabPressed:{backgroundColor:'#c96d5e'},
  fabText:   {color:'#1a1a1a', fontWeight:'600'},
})
