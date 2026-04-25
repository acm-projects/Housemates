import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator, Alert, Pressable, SafeAreaView,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native'
import { extractDynamoItems, housematesApi } from '@/lib/housematesApi'
import { GradientBackground } from './gradientBg'
import { GlassCard, GLASS_COLORS } from '@/components/glass-ui'
import { AppBottomNav } from './AppBottomNav'
import { API_HOUSE_ID, API_USER_ID } from './apiConfig'
import { announcementStore, Announcement, taskStore } from './store'
import { FONTS, PALETTE } from './fonts'

type TaskPreview = { id: string; title: string }
const initialTasks: TaskPreview[] = [{ id:'1', title:'Task 1' }, { id:'2', title:'Expense 1' }]
function firstTwo(items: string[], fb: [string,string]): [string,string] {
  return [items[0] ?? fb[0], items[1] ?? fb[1]]
}

// Default grey avatar silhouette
function DefaultAvatar({ size = 46 }: { size?: number }) {
  return (
    <View style={[av.wrap, { width:size, height:size, borderRadius:size/2 }]}>
      <View style={[av.circle, { width:size*0.38, height:size*0.38, borderRadius:size*0.19 }]} />
      <View style={[av.body,   { width:size*0.62, height:size*0.38, borderRadius:size*0.19 }]} />
    </View>
  )
}
const av = StyleSheet.create({
  wrap:   { backgroundColor:'#C8C8C8', alignItems:'center', justifyContent:'flex-end', overflow:'hidden', position:'relative' },
  circle: { backgroundColor:'#E8E8E8', position:'absolute', top:'18%' as any },
  body:   { backgroundColor:'#E8E8E8', position:'absolute', bottom:0 },
})

// Simple progress ring using border trick
function ProgressRing({ pct }: { pct: number }) {
  const SIZE = 80, STROKE = 7
  return (
    <View style={{ width:SIZE, height:SIZE, alignItems:'center', justifyContent:'center' }}>
      {/* Background ring */}
      <View style={{
        position:'absolute', width:SIZE, height:SIZE, borderRadius:SIZE/2,
        borderWidth:STROKE, borderColor:'rgba(236,133,117,0.18)',
      }}/>
      {/* Filled top-right quadrant */}
      {pct > 0 && <View style={{
        position:'absolute', width:SIZE, height:SIZE, borderRadius:SIZE/2,
        borderWidth:STROKE,
        borderTopColor:   PALETTE.active,
        borderRightColor: pct >= 0.25 ? PALETTE.active : 'transparent',
        borderBottomColor:pct >= 0.50 ? PALETTE.active : 'transparent',
        borderLeftColor:  pct >= 0.75 ? PALETTE.active : 'transparent',
        transform:[{rotate:'-90deg'}],
      }}/>}
      <Text style={{ fontSize:14, fontWeight:'700', color:PALETTE.active, fontFamily:FONTS.body }}>
        {Math.round(pct*100)}%
      </Text>
    </View>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const [userName, setUserName]             = useState('User')
  const [tasks,    setTasks]                = useState<TaskPreview[]>(initialTasks)
  const [announcementsOpen, setAnnouncementsOpen] = useState(true)

  // Announcement feed — starts empty, populates when user posts or API loads
  const [announcementFeed, setAnnouncementFeed] = useState<Announcement[]>(() => [...announcementStore.getAll()])
  const [newText,  setNewText]              = useState('')
  const [annBusy,  setAnnBusy]              = useState(false)
  const [homeBusy, setHomeBusy]             = useState(true)
  const [shoppingLines, setShoppingLines]   = useState<[string,string]>(['Item 1','Item 2'])
  const [expenseLines,  setExpenseLines]    = useState<[string,string]>(['Expense 1','Expense 2'])

  // Live tasks for hero card
  const [liveTasks, setLiveTasks] = useState(() => taskStore.getTasks())
  useEffect(() => taskStore.subscribe(() => setLiveTasks([...taskStore.getTasks()])), [])

  const todayKey = (() => {
    const d = new Date()
    return [d.getFullYear(), `${d.getMonth()+1}`.padStart(2,'0'), `${d.getDate()}`.padStart(2,'0')].join('-')
  })()
  const todayTasks = liveTasks.filter(t => t.dateKey === todayKey)
  const doneTasks  = todayTasks.filter(t => t.done)
  const pct        = todayTasks.length > 0 ? doneTasks.length / todayTasks.length : 0
  const heroMsg    = todayTasks.length === 0
    ? "No tasks today — enjoy your day!"
    : doneTasks.length === todayTasks.length
      ? "Good job! You're done with all your tasks!"
      : "You're almost done with your tasks today!"

  // Subscribe to announcement store — re-renders when any post is added
  useEffect(() => {
    const unsub = announcementStore.subscribe(() => {
      setAnnouncementFeed([...announcementStore.getAll()])
    })
    return unsub
  }, [])

  const loadAnnouncements = useCallback(async () => {
    try {
      const rows = extractDynamoItems(await housematesApi.getAnnouncements(API_HOUSE_ID))
      if (!rows.length) return
      rows.forEach(it => {
        const id   = String(it.announcement_id ?? '')
        const text = String(it.text ?? '')
        if (!text) return
        const d = typeof it.date === 'string' ? new Date(it.date) : new Date()
        const ann: Announcement = {
          id: id || `a-${text.slice(0,8)}-${Date.now()}`,
          announcement_id: id || undefined,
          message:   text,
          time:      d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }),
          dateLabel: d.toLocaleDateString('en-US', { month:'short', day:'numeric' }),
        }
        // Only add if not already in store (avoid duplicates on re-load)
        if (!announcementStore.getAll().find(a => a.id === ann.id)) {
          announcementStore.add(ann)
        }
      })
    } catch { /* silent */ }
  }, [])

  const loadHomeData = useCallback(async () => {
    setHomeBusy(true)
    try {
      const [userRes, choreRes, expRes, listsRes] = await Promise.all([
        housematesApi.getUser(API_USER_ID).catch(() => null),
        housematesApi.getChoresByHouse(API_HOUSE_ID).catch(() => null),
        housematesApi.getExpensesByHouse({ house_id:API_HOUSE_ID }).catch(() => null),
        housematesApi.getShoppingListsByHouse(API_HOUSE_ID).catch(() => null),
      ])
      const u = extractDynamoItems(userRes ?? {})[0]
      if (u) {
        const n = String(u.name ?? u.given_name ?? u.email ?? '').trim()
        if (n) setUserName(n.split('@')[0] ?? n)
      }
      const choreNames = extractDynamoItems(choreRes ?? {}).map(c => String(c.name ?? 'Chore'))
      if (choreNames.length) setTasks(choreNames.map((name,i) => ({ id:String(i+1), title:name })))
      setExpenseLines(firstTwo(extractDynamoItems(expRes ?? {}).map(e => String(e.name ?? 'Expense')), ['Expense 1','Expense 2']))
      const lists = extractDynamoItems(listsRes ?? {})
      const firstListId = lists[0] ? String(lists[0].list_id ?? '') : ''
      if (firstListId) {
        try {
          const names = extractDynamoItems(await housematesApi.getShoppingItems(firstListId)).map(x => String(x.name ?? 'Item'))
          setShoppingLines(firstTwo(names, ['Item 1','Item 2']))
        } catch { setShoppingLines(['Item 1','Item 2']) }
      }
      await loadAnnouncements()
    } catch (e) { console.warn('Home load partial failure', e) }
    finally { setHomeBusy(false) }
  }, [loadAnnouncements])

  useEffect(() => { loadHomeData() }, [loadHomeData])

  // Post a new announcement — adds to store immediately so card appears without any delay
  async function postAnnouncement() {
    const text = newText.trim()
    if (!text) { Alert.alert('Empty message', 'Type something to post.'); return }
    setAnnBusy(true)
    const now = new Date()
    // Add to store IMMEDIATELY so UI updates before API finishes
    const localId = `local-${Date.now()}`
    const newAnn: Announcement = {
      id:        localId,
      message:   text,
      time:      now.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }),
      dateLabel: now.toLocaleDateString('en-US', { month:'short', day:'numeric' }),
    }
    announcementStore.add(newAnn)
    setNewText('')
    try {
      const res = (await housematesApi.createAnnouncement({ house_id:API_HOUSE_ID, user_id:API_USER_ID, text })) as { announcement_id?: string }
      // Update the local entry with the server id so delete works later
      if (res.announcement_id) {
        announcementStore.update(a => a.id === localId, { id:res.announcement_id, announcement_id:res.announcement_id })
      }
    } catch { /* keep local version — still visible */ }
    finally { setAnnBusy(false) }
  }

  async function removeAnnouncement(item: Announcement) {
    // Remove optimistically
    announcementStore.remove(a => a.id === item.id)
    if (!item.announcement_id) return
    try {
      await housematesApi.deleteAnnouncement({ house_id:API_HOUSE_ID, announcement_id:item.announcement_id })
    } catch { /* silently ignore */ }
  }

  const taskLines = firstTwo(tasks.map(t => t.title), ['Task 1','Task 2'])
  const quickAccess = [
    { key:'today',    title:'Today',    lines:taskLines,                                             route:'/taskPage'    as const },
    { key:'shopping', title:'Shopping', lines:shoppingLines,                                         route:'/ShoppingList' as const },
    { key:'expenses', title:'Expenses', lines:expenseLines,                                          route:'/expenses'    as const },
    { key:'calendar', title:'Calendar', lines:['View schedule','Month & week'] as [string,string],   route:'/calendar'    as const },
  ]

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={s.headerRow}>
            <Pressable style={({pressed})=>[s.avatar,pressed&&s.pressed]} onPress={()=>router.push('/settings')}>
              <Ionicons name="person" size={20} color={PALETTE.textDark}/>
            </Pressable>
            <Text style={s.welcomeText} numberOfLines={1}>Welcome Home, {userName}</Text>
            <Pressable style={({pressed})=>[s.bellWrap,pressed&&s.pressed]} hitSlop={8}>
              <Ionicons name="notifications" size={20} color={PALETTE.textDark}/>
              <View style={s.notifDot}/>
            </Pressable>
          </View>

          {homeBusy && <View style={s.loadingRow}><ActivityIndicator color={PALETTE.active}/></View>}

          {/* ── Hero card ── */}
          <GlassCard style={s.heroCard}>
            <View style={s.heroLeft}>
              <Text style={s.heroMsg}>{heroMsg}</Text>
              <Pressable style={({pressed})=>[s.viewTaskBtn,pressed&&s.viewTaskBtnPressed]} onPress={()=>router.push('/taskPage')}>
                <Text style={s.viewTaskTxt}>View Tasks</Text>
              </Pressable>
            </View>
            <View style={s.heroRight}>
              <ProgressRing pct={pct}/>
            </View>
          </GlassCard>

          {/* ── Quick Access ── */}
          <Text style={s.sectionTitle}>Quick Access:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickRow}>
            {quickAccess.map(qa=>(
              <Pressable key={qa.key} onPress={()=>router.push(qa.route)} style={({pressed})=>[s.quickCardWrap,pressed&&s.pressed]}>
                <GlassCard style={s.quickCard}>
                  <Text style={s.quickTitle}>{qa.title}</Text>
                  {qa.lines.map((line,i)=>(
                    <View key={i} style={s.quickLine}>
                      <Ionicons name="ellipse-outline" size={16} color={PALETTE.textMuted}/>
                      <Text style={s.quickLineText}>{line}</Text>
                    </View>
                  ))}
                </GlassCard>
              </Pressable>
            ))}
          </ScrollView>

          {/* ── Announcements ── */}
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Announcements:</Text>
            <Pressable onPress={()=>setAnnouncementsOpen(v=>!v)} style={({pressed})=>[pressed&&s.pressed]}>
              <Text style={s.toggleText}>{announcementsOpen ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>

          {announcementsOpen && (
            <>
              {/* Compose box */}
              <GlassCard style={s.composeCard}>
                <TextInput
                  style={s.composeInput}
                  placeholder="Write an announcement…"
                  placeholderTextColor={PALETTE.textMuted}
                  value={newText}
                  onChangeText={setNewText}
                  multiline
                />
                <Pressable
                  style={({pressed})=>[s.postBtn,pressed&&s.postBtnPressed]}
                  onPress={postAnnouncement}
                  disabled={annBusy}
                >
                  {annBusy
                    ? <ActivityIndicator color="#fff" size="small"/>
                    : <Text style={s.postBtnText}>Post</Text>
                  }
                </Pressable>
              </GlassCard>

              {/* Empty state */}
              {announcementFeed.length === 0 && (
                <View style={s.emptyAnn}>
                  <Text style={s.emptyAnnText}>No announcements yet — post one above!</Text>
                </View>
              )}

              {/* Announcement cards — each post shows as a card */}
              {announcementFeed.map(item => {
                // First line = title, rest = subtitle
                const lines = item.message.split('\n').filter(Boolean)
                const title = lines[0]?.slice(0, 60) ?? item.message.slice(0, 60)
                const sub   = lines[1]?.slice(0, 60) ?? (lines.length === 1 ? item.message.slice(0, 60) : '')
                return (
                  <Pressable key={item.id} onLongPress={()=>removeAnnouncement(item)} style={({pressed})=>[pressed&&s.pressed]}>
                    <GlassCard style={s.announceCard}>
                      {/* Grey avatar silhouette */}
                      <View style={s.announceAvatarWrap}>
                        <DefaultAvatar size={46}/>
                      </View>
                      {/* Message body */}
                      <View style={s.announceBody}>
                        <Text style={s.announceTitle} numberOfLines={1}>{title}</Text>
                        {sub ? <Text style={s.announceSub} numberOfLines={1}>{sub}</Text> : null}
                      </View>
                      {/* Date / time on right */}
                      <Text style={s.announceMeta}>{item.dateLabel}{'\n'}{item.time}</Text>
                    </GlassCard>
                  </Pressable>
                )
              })}
            </>
          )}

          <View style={{height:120}}/>
        </ScrollView>
        <AppBottomNav/>
      </SafeAreaView>
    </GradientBackground>
  )
}

const s = StyleSheet.create({
  safe:    { flex:1, backgroundColor:'transparent' },
  scroll:  { paddingHorizontal:16, paddingTop:8, paddingBottom:24 },
  pressed: { opacity:0.6 },
  loadingRow: { paddingVertical:8, alignItems:'center' },

  headerRow:   { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:8 },
  avatar:      { width:40, height:40, borderRadius:20, backgroundColor:'rgba(255,255,255,0.55)', borderWidth:1, borderColor:'rgba(255,255,255,0.6)', alignItems:'center', justifyContent:'center' },
  welcomeText: { flex:1, fontSize:17, fontWeight:'700', color:PALETTE.textDark, textAlign:'center', fontFamily:FONTS.title },
  bellWrap:    { width:36, height:36, alignItems:'center', justifyContent:'center', position:'relative' },
  notifDot:    { position:'absolute', top:6, right:6, width:8, height:8, borderRadius:4, backgroundColor:PALETTE.active, borderWidth:1.5, borderColor:'#fff' },

  heroCard:     { marginBottom:20, paddingHorizontal:20, paddingVertical:20, flexDirection:'row', alignItems:'center', minHeight:130 },
  heroLeft:     { flex:1, gap:14 },
  heroRight:    { marginLeft:16 },
  heroMsg:      { fontSize:16, fontWeight:'700', color:PALETTE.textDark, fontFamily:FONTS.titleReg, lineHeight:22 },
  viewTaskBtn:  { alignSelf:'flex-start', backgroundColor:'rgba(255,255,255,0.55)', borderRadius:12, paddingHorizontal:16, paddingVertical:9 },
  viewTaskBtnPressed:{ backgroundColor:'rgba(255,255,255,0.80)' },
  viewTaskTxt:  { fontSize:14, fontWeight:'700', color:PALETTE.textDark, fontFamily:FONTS.body },

  sectionTitle:     { fontSize:20, fontWeight:'800', color:PALETTE.textDark, marginBottom:10, fontFamily:FONTS.title },
  sectionHeaderRow: { marginTop:8, marginBottom:10, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  toggleText:       { fontSize:14, fontWeight:'700', color:PALETTE.active, fontFamily:FONTS.body },

  quickRow:      { gap:10, paddingBottom:6 },
  quickCardWrap: { marginRight:2 },
  quickCard:     { width:155, minHeight:110, padding:14 },
  quickTitle:    { fontSize:16, fontWeight:'700', color:PALETTE.textDark, marginBottom:8, fontFamily:FONTS.title },
  quickLine:     { flexDirection:'row', alignItems:'center', gap:7, marginBottom:5 },
  quickLineText: { fontSize:13, color:PALETTE.textDark, flex:1, fontFamily:FONTS.body },

  composeCard:    { marginBottom:12, gap:10, padding:14 },
  composeInput:   { minHeight:44, maxHeight:120, borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.4)', paddingHorizontal:12, paddingVertical:10, backgroundColor:'rgba(255,255,255,0.25)', color:PALETTE.textDark, fontSize:15, fontFamily:FONTS.body },
  postBtn:        { alignSelf:'flex-end', backgroundColor:PALETTE.active, paddingHorizontal:20, paddingVertical:10, borderRadius:12 },
  postBtnPressed: { backgroundColor:PALETTE.activeDark },
  postBtnText:    { color:'#fff', fontWeight:'700', fontFamily:FONTS.body },

  // Announcement card — avatar left, message centre, date right
  announceCard:       { flexDirection:'row', alignItems:'center', marginBottom:10, paddingVertical:12, paddingHorizontal:14 },
  announceAvatarWrap: { marginRight:12, borderRadius:23, overflow:'hidden' },
  announceBody:       { flex:1 },
  announceTitle:      { fontSize:15, fontWeight:'700', color:PALETTE.textDark, fontFamily:FONTS.titleReg },
  announceSub:        { fontSize:12, color:PALETTE.textMuted, marginTop:2, fontFamily:FONTS.body },
  announceMeta:       { fontSize:10, color:PALETTE.textMuted, textAlign:'right', fontFamily:FONTS.body },

  emptyAnn:     { paddingVertical:20, alignItems:'center' },
  emptyAnnText: { color:PALETTE.textMuted, fontSize:13, fontFamily:FONTS.body, fontStyle:'italic' },
})
