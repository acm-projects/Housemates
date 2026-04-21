import React, { useState } from 'react'
import { apiPost } from '@/utils/api'
import { API_HOUSE_ID, API_USER_ID } from './apiConfig'
import {
  View, Text, StyleSheet, Pressable, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, Modal, TextInput, TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { GradientBackground } from './gradientBg'
import { AppBottomNav } from './AppBottomNav'
import { taskStore } from './store'
import { FONTS, PALETTE } from './fonts'

type Props = { onBack?:()=>void; onDone?:(data:{taskName:string;urgent:boolean;time:string;date:string})=>void }

async function saveTaskApi(data:{taskName:string;urgent:boolean;time:string}) {
  try { await apiPost('/chores',{house_id:API_HOUSE_ID,name:data.taskName,description:data.urgent?'Urgent':`Due ${data.time}`,rotation:[API_USER_ID],rrule:'FREQ=WEEKLY'}) }
  catch(err) { console.error('Error saving task:',err) }
}

const HOURS=['01','02','03','04','05','06','07','08','09','10','11','12']
const MINUTES=['00','05','10','15','20','25','30','35','40','45','50','55']
const PERIODS=['AM','PM']
function toDateKey(d:Date){return[d.getFullYear(),`${d.getMonth()+1}`.padStart(2,'0'),`${d.getDate()}`.padStart(2,'0')].join('-')}
function formatDate(d:Date){return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}

export default function AddTaskScreen({onBack,onDone}:Props) {
  const router=useRouter()
  const [taskName,setTaskName]=useState('')
  const [urgent,setUrgent]=useState(false)
  const [error,setError]=useState('')
  const [hour,setHour]=useState('09')
  const [minute,setMinute]=useState('00')
  const [period,setPeriod]=useState('AM')
  const [showTime,setShowTime]=useState(false)
  const today=new Date()
  const [selDate,setSelDate]=useState(today)
  const [showDate,setShowDate]=useState(false)
  const [calMonth,setCalMonth]=useState(today.getMonth())
  const [calYear,setCalYear]=useState(today.getFullYear())
  const timeStr=`${hour}:${minute} ${period}`
  const dateLabel=formatDate(selDate)
  const daysIn=(y:number,m:number)=>new Date(y,m+1,0).getDate()
  const firstDay=(y:number,m:number)=>new Date(y,m,1).getDay()
  const handleBack=()=>{if(onBack)onBack();else router.back()}
  const handleDone=()=>{
    if(!taskName.trim()){setError('Please enter a task name.');return}
    setError('')
    taskStore.addTask({id:`task-${Date.now()}`,title:taskName.trim(),note:urgent?'Urgent':'',time:timeStr,dateKey:toDateKey(selDate),status:urgent?'Urgent':'To-do',color:'#f5c6d0',done:false,urgent})
    saveTaskApi({taskName,urgent,time:timeStr})
    onDone?.({taskName,urgent,time:timeStr,date:toDateKey(selDate)})
    handleBack()
  }

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.page}>
          <View style={s.topRow}>
            <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]} onPress={handleBack}>
              <Text style={s.backArrow}>←</Text>
            </Pressable>
            <View style={s.titleWrap}><Text style={s.title}>Add Task</Text></View>
            <View style={s.iconBtn}/>
          </View>

          <KeyboardAvoidingView style={s.flex} behavior={Platform.OS==='ios'?'padding':'height'}>
            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={s.rowCard}>
                <Text style={s.rowLabel}>Add Task</Text>
                <TextInput style={s.inputBox} value={taskName} onChangeText={setTaskName} cursorColor={PALETTE.active} autoCapitalize="sentences" returnKeyType="done" placeholderTextColor={PALETTE.textMuted}/>
              </View>
              <View style={s.rowCard}>
                <Text style={s.rowLabel}>Mark Urgent</Text>
                <Pressable onPress={()=>setUrgent(!urgent)} style={s.toggleOuter}>
                  <View style={[s.track,urgent&&s.trackOn]}><View style={[s.thumb,urgent?s.thumbOn:s.thumbOff]}/></View>
                </Pressable>
              </View>
              <Pressable style={({pressed})=>[s.rowCard,pressed&&s.pressed]} onPress={()=>setShowDate(true)}>
                <Text style={s.rowLabel}>Select Date</Text>
                <View style={s.displayBox}><Text style={s.coral}>{dateLabel}</Text></View>
              </Pressable>
              <Pressable style={({pressed})=>[s.rowCard,pressed&&s.pressed]} onPress={()=>setShowTime(true)}>
                <Text style={s.rowLabel}>Enter Time</Text>
                <View style={s.displayBox}><Text style={s.coral}>{timeStr}</Text></View>
              </Pressable>
              {error!==''&&<View style={s.errBanner}><Text style={s.errText}>{error}</Text></View>}
              {/* Rectangular Done button */}
              <Pressable style={({pressed})=>[s.doneBtn,pressed&&s.doneBtnPressed]} onPress={handleDone}>
                <Text style={s.doneBtnText}>Done</Text>
              </Pressable>
              <View style={{height:110}}/>
            </ScrollView>
          </KeyboardAvoidingView>
          <AppBottomNav/>
        </View>

        {/* Time Modal */}
        <Modal transparent animationType="fade" visible={showTime} onRequestClose={()=>setShowTime(false)}>
          <Pressable style={s.overlay} onPress={()=>setShowTime(false)}>
            <Pressable style={s.pickerCard} onPress={e=>e.stopPropagation()}>
              <Text style={s.pickerTitle}>Select Time</Text>
              <View style={s.pickRow}>
                <View style={s.pickCol}>
                  <Text style={s.pickLabel}>Hour</Text>
                  <ScrollView style={s.pickScroll} showsVerticalScrollIndicator={false}>
                    {HOURS.map(h=><TouchableOpacity key={h} style={[s.chip,hour===h&&s.chipOn]} onPress={()=>setHour(h)}><Text style={[s.chipTxt,hour===h&&s.chipTxtOn]}>{h}</Text></TouchableOpacity>)}
                  </ScrollView>
                </View>
                <View style={s.pickCol}>
                  <Text style={s.pickLabel}>Min</Text>
                  <ScrollView style={s.pickScroll} showsVerticalScrollIndicator={false}>
                    {MINUTES.map(m=><TouchableOpacity key={m} style={[s.chip,minute===m&&s.chipOn]} onPress={()=>setMinute(m)}><Text style={[s.chipTxt,minute===m&&s.chipTxtOn]}>{m}</Text></TouchableOpacity>)}
                  </ScrollView>
                </View>
                <View style={s.pickCol}>
                  <Text style={s.pickLabel}>AM/PM</Text>
                  {PERIODS.map(p=><TouchableOpacity key={p} style={[s.chip,period===p&&s.chipOn]} onPress={()=>setPeriod(p)}><Text style={[s.chipTxt,period===p&&s.chipTxtOn]}>{p}</Text></TouchableOpacity>)}
                </View>
              </View>
              <Pressable style={({pressed})=>[s.confirmBtn,pressed&&s.confirmBtnPressed]} onPress={()=>setShowTime(false)}>
                <Text style={s.confirmTxt}>Confirm</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Date Modal */}
        <Modal transparent animationType="fade" visible={showDate} onRequestClose={()=>setShowDate(false)}>
          <Pressable style={s.overlay} onPress={()=>setShowDate(false)}>
            <Pressable style={s.pickerCard} onPress={e=>e.stopPropagation()}>
              <Text style={s.pickerTitle}>Select Date</Text>
              <View style={s.calNav}>
                <TouchableOpacity style={s.calNavBtn} onPress={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1)}}>
                  <Text style={s.calArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={s.calMonthLbl}>{new Date(calYear,calMonth,1).toLocaleString('en-US',{month:'long'})} {calYear}</Text>
                <TouchableOpacity style={s.calNavBtn} onPress={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1)}}>
                  <Text style={s.calArrow}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={s.weekRow}>{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><Text key={d} style={s.weekDay}>{d}</Text>)}</View>
              <View style={s.calGrid}>
                {Array.from({length:firstDay(calYear,calMonth)},(_,i)=><View key={`e${i}`} style={s.dayBlank}/>)}
                {Array.from({length:daysIn(calYear,calMonth)},(_,i)=>{
                  const day=i+1,d=new Date(calYear,calMonth,day),sel=toDateKey(d)===toDateKey(selDate)
                  return(<TouchableOpacity key={day} style={[s.calDay,sel&&s.calDayOn]} onPress={()=>{setSelDate(d);setShowDate(false)}}><Text style={[s.calDayTxt,sel&&s.calDayTxtOn]}>{day}</Text></TouchableOpacity>)
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  )
}

const s = StyleSheet.create({
  safe:     {flex:1,backgroundColor:'transparent'},
  page:     {flex:1,paddingHorizontal:16},
  flex:     {flex:1},
  topRow:   {flexDirection:'row',alignItems:'center',marginTop:10,marginBottom:18,paddingHorizontal:4},
  iconBtn:  {width:36,height:36,alignItems:'center',justifyContent:'center'},
  backArrow:{fontSize:22,color:PALETTE.textDark,fontWeight:'500'},
  titleWrap:{flex:1,alignItems:'center'},
  title:    {fontSize:26,fontWeight:'700',color:PALETTE.textDark,fontFamily:FONTS.title},
  pressed:  {opacity:0.6},
  scroll:   {paddingTop:26,paddingBottom:24},
  rowCard:  {width:'100%',minHeight:76,backgroundColor:'rgba(255,255,255,0.84)',borderRadius:18,paddingHorizontal:22,marginBottom:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',shadowColor:'#000',shadowOffset:{width:0,height:3},shadowOpacity:0.08,shadowRadius:6,elevation:3},
  rowLabel: {fontSize:17,fontWeight:'500',color:PALETTE.textDark,fontFamily:FONTS.body},
  inputBox: {width:142,height:50,borderRadius:14,backgroundColor:'rgba(255,243,216,0.40)',fontSize:16,color:PALETTE.textDark,paddingHorizontal:14,textAlign:'center',fontFamily:FONTS.body},
  displayBox:{width:142,height:50,borderRadius:14,backgroundColor:'rgba(255,243,216,0.40)',alignItems:'center',justifyContent:'center',paddingHorizontal:8},
  coral:    {color:PALETTE.active,fontWeight:'600',fontSize:13,textAlign:'center',fontFamily:FONTS.body},
  toggleOuter:{width:54,alignItems:'flex-end',justifyContent:'center'},
  track:    {width:40,height:22,borderRadius:11,backgroundColor:'rgba(255,195,160,0.20)',justifyContent:'center'},
  trackOn:  {backgroundColor:PALETTE.active},
  thumb:    {position:'absolute',top:2,width:18,height:18,borderRadius:9,backgroundColor:'rgba(236,133,117,0.60)'},
  thumbOff: {left:2},
  thumbOn:  {right:2,backgroundColor:'#fff'},
  errBanner:{backgroundColor:'rgba(255,255,255,0.84)',borderRadius:14,paddingHorizontal:14,paddingVertical:12,marginBottom:18},
  errText:  {color:PALETTE.active,fontSize:13,fontWeight:'500',textAlign:'center',fontFamily:FONTS.body},
  doneBtn:  {alignSelf:'center',marginTop:8,width:200,height:52,borderRadius:14,backgroundColor:'rgba(255,154,139,0.70)',alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.10,shadowRadius:6,elevation:3},
  doneBtnPressed:{backgroundColor:'rgba(200,100,90,0.75)'},
  doneBtnText:{color:'rgba(242,232,220,1)',fontWeight:'700',fontSize:16,fontFamily:FONTS.body},
  overlay:  {flex:1,backgroundColor:'rgba(0,0,0,0.35)',justifyContent:'center',alignItems:'center'},
  pickerCard:{backgroundColor:'#FFF8F5',borderRadius:24,padding:22,width:320,shadowColor:'#000',shadowOffset:{width:0,height:8},shadowOpacity:0.15,shadowRadius:16,elevation:10},
  pickerTitle:{fontSize:18,fontWeight:'700',color:PALETTE.textDark,textAlign:'center',marginBottom:16,fontFamily:FONTS.title},
  pickRow:  {flexDirection:'row',justifyContent:'space-around',marginBottom:16},
  pickCol:  {alignItems:'center',flex:1},
  pickLabel:{fontSize:12,fontWeight:'700',color:PALETTE.textMuted,marginBottom:8,fontFamily:FONTS.body},
  pickScroll:{maxHeight:160},
  chip:     {paddingVertical:9,paddingHorizontal:10,borderRadius:10,marginBottom:4,minWidth:48,alignItems:'center'},
  chipOn:   {backgroundColor:PALETTE.active},
  chipTxt:  {fontSize:15,fontWeight:'600',color:PALETTE.textDark,fontFamily:FONTS.body},
  chipTxtOn:{color:'#fff'},
  confirmBtn:{backgroundColor:PALETTE.active,borderRadius:14,paddingVertical:13,alignItems:'center'},
  confirmBtnPressed:{backgroundColor:PALETTE.activeDark},
  confirmTxt:{color:'#fff',fontWeight:'700',fontSize:16,fontFamily:FONTS.body},
  calNav:   {flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},
  calNavBtn:{width:36,height:36,alignItems:'center',justifyContent:'center'},
  calArrow: {fontSize:24,color:PALETTE.active,fontWeight:'700'},
  calMonthLbl:{fontSize:16,fontWeight:'700',color:PALETTE.textDark,fontFamily:FONTS.title},
  weekRow:  {flexDirection:'row',justifyContent:'space-around',marginBottom:6},
  weekDay:  {width:36,textAlign:'center',fontSize:12,fontWeight:'700',color:PALETTE.textMuted,fontFamily:FONTS.body},
  calGrid:  {flexDirection:'row',flexWrap:'wrap'},
  dayBlank: {width:36,height:36,margin:2},
  calDay:   {width:36,height:36,margin:2,borderRadius:18,alignItems:'center',justifyContent:'center'},
  calDayOn: {backgroundColor:PALETTE.active},
  calDayTxt:{fontSize:14,color:PALETTE.textDark,fontFamily:FONTS.body},
  calDayTxtOn:{color:'#fff',fontWeight:'700'},
})
