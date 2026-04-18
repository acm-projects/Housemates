import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBottomNav } from "./AppBottomNav";
import { GradientBackground } from "./gradientBg";
import { taskStore, Task } from "./store";

const COLORS = {
  bg: '#F7F3F2',
  textDark: '#000000',
  textMuted: '#8b7b6b',
  active: '#EC8575',
  cardBg: 'rgba(255,255,255,0.75)',
}

function toDateKey(date: Date) {
  return [date.getFullYear(), `${date.getMonth()+1}`.padStart(2,'0'), `${date.getDate()}`.padStart(2,'0')].join('-')
}
function addDays(base: Date, days: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days)
}
function getDateOptions(today: Date) {
  return [-2,-1,0,1,2].map(offset => {
    const date = addDays(today, offset)
    return {
      id: toDateKey(date),
      month: date.toLocaleString('en-US',{month:'short'}),
      day: `${date.getDate()}`,
      weekday: date.toLocaleString('en-US',{weekday:'short'}),
    }
  })
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function statusColors(status: Task['status']) {
  if (status === 'Done') return { bgColor: '#b8e0d2', textColor: '#1a1a1a' }
  if (status === 'Urgent') return { bgColor: '#f5a08c', textColor: '#1a1a1a' }
  return { bgColor: '#c9b8e8', textColor: '#1a1a1a' }
}

export default function CalendarPage() {
  const router = useRouter()
  const today = useMemo(() => new Date(), [])
  const dateOptions = useMemo(() => getDateOptions(today), [today])
  const [selectedDateId, setSelectedDateId] = useState(toDateKey(today))
  const [tasks, setTasks] = useState<Task[]>(() => taskStore.getTasks())
  const [viewMode, setViewMode] = useState<'Day View' | 'Month View'>('Day View')

  // Month view state
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())

  // Subscribe to task store changes
  useEffect(() => {
    const unsub = taskStore.subscribe(() => {
      setTasks([...taskStore.getTasks()])
    })
    return unsub
  }, [])

  const toggleDone = (id: string) => taskStore.toggleDone(id)

  const visibleTasks = useMemo(() => {
    return tasks.filter(t => t.dateKey === selectedDateId)
  }, [tasks, selectedDateId])

  // Month view helpers
  const getDaysInMonth = (y: number, m: number) => new Date(y, m+1, 0).getDate()
  const getFirstDay = (y: number, m: number) => new Date(y, m, 1).getDay()
  const hasTasksOnDay = (y: number, m: number, d: number) => {
    const key = [y, `${m+1}`.padStart(2,'0'), `${d}`.padStart(2,'0')].join('-')
    return tasks.some(t => t.dateKey === key)
  }

  return (
    <GradientBackground>
      <SafeAreaView style={st.safeArea}>

        {/* Header */}
        <View style={st.topRow}>
          <View style={st.topIconBtn} />
          <View style={st.titleWrap}><Text style={st.title}>Calendar</Text></View>
          <TouchableOpacity style={st.topIconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Date strip (always shown) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.dateRow}>
          {dateOptions.map(date => {
            const isActive = date.id === selectedDateId
            return (
              <Pressable
                key={date.id}
                onPress={() => { setSelectedDateId(date.id); setViewMode('Day View') }}
                style={[st.datePill, isActive ? st.datePillActive : st.datePillInactive]}
              >
                <Text style={[st.dateMonth, isActive && st.dateTextActive]}>{date.month}</Text>
                <Text style={[st.dateDay, isActive && st.dateTextActive]}>{date.day}</Text>
                <Text style={[st.dateWeekday, isActive && st.dateTextActive]}>{date.weekday}</Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* View toggle */}
        <View style={st.modeRow}>
          <Pressable
            style={[st.modeBtn, viewMode==='Day View' && st.modeBtnActive]}
            onPress={() => setViewMode('Day View')}
          >
            <Text style={[st.modeBtnText, viewMode==='Day View' && st.modeBtnTextActive]}>Day View</Text>
          </Pressable>
          <Pressable
            style={[st.modeBtn, viewMode==='Month View' && st.modeBtnActive]}
            onPress={() => setViewMode('Month View')}
          >
            <Text style={[st.modeBtnText, viewMode==='Month View' && st.modeBtnTextActive]}>Month View</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scrollContent}>

          {/* ── MONTH VIEW ── */}
          {viewMode === 'Month View' && (
            <View style={st.monthCard}>
              <View style={st.calNav}>
                <TouchableOpacity style={st.calNavBtn} onPress={() => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1) }}>
                  <Text style={st.calNavArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={st.calMonthLabel}>{MONTH_NAMES[calMonth]} {calYear}</Text>
                <TouchableOpacity style={st.calNavBtn} onPress={() => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1) }}>
                  <Text style={st.calNavArrow}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={st.weekRow}>
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                  <Text key={d} style={st.weekDay}>{d}</Text>
                ))}
              </View>
              <View style={st.calGrid}>
                {Array.from({length: getFirstDay(calYear,calMonth)},(_,i) => (
                  <View key={`e${i}`} style={st.calCellEmpty}/>
                ))}
                {Array.from({length: getDaysInMonth(calYear,calMonth)},(_,i) => {
                  const day=i+1
                  const dKey=[calYear,`${calMonth+1}`.padStart(2,'0'),`${day}`.padStart(2,'0')].join('-')
                  const isSelected=dKey===selectedDateId
                  const hasTasks=hasTasksOnDay(calYear,calMonth,day)
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[st.calCell, isSelected && st.calCellActive]}
                      onPress={() => { setSelectedDateId(dKey); setViewMode('Day View') }}
                    >
                      <Text style={[st.calCellText, isSelected && st.calCellTextActive]}>{day}</Text>
                      {hasTasks && <View style={[st.taskDot, isSelected && st.taskDotActive]}/>}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}

          {/* ── DAY VIEW tasks ── */}
          {viewMode === 'Day View' && (
            <>
              {visibleTasks.length === 0 ? (
                <View style={st.emptyState}>
                  <Text style={st.emptyText}>No tasks for this day</Text>
                  <Text style={st.emptySubtext}>Tap "+ Add Task" to create one</Text>
                </View>
              ) : (
                <View style={st.tasksWrap}>
                  {visibleTasks.map(task => {
                    const sc = statusColors(task.status)
                    return (
                      <View key={task.id} style={st.taskCard}>
                        <View style={st.taskTopRow}>
                          <Text style={st.taskNote}>{task.note || 'Task'}</Text>
                          <View style={[st.colorSwatch, {backgroundColor: task.color}]}/>
                        </View>
                        <Text style={st.taskTitle}>{task.title}</Text>
                        <View style={st.taskBottomRow}>
                          <View style={st.timeRow}>
                            <Ionicons name="time-outline" size={16} color={COLORS.textMuted}/>
                            <Text style={st.timeText}>{task.time}</Text>
                          </View>
                          <View style={st.statusRow}>
                            <View style={[st.statusPill,{backgroundColor:sc.bgColor}]}>
                              <Text style={[st.statusText,{color:sc.textColor}]}>{task.status}</Text>
                            </View>
                            <Pressable
                              onPress={() => toggleDone(task.id)}
                              style={[st.doneCircle, task.done ? st.doneCircleOn : st.doneCircleOff]}
                            >
                              {task.done && <Text style={st.doneCheck}>✓</Text>}
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}
            </>
          )}

          {/* Show tasks for selected day also below month view */}
          {viewMode === 'Month View' && visibleTasks.length > 0 && (
            <View style={{marginTop:16}}>
              <Text style={st.selectedDayLabel}>
                Tasks for {new Date(selectedDateId+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}
              </Text>
              {visibleTasks.map(task => {
                const sc = statusColors(task.status)
                return (
                  <View key={task.id} style={st.taskCard}>
                    <Text style={st.taskTitle}>{task.title}</Text>
                    <View style={st.taskBottomRow}>
                      <View style={st.timeRow}>
                        <Ionicons name="time-outline" size={16} color={COLORS.textMuted}/>
                        <Text style={st.timeText}>{task.time}</Text>
                      </View>
                      <View style={[st.statusPill,{backgroundColor:sc.bgColor}]}>
                        <Text style={[st.statusText,{color:sc.textColor}]}>{task.status}</Text>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          <View style={{height:100}}/>
        </ScrollView>

        {/* FAB */}
        <Pressable style={st.fab} onPress={() => router.push('/AddTask')}>
          <View style={st.fabIcon}>
            <Ionicons name="add" size={20} color="#1a1a1a"/>
          </View>
          <Text style={st.fabText}>Add Task</Text>
        </Pressable>

        <AppBottomNav />
      </SafeAreaView>
    </GradientBackground>
  )
}

const st = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:'transparent'},
  topRow:{flexDirection:'row',alignItems:'center',marginTop:10,marginBottom:8,paddingHorizontal:16},
  topIconBtn:{width:36,height:36,alignItems:'center',justifyContent:'center'},
  titleWrap:{flex:1,alignItems:'center'},
  title:{fontSize:22,fontWeight:'700',color:COLORS.textDark},
  dateRow:{gap:8,paddingVertical:10,paddingHorizontal:16},
  datePill:{width:70,borderRadius:16,alignItems:'center',paddingVertical:10,borderWidth:1},
  datePillActive:{backgroundColor:COLORS.active,borderColor:COLORS.active},
  datePillInactive:{backgroundColor:'rgba(255,255,255,0.6)',borderColor:'rgba(255,255,255,0.4)'},
  dateMonth:{fontSize:12,color:'#1a1a1a',opacity:0.8},
  dateDay:{fontSize:20,fontWeight:'700',color:'#1a1a1a'},
  dateWeekday:{fontSize:12,color:'#1a1a1a',opacity:0.8},
  dateTextActive:{color:'#FFFFFF',opacity:1},
  modeRow:{flexDirection:'row',gap:10,paddingHorizontal:16,marginBottom:12},
  modeBtn:{flex:1,paddingVertical:9,borderRadius:14,backgroundColor:'rgba(255,255,255,0.55)',alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.4)'},
  modeBtnActive:{backgroundColor:COLORS.active,borderColor:COLORS.active},
  modeBtnText:{fontSize:14,fontWeight:'600',color:COLORS.textDark},
  modeBtnTextActive:{color:'#fff'},
  scrollContent:{paddingHorizontal:16},
  // Month view
  monthCard:{backgroundColor:'rgba(255,255,255,0.75)',borderRadius:20,padding:16,marginBottom:8},
  calNav:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},
  calNavBtn:{width:36,height:36,alignItems:'center',justifyContent:'center'},
  calNavArrow:{fontSize:24,color:COLORS.active,fontWeight:'700'},
  calMonthLabel:{fontSize:17,fontWeight:'700',color:COLORS.textDark},
  weekRow:{flexDirection:'row',justifyContent:'space-around',marginBottom:8},
  weekDay:{width:38,textAlign:'center',fontSize:10,fontWeight:'700',color:COLORS.textMuted},
  calGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'flex-start'},
  calCellEmpty:{width:38,height:44,margin:1},
  calCell:{width:38,height:44,margin:1,borderRadius:10,alignItems:'center',justifyContent:'center'},
  calCellActive:{backgroundColor:COLORS.active},
  calCellText:{fontSize:14,color:COLORS.textDark,fontWeight:'500'},
  calCellTextActive:{color:'#fff',fontWeight:'700'},
  taskDot:{width:5,height:5,borderRadius:3,backgroundColor:COLORS.active,marginTop:2},
  taskDotActive:{backgroundColor:'#fff'},
  selectedDayLabel:{fontSize:14,fontWeight:'700',color:COLORS.textMuted,marginBottom:10},
  // Day view
  tasksWrap:{gap:12},
  taskCard:{backgroundColor:'rgba(255,255,255,0.7)',borderRadius:16,borderWidth:1,borderColor:'rgba(255,255,255,0.4)',padding:14},
  taskTopRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8},
  taskNote:{fontSize:13,color:COLORS.textMuted,flex:1,paddingRight:8},
  colorSwatch:{width:28,height:28,borderRadius:8},
  taskTitle:{fontSize:18,fontWeight:'600',color:'#1a1a1a',marginBottom:10},
  taskBottomRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  timeRow:{flexDirection:'row',alignItems:'center',gap:6},
  timeText:{fontSize:13,color:COLORS.textMuted},
  statusRow:{flexDirection:'row',alignItems:'center',gap:8},
  statusPill:{paddingHorizontal:10,paddingVertical:4,borderRadius:999},
  statusText:{fontSize:12,fontWeight:'600'},
  doneCircle:{width:20,height:20,borderRadius:10,borderWidth:2,alignItems:'center',justifyContent:'center'},
  doneCircleOn:{backgroundColor:'#b8e0d2',borderColor:'#b8e0d2'},
  doneCircleOff:{borderColor:'#c9b8e8'},
  doneCheck:{color:'#FFFFFF',fontSize:12,fontWeight:'700'},
  emptyState:{paddingVertical:60,alignItems:'center',gap:8},
  emptyText:{color:COLORS.textMuted,fontSize:16,fontWeight:'600'},
  emptySubtext:{color:COLORS.textMuted,fontSize:13},
  fab:{position:'absolute',right:16,bottom:92,flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'rgba(236,133,117,0.92)',borderRadius:999,paddingHorizontal:16,paddingVertical:10},
  fabIcon:{width:30,height:30,borderRadius:15,backgroundColor:'rgba(255,255,255,0.35)',alignItems:'center',justifyContent:'center'},
  fabText:{color:'#1a1a1a',fontWeight:'600'},
})
