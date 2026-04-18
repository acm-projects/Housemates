import React, { useState } from 'react'
import { apiPost } from "@/utils/api"
import { API_HOUSE_ID } from './apiConfig'
import {
  View, Text, TextInput, StyleSheet, Pressable,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { GradientBackground } from './gradientBg'
import { AppBottomNav } from './AppBottomNav'

type Props = { onBack?:()=>void; onDone?:(data:{listName:string;price:string;date:string})=>void }

const COLORS = {
  cardBg:'rgba(255,255,255,0.84)', inputBg:'rgba(255,243,216,0.40)',
  active:'#EC8575', doneBtn:'rgba(255,154,139,0.70)',
  doneText:'rgba(242,232,220,1)', textDark:'#000', textMuted:'#5C5C5C', shadow:'#000',
}

async function saveList(data:{listName:string;price:string;date:string}){
  try { const result = await apiPost('/shopping/list',{name:data.listName,house_id:API_HOUSE_ID}); console.log(result) }
  catch(err) { console.error('Error saving list:',err) }
}

export default function AddListScreen({onBack,onDone}:Props) {
  const router = useRouter()
  const [listName, setListName] = useState('')
  const [price, setPrice] = useState('00.00')
  const [date, setDate] = useState('02/27')
  const [focusedField, setFocusedField] = useState<string|null>(null)
  const [error, setError] = useState('')

  const handleBack = () => { if(onBack) onBack(); else router.back() }

  const handleDone = () => {
    if(!listName.trim()){setError('Please enter a name for your list.');return}
    setError('')
    saveList({listName,price,date})
    onDone?.({listName,price,date})
    router.back()
  }

  return (
    <GradientBackground>
      <SafeAreaView style={s.safeArea}>
        <View style={s.page}>
          <View style={s.topRow}>
            <Pressable style={({pressed})=>[s.topIconBtn,pressed&&s.pressed]} onPress={handleBack}>
              <Text style={s.backArrow}>←</Text>
            </Pressable>
            <View style={s.titleWrap}><Text style={s.title}>Add List</Text></View>
            <View style={s.topIconBtn}/>
          </View>

          <KeyboardAvoidingView style={s.flex} behavior={Platform.OS==='ios'?'padding':'height'}>
            <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={s.rowCard}>
                <Text style={s.rowLabel}>Name List</Text>
                <TextInput
                  style={[s.inputBox,focusedField==='name'&&s.inputBoxFocused]}
                  placeholder="" placeholderTextColor={COLORS.textMuted}
                  value={listName} onChangeText={setListName}
                  onFocus={()=>setFocusedField('name')} onBlur={()=>setFocusedField(null)}
                  cursorColor={COLORS.active} autoCapitalize="words" returnKeyType="next"
                />
              </View>

              <View style={s.rowCard}>
                <Text style={s.rowLabel}>Add Price</Text>
                <TextInput
                  style={[s.smallInputBox,focusedField==='price'&&s.inputBoxFocused,s.coralText]}
                  placeholder="00.00" placeholderTextColor={COLORS.active}
                  value={price} onChangeText={setPrice}
                  onFocus={()=>setFocusedField('price')} onBlur={()=>setFocusedField(null)}
                  cursorColor={COLORS.active} keyboardType="decimal-pad" returnKeyType="next" textAlign="center"
                />
              </View>

              <View style={s.rowCard}>
                <Text style={s.rowLabel}>Enter Date</Text>
                <TextInput
                  style={[s.smallInputBox,focusedField==='date'&&s.inputBoxFocused,s.coralText]}
                  placeholder="02/27" placeholderTextColor={COLORS.active}
                  value={date} onChangeText={setDate}
                  onFocus={()=>setFocusedField('date')} onBlur={()=>setFocusedField(null)}
                  cursorColor={COLORS.active} keyboardType="numbers-and-punctuation"
                  returnKeyType="done" onSubmitEditing={handleDone} textAlign="center"
                />
              </View>

              {error!==''&&<View style={s.errorBanner}><Text style={s.errorText}>{error}</Text></View>}

              <Pressable style={({pressed})=>[s.doneButton,pressed&&s.btnPressed]} onPress={handleDone}>
                <Text style={s.doneButtonText}>Done</Text>
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
  safeArea:{flex:1,backgroundColor:'transparent'},
  page:{flex:1,paddingHorizontal:16},
  flex:{flex:1},
  topRow:{flexDirection:'row',alignItems:'center',marginTop:10,marginBottom:18,paddingHorizontal:4},
  topIconBtn:{width:36,height:36,alignItems:'center',justifyContent:'center'},
  backArrow:{fontSize:22,color:COLORS.textDark,fontWeight:'500'},
  titleWrap:{flex:1,alignItems:'center'},
  title:{fontSize:22,fontWeight:'700',color:COLORS.textDark},
  pressed:{opacity:0.6},
  scrollContent:{paddingTop:26,paddingBottom:24},
  rowCard:{width:'100%',minHeight:76,backgroundColor:COLORS.cardBg,borderRadius:18,paddingHorizontal:22,marginBottom:32,flexDirection:'row',alignItems:'center',justifyContent:'space-between',shadowColor:COLORS.shadow,shadowOffset:{width:0,height:3},shadowOpacity:0.10,shadowRadius:6,elevation:3},
  rowLabel:{fontSize:17,fontWeight:'500',color:COLORS.textDark},
  inputBox:{width:142,height:50,borderRadius:14,backgroundColor:COLORS.inputBg,fontSize:16,fontWeight:'500',color:COLORS.textDark,paddingHorizontal:14,textAlign:'center'},
  smallInputBox:{width:142,height:50,borderRadius:14,backgroundColor:COLORS.inputBg,fontSize:16,fontWeight:'500',paddingHorizontal:14,textAlign:'center'},
  inputBoxFocused:{borderWidth:1,borderColor:'rgba(236,133,117,0.4)'},
  coralText:{color:COLORS.active},
  errorBanner:{backgroundColor:'rgba(255,255,255,0.84)',borderRadius:14,paddingHorizontal:14,paddingVertical:12,marginTop:-8,marginBottom:18},
  errorText:{color:COLORS.active,fontSize:13,fontWeight:'500',textAlign:'center'},
  doneButton:{alignSelf:'center',marginTop:6,width:136,height:52,borderRadius:16,backgroundColor:COLORS.doneBtn,alignItems:'center',justifyContent:'center',shadowColor:COLORS.shadow,shadowOffset:{width:0,height:4},shadowOpacity:0.12,shadowRadius:6,elevation:3},
  btnPressed:{backgroundColor:'rgba(200,100,90,0.75)'},
  doneButtonText:{color:COLORS.doneText,fontWeight:'700',fontSize:16},
})
