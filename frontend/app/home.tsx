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
import { announcementStore, Announcement } from './store'

type TaskPreview = { id:string; title:string }
const initialTasks: TaskPreview[] = [{id:'1',title:'Task 1'},{id:'2',title:'Expense 1'}]
function firstTwo(items:string[],fb:[string,string]):[string,string]{return[items[0]??fb[0],items[1]??fb[1]]}

function DefaultAvatar({size=46}:{size?:number}){
  return(
    <View style={[av.wrap,{width:size,height:size,borderRadius:size/2}]}>
      <View style={[av.circle,{width:size*0.38,height:size*0.38,borderRadius:size*0.19}]}/>
      <View style={[av.body,{width:size*0.62,height:size*0.38,borderRadius:size*0.19}]}/>
    </View>
  )
}
const av = StyleSheet.create({
  wrap:{backgroundColor:'#C8C8C8',alignItems:'center',justifyContent:'flex-end',overflow:'hidden',position:'relative'},
  circle:{backgroundColor:'#E8E8E8',position:'absolute',top:'18%'},
  body:{backgroundColor:'#E8E8E8',position:'absolute',bottom:0},
})

export default function HomeScreen() {
  const router = useRouter()
  const [userName, setUserName] = useState('User')
  const [tasks, setTasks] = useState<TaskPreview[]>(initialTasks)
  const [announcementsOpen, setAnnouncementsOpen] = useState(true)
  // Read from shared store directly — stays in sync with any adds
  const [announcementFeed, setAnnouncementFeed] = useState<Announcement[]>(() => [...announcementStore.getAll()])
  const [newAnnouncementText, setNewAnnouncementText] = useState('')
  const [announcementBusy, setAnnouncementBusy] = useState(false)
  const [homeBusy, setHomeBusy] = useState(true)
  const [shoppingLines, setShoppingLines] = useState<[string,string]>(['Item 1','Item 2'])
  const [expenseLines, setExpenseLines] = useState<[string,string]>(['Expense 1','Expense 2'])

  // Subscribe to announcement store — ensures new posts from postAnnouncement() appear immediately
  useEffect(()=>{
    const unsub = announcementStore.subscribe(()=>{
      setAnnouncementFeed([...announcementStore.getAll()])
    })
    return unsub
  },[])

  const loadAnnouncements = useCallback(async ()=>{
    try{
      const data = await housematesApi.getAnnouncements(API_HOUSE_ID)
      const rows = extractDynamoItems(data)
      if(rows.length===0)return
      rows.forEach(it=>{
        const id=String(it.announcement_id??""),text=String(it.text??"")
        const d=typeof it.date==='string'?new Date(it.date):new Date()
        const ann:Announcement={
          id:id||`a-${text.slice(0,8)}`,announcement_id:id||undefined,message:text,
          time:d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),
          dateLabel:d.toLocaleDateString('en-US',{month:'short',day:'numeric'}),
        }
        if(!announcementStore.getAll().find(a=>a.id===ann.id)) announcementStore.add(ann)
      })
    }catch{/*silent*/}
  },[])

  const loadHomeData = useCallback(async ()=>{
    setHomeBusy(true)
    try{
      const[userRes,choreRes,expRes,listsRes]=await Promise.all([
        housematesApi.getUser(API_USER_ID).catch(()=>null),
        housematesApi.getChoresByHouse(API_HOUSE_ID).catch(()=>null),
        housematesApi.getExpensesByHouse({house_id:API_HOUSE_ID}).catch(()=>null),
        housematesApi.getShoppingListsByHouse(API_HOUSE_ID).catch(()=>null),
      ])
      const u=extractDynamoItems(userRes??{})[0]
      if(u){const n=String(u.name??u.given_name??u.email??'').trim();if(n)setUserName(n.split('@')[0]??n)}
      const choreNames=extractDynamoItems(choreRes??{}).map(c=>String(c.name??'Chore'))
      if(choreNames.length>0)setTasks(choreNames.map((name,i)=>({id:String(i+1),title:name})))
      setExpenseLines(firstTwo(extractDynamoItems(expRes??{}).map(e=>String(e.name??'Expense')),['Expense 1','Expense 2']))
      const lists=extractDynamoItems(listsRes??{})
      const firstListId=lists[0]?String(lists[0].list_id??''):''
      if(firstListId){
        try{
          const names=extractDynamoItems(await housematesApi.getShoppingItems(firstListId)).map(x=>String(x.name??'Item'))
          setShoppingLines(firstTwo(names,['Item 1','Item 2']))
        }catch{setShoppingLines(['Item 1','Item 2'])}
      }
      await loadAnnouncements()
    }catch(e){console.warn('Home load partial failure',e)}
    finally{setHomeBusy(false)}
  },[loadAnnouncements])

  useEffect(()=>{loadHomeData()},[loadHomeData])

  async function postAnnouncement(){
    const text=newAnnouncementText.trim()
    if(!text){Alert.alert('Empty message','Type something to post.');return}
    setAnnouncementBusy(true)
    try{
      const res=(await housematesApi.createAnnouncement({house_id:API_HOUSE_ID,user_id:API_USER_ID,text})) as {announcement_id?:string;message?:string}
      const now=new Date()
      // Add to shared store — subscriber above will update feed immediately
      announcementStore.add({
        id:res.announcement_id??`local-${Date.now()}`,
        announcement_id:res.announcement_id,
        message:text,
        time:now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),
        dateLabel:now.toLocaleDateString('en-US',{month:'short',day:'numeric'}),
      })
      setNewAnnouncementText('')
    }catch(e){Alert.alert('Post failed',e instanceof Error?e.message:'Unknown error')}
    finally{setAnnouncementBusy(false)}
  }

  async function removeAnnouncement(item:Announcement){
    if(!item.announcement_id)return
    setAnnouncementBusy(true)
    try{
      await housematesApi.deleteAnnouncement({house_id:API_HOUSE_ID,announcement_id:item.announcement_id})
      announcementStore.remove(item.id)
    }catch(e){Alert.alert('Delete failed',e instanceof Error?e.message:'Unknown error')}
    finally{setAnnouncementBusy(false)}
  }

  const taskLines=firstTwo(tasks.map(t=>t.title),['Task 1','Task 2'])
  const quickAccess=[
    {key:'today',title:'Today',lines:taskLines,route:'/taskPage' as const},
    {key:'shopping',title:'Shopping',lines:shoppingLines,route:'/ShoppingList' as const},
    {key:'expenses',title:'Expenses',lines:expenseLines,route:'/expenses' as const},
    {key:'calendar',title:'Calendar',lines:['View schedule','Month & week'] as [string,string],route:'/calendar' as const},
  ]

  return(
    <GradientBackground>
      <SafeAreaView style={s.safeArea}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.headerRow}>
            <Pressable style={({pressed})=>[s.avatar,pressed&&s.pressed]} onPress={()=>router.push('/settings')}>
              <Ionicons name="person" size={22} color={GLASS_COLORS.textDark}/>
            </Pressable>
            <Text style={s.welcomeText} numberOfLines={1}>Welcome Home, {userName}</Text>
            <Pressable style={({pressed})=>[s.bellWrap,pressed&&s.pressed]} hitSlop={8}>
              <Ionicons name="notifications" size={24} color={GLASS_COLORS.textDark}/>
              <View style={s.notifDot}/>
            </Pressable>
          </View>

          {homeBusy&&<View style={s.loadingRow}><ActivityIndicator color={GLASS_COLORS.title}/></View>}

          <GlassCard style={s.heroCard}><View style={s.heroInner}/></GlassCard>

          <Text style={s.sectionTitle}>Quick Access:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickRow}>
            {quickAccess.map(qa=>(
              <Pressable key={qa.key} onPress={()=>router.push(qa.route)} style={({pressed})=>[s.quickCardWrap,pressed&&s.pressed]}>
                <GlassCard style={s.quickCard}>
                  <Text style={s.quickTitle}>{qa.title}</Text>
                  {qa.lines.map((line,i)=>(
                    <View key={i} style={s.quickLine}>
                      <Ionicons name="ellipse-outline" size={18} color={GLASS_COLORS.textMuted}/>
                      <Text style={s.quickLineText}>{line}</Text>
                    </View>
                  ))}
                </GlassCard>
              </Pressable>
            ))}
          </ScrollView>

          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Announcements:</Text>
            <Pressable onPress={()=>setAnnouncementsOpen(v=>!v)} style={({pressed})=>[pressed&&s.pressed]}>
              <Text style={s.toggleText}>{announcementsOpen?'Hide':'Show'}</Text>
            </Pressable>
          </View>

          {announcementsOpen&&(
            <>
              <GlassCard style={s.composeCard}>
                <TextInput
                  style={s.composeInput}
                  placeholder="New announcement…"
                  placeholderTextColor={GLASS_COLORS.textMuted}
                  value={newAnnouncementText}
                  onChangeText={setNewAnnouncementText}
                  multiline
                />
                <Pressable
                  style={({pressed})=>[s.postBtn,pressed&&s.postBtnPressed]}
                  onPress={postAnnouncement}
                  disabled={announcementBusy}
                >
                  {announcementBusy
                    ?<ActivityIndicator color="#fff" size="small"/>
                    :<Text style={s.postBtnText}>Post</Text>
                  }
                </Pressable>
              </GlassCard>

              {announcementFeed.map(item=>{
                const title=item.message.split('\n')[0]?.slice(0,48)||'Update'
                const sub=item.message.length>title.length?item.message.slice(title.length).trim().slice(0,60):item.message.slice(0,40)
                return(
                  <Pressable key={item.id} onLongPress={()=>removeAnnouncement(item)} style={({pressed})=>[pressed&&s.pressed]}>
                    <GlassCard style={s.announceCard}>
                      <View style={s.announceAvatarWrap}><DefaultAvatar size={46}/></View>
                      <View style={s.announceBody}>
                        <Text style={s.announceTitle} numberOfLines={1}>{title}</Text>
                        <Text style={s.announceSub} numberOfLines={1}>{sub||'Tap to read more'}</Text>
                      </View>
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
  safeArea:{flex:1,backgroundColor:'transparent'},
  scroll:{paddingHorizontal:16,paddingTop:8,paddingBottom:24},
  loadingRow:{paddingVertical:8,alignItems:'center'},
  pressed:{opacity:0.6},
  headerRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14,gap:8},
  avatar:{width:44,height:44,borderRadius:22,backgroundColor:'rgba(255,255,255,0.45)',borderWidth:1,borderColor:'rgba(255,255,255,0.5)',alignItems:'center',justifyContent:'center'},
  welcomeText:{flex:1,fontSize:18,fontWeight:'700',color:GLASS_COLORS.textDark,textAlign:'center'},
  bellWrap:{width:44,height:44,alignItems:'center',justifyContent:'center',position:'relative'},
  notifDot:{position:'absolute',top:8,right:8,width:9,height:9,borderRadius:5,backgroundColor:GLASS_COLORS.title,borderWidth:1.5,borderColor:'#fff'},
  heroCard:{marginBottom:18,minHeight:120,padding:0},
  heroInner:{minHeight:112,borderRadius:18,margin:6,backgroundColor:'rgba(255,255,255,0.12)'},
  sectionTitle:{fontSize:20,fontWeight:'800',color:GLASS_COLORS.textDark,marginBottom:10},
  sectionHeaderRow:{marginTop:8,marginBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  toggleText:{fontSize:14,fontWeight:'700',color:GLASS_COLORS.title},
  quickRow:{gap:12,paddingBottom:6},
  quickCardWrap:{marginRight:4},
  quickCard:{width:168,minHeight:120},
  quickTitle:{fontSize:17,fontWeight:'700',color:GLASS_COLORS.textDark,marginBottom:10},
  quickLine:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:6},
  quickLineText:{fontSize:14,color:GLASS_COLORS.textDark,flex:1},
  composeCard:{marginBottom:12,gap:10},
  composeInput:{minHeight:44,maxHeight:90,borderRadius:14,borderWidth:1,borderColor:'rgba(255,255,255,0.35)',paddingHorizontal:12,paddingVertical:10,backgroundColor:'rgba(255,255,255,0.2)',color:GLASS_COLORS.textDark,fontSize:15},
  postBtn:{alignSelf:'flex-end',backgroundColor:GLASS_COLORS.title,paddingHorizontal:20,paddingVertical:10,borderRadius:14},
  postBtnPressed:{backgroundColor:'#c96d5e'},
  postBtnText:{color:'#fff',fontWeight:'700'},
  announceCard:{flexDirection:'row',alignItems:'center',marginBottom:10,paddingVertical:10,paddingHorizontal:14},
  announceAvatarWrap:{marginRight:12,borderRadius:23,overflow:'hidden'},
  announceBody:{flex:1},
  announceTitle:{fontSize:15,fontWeight:'700',color:GLASS_COLORS.textDark},
  announceSub:{fontSize:12,color:GLASS_COLORS.textMuted,marginTop:2},
  announceMeta:{fontSize:10,color:GLASS_COLORS.textMuted,textAlign:'right'},
})
