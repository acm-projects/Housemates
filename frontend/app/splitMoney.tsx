import * as React from 'react'
import { useState } from 'react'
import { apiPost } from '@/utils/api'
import { useRouter } from 'expo-router'
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, Pressable, View, TouchableOpacity,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { GradientBackground } from './gradientBg'
import { AppBottomNav } from './AppBottomNav'
import { FONTS, PALETTE } from './fonts'

type SplitOption = 'you_owe'|'they_owe'|'split'
type LoanType    = 'cash loan'|'venmo'|'zelle'
async function splitMoneyApi(data:{amount:number;users:string[]}){return apiPost('/money/split',data)}

function GlassCard({children,style}:{children:React.ReactNode;style?:any}){
  return(<BlurView intensity={26} tint="light" style={[s.card,style]}>{children}</BlurView>)
}

export default function SplitMoneyScreen() {
  const router=useRouter()
  const [friendName,setFriendName]=useState('')
  const [loanType,setLoanType]=useState<LoanType>('cash loan')
  const [amount,setAmount]=useState('')
  const [selectedSplit,setSelectedSplit]=useState<SplitOption|null>(null)
  const [showDropdown,setShowDropdown]=useState(false)
  const handleDone=async()=>{await splitMoneyApi({amount:parseFloat(amount||'0'),users:friendName?[friendName]:[]})}
  const displayName=friendName||'your housemate'
  const displayAmt=amount||'0.00'

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content"/>

        <View style={s.topRow}>
          <Pressable onPress={()=>router.back()} style={({pressed})=>[s.iconBtn,pressed&&s.pressed]}>
            <Text style={s.backArrow}>←</Text>
          </Pressable>
          <View style={s.titleWrap}>
            <Text style={s.title}>Split Money</Text>
            <Text style={s.subtitle}>Settle up with your house</Text>
          </View>
          <View style={s.iconBtn}/>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <GlassCard>
            <Text style={s.sectionLabel}>NEW BILL</Text>
            <View style={s.inputWrap}>
              <Text style={s.inputLabel}>With</Text>
              <TextInput style={s.input} value={friendName} onChangeText={setFriendName} placeholder="Housemate name" placeholderTextColor={PALETTE.textMuted}/>
            </View>
            <View style={s.row}>
              <View style={[s.inputWrap,{flex:1}]}>
                <Text style={s.inputLabel}>Payment via</Text>
                <TouchableOpacity onPress={()=>setShowDropdown(v=>!v)} style={s.dropTrigger}>
                  <Text style={s.dropText}>{loanType}</Text>
                  <Text style={s.dropText}>⌄</Text>
                </TouchableOpacity>
              </View>
              <View style={[s.inputWrap,{flex:1}]}>
                <Text style={s.inputLabel}>Amount</Text>
                <View style={s.amtRow}>
                  <Text style={s.amtPrefix}>$</Text>
                  <TextInput style={[s.input,{flex:1}]} value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={PALETTE.textMuted} keyboardType="decimal-pad"/>
                </View>
              </View>
            </View>
            {showDropdown&&(
              <View style={s.dropMenu}>
                {(['cash loan','venmo','zelle'] as LoanType[]).map(opt=>(
                  <TouchableOpacity key={opt} style={s.dropOption} onPress={()=>{setLoanType(opt);setShowDropdown(false)}}>
                    <Text style={s.dropText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={s.summaryBubble}>
              <Text style={s.summaryText}>{displayName} owes you ${displayAmt} via {loanType}</Text>
            </View>
          </GlassCard>

          <GlassCard>
            <Text style={s.sectionLabel}>HOW TO SPLIT</Text>
            {([
              {key:'you_owe' as SplitOption,label:`You owe ${displayName}`,desc:`$${displayAmt}`},
              {key:'they_owe' as SplitOption,label:`${displayName} owes you`,desc:`$${displayAmt}`},
              {key:'split' as SplitOption,label:'Split the bill',desc:`$${(parseFloat(displayAmt||'0')/2).toFixed(2)} each`},
            ]).map(opt=>{
              const on=selectedSplit===opt.key
              return(
                <Pressable key={opt.key} style={({pressed})=>[s.optCard,on&&s.optCardOn,pressed&&s.pressed]} onPress={()=>setSelectedSplit(opt.key)}>
                  <Text style={[s.optLabel,on&&s.optLabelOn]}>{opt.label}</Text>
                  <Text style={[s.optDesc,on&&s.optLabelOn]}>{opt.desc}</Text>
                </Pressable>
              )
            })}
          </GlassCard>

          {/* Rectangular Confirm button */}
          <Pressable style={({pressed})=>[s.confirmBtn,pressed&&s.confirmBtnPressed]} onPress={handleDone}>
            <Text style={s.confirmTxt}>Confirm and Save</Text>
          </Pressable>
          <View style={{height:40}}/>
        </ScrollView>
        <AppBottomNav/>
      </SafeAreaView>
    </GradientBackground>
  )
}

const s = StyleSheet.create({
  safe:         {flex:1,backgroundColor:'transparent'},
  topRow:       {paddingHorizontal:16,paddingTop:12,paddingBottom:4,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  iconBtn:      {width:38,height:38,alignItems:'center',justifyContent:'center'},
  backArrow:    {fontSize:18,color:PALETTE.textDark,fontWeight:'700'},
  titleWrap:    {alignItems:'center',flex:1},
  title:        {fontSize:26,fontWeight:'800',color:PALETTE.active,fontFamily:FONTS.title},
  subtitle:     {fontSize:12,color:PALETTE.textMuted,marginTop:2,fontFamily:FONTS.body},
  pressed:      {opacity:0.6},
  scroll:       {padding:16,paddingBottom:110,gap:16},
  card:         {borderRadius:24,overflow:'hidden',padding:16,backgroundColor:'rgba(255,255,255,0.18)',borderWidth:1,borderColor:'rgba(255,255,255,0.35)'},
  sectionLabel: {fontSize:11,fontWeight:'700',color:PALETTE.active,letterSpacing:1,marginBottom:12,fontFamily:FONTS.body},
  inputWrap:    {backgroundColor:'rgba(255,255,255,0.24)',borderRadius:18,borderWidth:1,borderColor:'rgba(255,255,255,0.38)',paddingHorizontal:14,paddingVertical:12,marginBottom:12},
  inputLabel:   {fontSize:11,fontWeight:'700',color:PALETTE.textMuted,marginBottom:6,fontFamily:FONTS.body},
  input:        {fontSize:16,fontWeight:'500',color:PALETTE.textDark,fontFamily:FONTS.body},
  row:          {flexDirection:'row',gap:10},
  dropTrigger:  {flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  dropText:     {fontSize:15,color:PALETTE.textDark,fontWeight:'600',fontFamily:FONTS.body},
  dropMenu:     {backgroundColor:'rgba(255,255,255,0.24)',borderRadius:18,borderWidth:1,borderColor:'rgba(255,255,255,0.38)',overflow:'hidden',marginBottom:12},
  dropOption:   {paddingHorizontal:14,paddingVertical:12},
  amtRow:       {flexDirection:'row',alignItems:'center'},
  amtPrefix:    {color:PALETTE.textDark,fontWeight:'800',marginRight:4,fontFamily:FONTS.body},
  summaryBubble:{backgroundColor:'rgba(255,255,255,0.24)',borderRadius:18,paddingHorizontal:14,paddingVertical:12,borderWidth:1,borderColor:'rgba(255,255,255,0.38)'},
  summaryText:  {color:PALETTE.textDark,fontWeight:'600',textAlign:'center',fontFamily:FONTS.body},
  optCard:      {backgroundColor:'rgba(255,255,255,0.24)',borderRadius:18,borderWidth:1,borderColor:'rgba(255,255,255,0.38)',paddingHorizontal:14,paddingVertical:14,marginBottom:10},
  optCardOn:    {borderColor:PALETTE.active,backgroundColor:'rgba(236,133,117,0.18)'},
  optLabel:     {color:PALETTE.textDark,fontSize:15,fontWeight:'700',fontFamily:FONTS.body},
  optLabelOn:   {color:PALETTE.active},
  optDesc:      {color:PALETTE.textMuted,fontSize:13,fontWeight:'600',marginTop:4,fontFamily:FONTS.body},
  // Rectangular confirm button
  confirmBtn:   {height:52,borderRadius:14,backgroundColor:PALETTE.active,alignItems:'center',justifyContent:'center'},
  confirmBtnPressed:{backgroundColor:PALETTE.activeDark},
  confirmTxt:   {color:'#fff',fontSize:16,fontWeight:'800',fontFamily:FONTS.body},
})
