import React, { useState } from 'react'
import { apiPost } from "@/utils/api"
import { API_USER_ID } from './apiConfig'
import {
  View, Text, TextInput, StyleSheet, Pressable,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { GradientBackground } from './gradientBg'
import { AppBottomNav } from './AppBottomNav'

type Props = { onBack?:()=>void; onAddHousemate?:()=>void; onAddHouse?:(data:{houseName:string;password:string})=>void }

const COLORS = {
  cardBg:'rgba(255,255,255,0.84)', active:'#EC8575',
  doneBtn:'rgba(255,154,139,0.70)', doneText:'rgba(242,232,220,1)',
  textDark:'#000', textMuted:'#5C5C5C', shadow:'#000',
}

async function addHouseApi(name:string){
  try { const result = await apiPost("/house",{name,user_id:API_USER_ID}); console.log(result) }
  catch(err) { console.error("Error adding house:",err) }
}

export default function AddHouseScreen({ onBack=()=>{}, onAddHousemate=()=>{}, onAddHouse=()=>{} }: Props) {
  const router = useRouter()
  const [houseName, setHouseName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string|null>(null)

  const handleBack = () => { if(onBack) onBack(); else router.back() }

  const handleAddHouse = () => {
    if(!houseName.trim()){setError('Please enter a name for your house.');return}
    if(password.length<6){setError('Password must be at least 6 characters.');return}
    setError('')
    addHouseApi(houseName)
    onAddHouse({houseName,password})
  }

  return (
    <GradientBackground>
      <SafeAreaView style={s.safeArea}>
        <View style={s.page}>
          <View style={s.topRow}>
            <Pressable style={({pressed})=>[s.topIconBtn,pressed&&s.pressed]} onPress={handleBack}>
              <Text style={s.backArrow}>←</Text>
            </Pressable>
            <View style={s.titleWrap}><Text style={s.title}>Add a House</Text></View>
            <View style={s.topIconBtn}/>
          </View>

          <KeyboardAvoidingView style={s.flex} behavior={Platform.OS==='ios'?'padding':'height'} keyboardVerticalOffset={Platform.OS==='ios'?0:20}>
            <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={s.mainCard}>
                <View style={s.fieldBlock}>
                  <Text style={s.fieldLabel}>Name your House!</Text>
                  <View style={[s.lineWrap,focusedField==='name'&&s.lineWrapFocused]}>
                    <TextInput
                      style={s.lineInput} value={houseName} onChangeText={setHouseName}
                      onFocus={()=>setFocusedField('name')} onBlur={()=>setFocusedField(null)}
                      placeholder="" placeholderTextColor={COLORS.textMuted}
                      cursorColor={COLORS.active} autoCapitalize="words" returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={s.fieldBlock}>
                  <View style={s.memberRow}>
                    <Text style={s.fieldLabel}>Add House Members</Text>
                    <Pressable onPress={onAddHousemate} style={({pressed})=>[s.plusBtn,pressed&&s.pressed]}>
                      <Text style={s.plusText}>⊕</Text>
                    </Pressable>
                  </View>
                  <View style={s.lineWrap}><View style={s.lineInputStatic}/></View>
                </View>

                <View style={s.fieldBlockLast}>
                  <Text style={s.fieldLabel}>Create a Password for Your House</Text>
                  <View style={[s.lineWrap,focusedField==='password'&&s.lineWrapFocused]}>
                    <TextInput
                      style={s.lineInput} value={password} onChangeText={setPassword}
                      onFocus={()=>setFocusedField('password')} onBlur={()=>setFocusedField(null)}
                      placeholder="" placeholderTextColor={COLORS.textMuted}
                      cursorColor={COLORS.active} secureTextEntry autoCapitalize="none"
                      returnKeyType="done" onSubmitEditing={handleAddHouse}
                    />
                  </View>
                </View>

                {error!==''&&<View style={s.errorBanner}><Text style={s.errorText}>{error}</Text></View>}

                <Pressable style={({pressed})=>[s.addHouseButton,pressed&&s.btnPressed]} onPress={handleAddHouse}>
                  <Text style={s.addHouseButtonText}>Add House</Text>
                </Pressable>
              </View>
              <View style={{height:120}}/>
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
  scrollContent:{paddingTop:20,paddingBottom:24},
  mainCard:{backgroundColor:COLORS.cardBg,borderRadius:24,paddingHorizontal:24,paddingTop:46,paddingBottom:28,minHeight:560,shadowColor:COLORS.shadow,shadowOffset:{width:0,height:4},shadowOpacity:0.12,shadowRadius:7,elevation:4},
  fieldBlock:{marginBottom:54},
  fieldBlockLast:{marginBottom:40},
  fieldLabel:{fontSize:18,color:COLORS.textDark,marginBottom:8,fontWeight:'500'},
  memberRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  plusBtn:{width:32,height:32,alignItems:'center',justifyContent:'center',marginRight:6},
  plusText:{fontSize:24,color:COLORS.textDark,fontWeight:'400'},
  lineWrap:{borderBottomWidth:1.5,borderBottomColor:'rgba(0,0,0,0.72)'},
  lineWrapFocused:{borderBottomColor:COLORS.active},
  lineInput:{height:36,fontSize:16,color:COLORS.textDark,paddingHorizontal:0,paddingBottom:2,backgroundColor:'transparent'},
  lineInputStatic:{height:36,backgroundColor:'transparent'},
  errorBanner:{backgroundColor:'rgba(255,255,255,0.84)',borderRadius:14,paddingHorizontal:14,paddingVertical:12,marginBottom:18},
  errorText:{color:COLORS.active,fontSize:13,fontWeight:'500',textAlign:'center'},
  addHouseButton:{alignSelf:'center',marginTop:6,width:136,height:52,borderRadius:16,backgroundColor:COLORS.doneBtn,alignItems:'center',justifyContent:'center',shadowColor:COLORS.shadow,shadowOffset:{width:0,height:4},shadowOpacity:0.12,shadowRadius:6,elevation:3},
  btnPressed:{backgroundColor:'rgba(200,100,90,0.75)'},
  addHouseButtonText:{color:COLORS.doneText,fontWeight:'700',fontSize:16},
})
