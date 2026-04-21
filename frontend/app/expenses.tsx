import * as React from 'react'
import { apiGetWithBody } from '@/utils/api'
import { API_HOUSE_ID } from './apiConfig'
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { GradientBackground } from './gradientBg'
import { AppBottomNav } from './AppBottomNav'
import { GlassCard } from '@/components/glass-ui'
import { FONTS, PALETTE } from './fonts'

// Avatar colors
const AVATAR_BG = ['#c9b8e8','#1a1a3a','#2a1a2e','#e8c4a0']
function Avatar({size=52,idx=0}:{size?:number;idx?:number}) {
  return (
    <View style={[av.wrap,{width:size,height:size,borderRadius:size/2,backgroundColor:AVATAR_BG[idx%AVATAR_BG.length]}]}>
      <View style={[av.head,{width:size*0.38,height:size*0.38,borderRadius:size*0.19}]}/>
      <View style={[av.body,{width:size*0.62,height:size*0.38,borderRadius:size*0.19}]}/>
    </View>
  )
}
const av = StyleSheet.create({
  wrap:{alignItems:'center',justifyContent:'flex-end',overflow:'hidden',position:'relative'},
  head:{backgroundColor:'rgba(255,255,255,0.35)',position:'absolute',top:'18%' as any},
  body:{backgroundColor:'rgba(255,255,255,0.35)',position:'absolute',bottom:0},
})

type SplitMember={id:string;name:string;amount:number}
type Expense={id:string;amount:number;description:string;colorIdx:number}
type DateGroup={date:string;expenses:Expense[]}

const MEMBERS:SplitMember[]=[
  {id:'1',name:'You',amount:-99},{id:'2',name:'Blake',amount:23},
  {id:'3',name:'Sam',amount:-99},{id:'4',name:'Alex',amount:-99},
]
const DATE_GROUPS:DateGroup[]=[
  {date:'February 16, 2026',expenses:[{id:'1',amount:31,description:'Nuclear Bomb',colorIdx:0},{id:'2',amount:31,description:'Nuclear Bomb!',colorIdx:0}]},
  {date:'February 14, 2026',expenses:[{id:'3',amount:31,description:'Nuclear Bomb!',colorIdx:2},{id:'4',amount:31,description:'Nuclear Bomb!',colorIdx:2}]},
]

const FAB_TEXT = '#F2E8DC'
// Down arrow color for split table negative amounts
const DOWN_COLOR = '#E0A932'

export default function ExpensesScreen({onBack}:{onBack?:()=>void}) {
  const router=useRouter()
  const [busy,setBusy]=React.useState(false)
  React.useEffect(()=>{
    const load=async()=>{setBusy(true);try{await apiGetWithBody('/expenses/house',{house_id:API_HOUSE_ID})}catch{}finally{setBusy(false)}}
    load()
  },[])

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.topRow}>
          <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]} onPress={()=>{if(onBack)onBack();else router.back()}}>
            <Ionicons name="chevron-back" size={22} color={PALETTE.textDark}/>
          </Pressable>
          <Text style={s.title}>Expenses</Text>
          <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]}>
            <Ionicons name="notifications" size={20} color={PALETTE.textDark}/>
            <View style={s.dot}/>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {busy&&<ActivityIndicator color={PALETTE.active} style={{marginBottom:8}}/>}

          {/* Split Table */}
          <GlassCard style={s.splitCard}>
            <Text style={s.splitTitle}>Split Table</Text>
            <View style={s.membersRow}>
              {MEMBERS.map((m,i)=>{
                const pos=m.amount>=0
                // up = active coral, down = gold E0A932
                const arrowColor = pos ? PALETTE.active : DOWN_COLOR
                const badgeBg    = pos ? PALETTE.active : DOWN_COLOR
                return(
                  <View key={m.id} style={s.memberCol}>
                    <View style={s.avatarWrap}>
                      <Avatar size={52} idx={i}/>
                      <View style={[s.badge,{backgroundColor:badgeBg}]}>
                        <Text style={s.badgeText}>{pos?'↑':'↓'}</Text>
                      </View>
                    </View>
                    <Text style={[s.memberAmt,{color:arrowColor}]}>
                      {pos?`+$${m.amount}`:`-$${Math.abs(m.amount)}`}
                    </Text>
                  </View>
                )
              })}
            </View>
          </GlassCard>

          {/* Grouped expenses */}
          {DATE_GROUPS.map(group=>(
            <View key={group.date} style={s.dateGroup}>
              <Text style={s.dateHeader}>{group.date}</Text>
              {group.expenses.map(exp=>(
                <GlassCard key={exp.id} style={s.expCard}>
                  <View style={s.expIconBox}><Avatar size={38} idx={exp.colorIdx}/></View>
                  <View style={s.expInfo}>
                    <Text style={s.expAmt}>${exp.amount.toFixed(2)}</Text>
                    <Text style={s.expDesc}>{exp.description}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          ))}
          <View style={{height:130}}/>
        </ScrollView>

        {/* Split Money FAB — rectangular, F2E8DC text & $ sign, no border */}
        <Pressable style={({pressed})=>[s.fab,pressed&&s.fabPressed]} onPress={()=>router.push('/splitMoney')}>
          <Text style={s.fabDollar}>$</Text>
          <Text style={s.fabText}>Split Money</Text>
        </Pressable>

        <AppBottomNav/>
      </SafeAreaView>
    </GradientBackground>
  )
}

const s = StyleSheet.create({
  safe:       {flex:1,backgroundColor:'transparent'},
  topRow:     {flexDirection:'row',alignItems:'center',marginTop:10,marginBottom:8,paddingHorizontal:16},
  iconBtn:    {width:36,height:36,alignItems:'center',justifyContent:'center',position:'relative'},
  dot:        {position:'absolute',top:6,right:6,width:8,height:8,borderRadius:4,backgroundColor:PALETTE.active,borderWidth:1,borderColor:'#fff'},
  title:      {flex:1,textAlign:'center',fontSize:26,fontWeight:'700',color:PALETTE.textDark,fontFamily:FONTS.title},
  pressed:    {opacity:0.6},
  scroll:     {paddingHorizontal:16,paddingBottom:24},
  splitCard:  {padding:20,marginBottom:20},
  splitTitle: {fontSize:20,fontWeight:'800',color:PALETTE.textDark,marginBottom:16,fontFamily:FONTS.title},
  membersRow: {flexDirection:'row',justifyContent:'space-around'},
  memberCol:  {alignItems:'center',gap:6},
  avatarWrap: {position:'relative',marginBottom:2},
  badge:      {position:'absolute',bottom:-2,right:-2,width:20,height:20,borderRadius:10,alignItems:'center',justifyContent:'center',borderWidth:1.5,borderColor:'#fff'},
  badgeText:  {fontSize:10,fontWeight:'800',color:'#fff'},
  memberAmt:  {fontSize:13,fontWeight:'700',fontFamily:FONTS.body},
  dateGroup:  {marginBottom:8},
  dateHeader: {fontSize:15,fontWeight:'700',color:PALETTE.textDark,marginBottom:10,paddingHorizontal:4,fontFamily:FONTS.title},
  expCard:    {flexDirection:'row',alignItems:'center',paddingHorizontal:18,paddingVertical:14,marginBottom:8},
  expIconBox: {width:40,height:40,borderRadius:20,marginRight:14,overflow:'hidden'},
  expInfo:    {flex:1},
  expAmt:     {fontSize:16,fontWeight:'700',color:PALETTE.textDark,marginBottom:2,fontFamily:FONTS.titleReg},
  expDesc:    {fontSize:13,color:PALETTE.textMuted,fontFamily:FONTS.body},
  // FAB — rectangular, no icon border, F2E8DC
  fab:        {position:'absolute',right:16,bottom:82,flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'rgba(236,133,117,0.88)',borderRadius:14,paddingVertical:14,paddingHorizontal:20},
  fabPressed: {backgroundColor:PALETTE.activeDark},
  fabDollar:  {fontSize:18,fontWeight:'800',color:FAB_TEXT},
  fabText:    {fontSize:15,fontWeight:'700',color:FAB_TEXT,fontFamily:FONTS.body},
})
