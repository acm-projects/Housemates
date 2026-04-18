import * as React from 'react'
import { apiGetWithBody, apiPost, extractDynamoItems } from '@/utils/api'
import { API_HOUSE_ID, API_USER_ID } from './apiConfig'
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { GradientBackground } from './gradientBg'
import { AppBottomNav } from './AppBottomNav'

const C = {
  active:'#EC8575', textDark:'#000', textMuted:'#8b7b6b',
  glass:'rgba(255,255,255,0.65)', glassBorder:'rgba(255,255,255,0.55)',
}

// Avatar colors matching the screenshot (dark blue, coral, etc.)
const AVATAR_BG = ['#c9b8e8','#1a1a3a','#2a1a2e','#e8c4a0']

function Avatar({size=52, idx=0}: {size?:number; idx?:number}) {
  return (
    <View style={[av.wrap,{width:size,height:size,borderRadius:size/2,backgroundColor:AVATAR_BG[idx%AVATAR_BG.length]}]}>
      <View style={[av.head,{width:size*0.38,height:size*0.38,borderRadius:size*0.19}]}/>
      <View style={[av.body,{width:size*0.62,height:size*0.38,borderRadius:size*0.19}]}/>
    </View>
  )
}
const av = StyleSheet.create({
  wrap:{alignItems:'center',justifyContent:'flex-end',overflow:'hidden',position:'relative'},
  head:{backgroundColor:'rgba(255,255,255,0.35)',position:'absolute',top:'18%'},
  body:{backgroundColor:'rgba(255,255,255,0.35)',position:'absolute',bottom:0},
})

type SplitMember = {id:string; name:string; amount:number}
type Expense     = {id:string; amount:number; description:string; colorIdx:number}
type DateGroup   = {date:string; expenses:Expense[]}

const MEMBERS: SplitMember[] = [
  {id:'1',name:'You',  amount:-99},
  {id:'2',name:'Blake',amount: 23},
  {id:'3',name:'Sam',  amount:-99},
  {id:'4',name:'Alex', amount:-99},
]
const DATE_GROUPS: DateGroup[] = [
  {date:'February 16, 2026', expenses:[
    {id:'1',amount:31,description:'Nuclear Bomb', colorIdx:0},
    {id:'2',amount:31,description:'Nuclear Bomb!',colorIdx:0},
  ]},
  {date:'February 14, 2026', expenses:[
    {id:'3',amount:31,description:'Nuclear Bomb!',colorIdx:2},
    {id:'4',amount:31,description:'Nuclear Bomb!',colorIdx:2},
  ]},
]

export default function ExpensesScreen({onBack}: {onBack?:()=>void}) {
  const router  = useRouter()
  const [busy, setBusy] = React.useState(false)

  // Load expenses from API silently on mount
  React.useEffect(() => {
    const load = async () => {
      setBusy(true)
      try {
        await apiGetWithBody('/expenses/house', {house_id:API_HOUSE_ID})
      } catch { /* silent */ }
      finally { setBusy(false) }
    }
    load()
  }, [])

  const totalOwed = MEMBERS.filter(m=>m.amount>0).reduce((a,m)=>a+m.amount,0)

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>

        {/* Header */}
        <View style={s.topRow}>
          <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]}
            onPress={()=>{ if(onBack) onBack(); else router.back() }}>
            <Ionicons name="chevron-back" size={22} color={C.textDark}/>
          </Pressable>
          <Text style={s.title}>Expenses</Text>
          <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]}>
            <Ionicons name="notifications" size={22} color={C.textDark}/>
            <View style={s.dot}/>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {busy && <ActivityIndicator color={C.active} style={{marginBottom:8}}/>}

          {/* Split Table — glass card */}
          <View style={s.glassCard}>
            <Text style={s.splitTitle}>Split Table</Text>
            <View style={s.membersRow}>
              {MEMBERS.map((m,i) => {
                const pos = m.amount >= 0
                return (
                  <View key={m.id} style={s.memberCol}>
                    <View style={s.avatarWrap}>
                      <Avatar size={52} idx={i}/>
                      <View style={[s.badge,{backgroundColor:pos?C.active:'#ADB6C4'}]}>
                        <Text style={s.badgeText}>{pos?'↑':'↓'}</Text>
                      </View>
                    </View>
                    <Text style={[s.memberAmt,{color:pos?C.active:'#ADB6C4'}]}>
                      {pos?`+$${m.amount}`:`-$${Math.abs(m.amount)}`}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* Expense date groups */}
          {DATE_GROUPS.map(group => (
            <View key={group.date} style={s.dateGroup}>
              <Text style={s.dateHeader}>{group.date}</Text>
              {group.expenses.map(exp => (
                <View key={exp.id} style={s.glassCard}>
                  <View style={s.expIconBox}>
                    <Avatar size={38} idx={exp.colorIdx}/>
                  </View>
                  <View style={s.expInfo}>
                    <Text style={s.expAmt}>${exp.amount.toFixed(2)}</Text>
                    <Text style={s.expDesc}>{exp.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}

          <View style={{height:130}}/>
        </ScrollView>

        {/* Split Money FAB */}
        <Pressable style={({pressed})=>[s.fab,pressed&&s.fabPressed]} onPress={()=>router.push('/splitMoney')}>
          <View style={s.fabIcon}><Text style={s.fabIconText}>$</Text></View>
          <Text style={s.fabText}>Split Money</Text>
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
  glassCard: {
    backgroundColor:C.glass, borderRadius:18, borderWidth:1, borderColor:C.glassBorder,
    padding:18, marginBottom:12,
    flexDirection:'row', alignItems:'center',
    shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2,
  },
  splitTitle:{fontSize:18, fontWeight:'800', color:C.textDark, marginBottom:16,
    // override the row layout for the split card
    position:'absolute', top:18, left:18,
  },
  membersRow:{flexDirection:'row', justifyContent:'space-around', flex:1, marginTop:36},
  memberCol: {alignItems:'center', gap:6},
  avatarWrap:{position:'relative', marginBottom:2},
  badge:     {position:'absolute', bottom:-2, right:-2, width:20, height:20, borderRadius:10, alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:'#fff'},
  badgeText: {fontSize:10, fontWeight:'800', color:'#fff'},
  memberAmt: {fontSize:13, fontWeight:'700'},
  dateGroup: {marginBottom:8},
  dateHeader:{fontSize:15, fontWeight:'700', color:C.textDark, marginBottom:10, paddingHorizontal:4},
  expIconBox:{width:40, height:40, borderRadius:20, marginRight:14, overflow:'hidden'},
  expInfo:   {flex:1},
  expAmt:    {fontSize:16, fontWeight:'700', color:C.textDark, marginBottom:2},
  expDesc:   {fontSize:13, color:C.textMuted},
  fab:       {position:'absolute', right:16, bottom:82, flexDirection:'row', alignItems:'center', backgroundColor:'rgba(236,133,117,0.88)', borderRadius:28, paddingVertical:12, paddingHorizontal:16, paddingLeft:8, shadowColor:'#000', shadowOffset:{width:0,height:6}, shadowOpacity:0.15, shadowRadius:12, elevation:8},
  fabIcon:   {width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.35)', alignItems:'center', justifyContent:'center', marginRight:10},
  fabIconText:{fontSize:18, fontWeight:'800', color:'#fff'},
  fabPressed:{backgroundColor:'#c96d5e'},
  fabText:   {fontSize:15, fontWeight:'700', color:'#1a1a1a'},
})
