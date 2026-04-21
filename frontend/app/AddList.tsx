import React, { useState } from 'react'
import { apiPost } from '@/utils/api'
import { API_HOUSE_ID } from './apiConfig'
import {
  View, Text, TextInput, StyleSheet, Pressable,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { GradientBackground } from './gradientBg'
import { AppBottomNav } from './AppBottomNav'
import { shoppingStore } from './store'
import { FONTS, PALETTE } from './fonts'

type Props = { onBack?:()=>void; onDone?:(data:{listName:string;price:string;date:string})=>void }

export default function AddListScreen({onBack,onDone}:Props) {
  const router = useRouter()
  const [listName, setListName]       = useState('')
  const [price,    setPrice]          = useState('00.00')
  const [date,     setDate]           = useState('02/27')
  const [focused,  setFocused]        = useState<string|null>(null)
  const [error,    setError]          = useState('')
  const [saving,   setSaving]         = useState(false)

  const handleBack = () => { if(onBack) onBack(); else router.back() }

  const handleDone = async () => {
    if (!listName.trim()) { setError('Please enter a name for your list.'); return }
    setError(''); setSaving(true)
    try {
      const res = (await apiPost('/shopping/list',{name:listName.trim(),house_id:API_HOUSE_ID})) as {list_id?:string}
      const newId = res.list_id??`local-${Date.now()}`
      shoppingStore.addList({id:newId,title:listName.trim(),list_id:res.list_id,items:[],collapsed:false})
    } catch {
      shoppingStore.addList({id:`local-${Date.now()}`,title:listName.trim(),list_id:undefined,items:[],collapsed:false})
    } finally { setSaving(false) }
    onDone?.({listName,price,date}); router.back()
  }

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.page}>
          <View style={s.topRow}>
            <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]} onPress={handleBack}>
              <Text style={s.backArrow}>←</Text>
            </Pressable>
            <View style={s.titleWrap}><Text style={s.title}>Add List</Text></View>
            <View style={s.iconBtn}/>
          </View>

          <KeyboardAvoidingView style={s.flex} behavior={Platform.OS==='ios'?'padding':'height'}>
            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={s.rowCard}>
                <Text style={s.rowLabel}>Name List</Text>
                <TextInput style={[s.inputBox,focused==='name'&&s.inputFocused]} value={listName} onChangeText={setListName}
                  onFocus={()=>setFocused('name')} onBlur={()=>setFocused(null)}
                  cursorColor={PALETTE.active} autoCapitalize="words" returnKeyType="next"/>
              </View>
              <View style={s.rowCard}>
                <Text style={s.rowLabel}>Add Price</Text>
                <TextInput style={[s.smallBox,focused==='price'&&s.inputFocused,s.coral]} placeholder="00.00" placeholderTextColor={PALETTE.active}
                  value={price} onChangeText={setPrice} onFocus={()=>setFocused('price')} onBlur={()=>setFocused(null)}
                  cursorColor={PALETTE.active} keyboardType="decimal-pad" textAlign="center"/>
              </View>
              <View style={s.rowCard}>
                <Text style={s.rowLabel}>Enter Date</Text>
                <TextInput style={[s.smallBox,focused==='date'&&s.inputFocused,s.coral]} placeholder="02/27" placeholderTextColor={PALETTE.active}
                  value={date} onChangeText={setDate} onFocus={()=>setFocused('date')} onBlur={()=>setFocused(null)}
                  cursorColor={PALETTE.active} keyboardType="numbers-and-punctuation" textAlign="center" onSubmitEditing={handleDone}/>
              </View>
              {error!==''&&<View style={s.errBanner}><Text style={s.errText}>{error}</Text></View>}
              {/* Rectangular Done button */}
              <Pressable style={({pressed})=>[s.doneBtn,pressed&&s.doneBtnPressed,saving&&s.doneBtnPressed]} onPress={handleDone} disabled={saving}>
                <Text style={s.doneBtnText}>{saving?'Saving…':'Done'}</Text>
              </Pressable>
              <View style={{height:110}}/>
            </ScrollView>
          </KeyboardAvoidingView>
          <AppBottomNav/>
        </View>
      </SafeAreaView>
    </GradientBackground>
  )
}

const s = StyleSheet.create({
  safe:         {flex:1,backgroundColor:'transparent'},
  page:         {flex:1,paddingHorizontal:16},
  flex:         {flex:1},
  topRow:       {flexDirection:'row',alignItems:'center',marginTop:10,marginBottom:18,paddingHorizontal:4},
  iconBtn:      {width:36,height:36,alignItems:'center',justifyContent:'center'},
  backArrow:    {fontSize:22,color:PALETTE.textDark,fontWeight:'500'},
  titleWrap:    {flex:1,alignItems:'center'},
  title:        {fontSize:26,fontWeight:'700',color:PALETTE.textDark,fontFamily:FONTS.title},
  pressed:      {opacity:0.6},
  scroll:       {paddingTop:26,paddingBottom:24},
  rowCard:      {width:'100%',minHeight:76,backgroundColor:'rgba(255,255,255,0.84)',borderRadius:18,paddingHorizontal:22,marginBottom:28,flexDirection:'row',alignItems:'center',justifyContent:'space-between',shadowColor:'#000',shadowOffset:{width:0,height:3},shadowOpacity:0.08,shadowRadius:6,elevation:3},
  rowLabel:     {fontSize:17,fontWeight:'500',color:PALETTE.textDark,fontFamily:FONTS.body},
  inputBox:     {width:142,height:50,borderRadius:14,backgroundColor:'rgba(255,243,216,0.40)',fontSize:16,color:PALETTE.textDark,paddingHorizontal:14,textAlign:'center',fontFamily:FONTS.body},
  smallBox:     {width:142,height:50,borderRadius:14,backgroundColor:'rgba(255,243,216,0.40)',fontSize:16,paddingHorizontal:14,textAlign:'center',fontFamily:FONTS.body},
  inputFocused: {borderWidth:1,borderColor:'rgba(236,133,117,0.4)'},
  coral:        {color:PALETTE.active},
  errBanner:    {backgroundColor:'rgba(255,255,255,0.84)',borderRadius:14,paddingHorizontal:14,paddingVertical:12,marginTop:-8,marginBottom:18},
  errText:      {color:PALETTE.active,fontSize:13,fontWeight:'500',textAlign:'center',fontFamily:FONTS.body},
  // Rectangular button matching home page Post style
  doneBtn:      {alignSelf:'center',marginTop:8,width:200,height:52,borderRadius:14,backgroundColor:'rgba(255,154,139,0.70)',alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.10,shadowRadius:6,elevation:3},
  doneBtnPressed:{backgroundColor:'rgba(200,100,90,0.75)'},
  doneBtnText:  {color:'rgba(242,232,220,1)',fontWeight:'700',fontSize:16,fontFamily:FONTS.body},
})
