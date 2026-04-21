import React, { useCallback, useEffect, useState } from 'react'
import { apiDelete, apiGetWithBody, apiPost, extractDynamoItems } from '@/utils/api'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native'
import { API_HOUSE_ID } from './apiConfig'
import { GradientBackground } from './gradientBg'
import { AppBottomNav } from './AppBottomNav'
import { GlassCard } from '@/components/glass-ui'
import { shoppingStore, ShoppingList, ShoppingItem } from './store'
import { FONTS, PALETTE } from './fonts'

const SWATCH = ['#c9b8e8','#f5c6d0','#fde5b0','#b8e0d2','#aed6f1','#f9e0c0']
const FAB_TEXT = '#F2E8DC'

export default function ShoppingListScreen() {
  const router=useRouter()
  const [lists,setLists]=useState<ShoppingList[]>(()=>[...shoppingStore.getLists()])
  const [busy,setBusy]=useState(false)
  const [drafts,setDrafts]=useState<Record<string,{name:string;price:string}>>({})

  useEffect(()=>shoppingStore.subscribe(()=>setLists([...shoppingStore.getLists()])),[])

  const mergeLists=useCallback(async()=>{
    setBusy(true)
    try{
      const rows=extractDynamoItems(await apiGetWithBody('/shopping/list',{house_id:API_HOUSE_ID}))
      shoppingStore.mergeLists(rows.filter(r=>r.list_id).map(r=>({id:String(r.list_id),title:String(r.name??'List'),list_id:String(r.list_id)})))
    }catch{/*silent*/}
    finally{setBusy(false)}
  },[])
  useEffect(()=>{mergeLists()},[mergeLists])

  async function loadItems(group:ShoppingList){
    if(!group.list_id)return
    setBusy(true)
    try{
      const rows=extractDynamoItems(await apiGetWithBody('/shopping/items',{list_id:group.list_id}))
      shoppingStore.setItems(group.id,rows.map((it,i)=>{
        const sid=String(it.shoppingitem_id??'')
        const pn=typeof it.price==='number'?it.price:Number.parseFloat(String(it.price??'0'))
        return{id:sid||`i${Math.random()}`,shoppingitem_id:sid||undefined,name:String(it.name??''),price:Number.isFinite(pn)?`$${pn.toFixed(2)}`:'$0.00',checked:false,color:SWATCH[i%SWATCH.length]}
      }))
    }catch(e){Alert.alert('Load items failed',e instanceof Error?e.message:'Error')}
    finally{setBusy(false)}
  }

  async function addItem(group:ShoppingList){
    const d=drafts[group.id]??{name:'',price:'0'}
    const name=d.name.trim(),price=Number.parseFloat(d.price)
    if(!name){Alert.alert('Enter an item name');return}
    if(Number.isNaN(price)){Alert.alert('Enter a valid price');return}
    const colorIdx=group.items.length%SWATCH.length
    if(group.list_id){
      setBusy(true)
      try{
        const res=(await apiPost('/shopping/item',{name,description:'—',price,list_id:group.list_id,house_id:API_HOUSE_ID})) as {shoppingitem_id?:string}
        shoppingStore.addItem(group.id,{id:res.shoppingitem_id??`local-${Date.now()}`,shoppingitem_id:res.shoppingitem_id,name,price:`$${price.toFixed(2)}`,checked:false,color:SWATCH[colorIdx]})
      }catch{shoppingStore.addItem(group.id,{id:`local-${Date.now()}`,name,price:`$${price.toFixed(2)}`,checked:false,color:SWATCH[colorIdx]})}
      finally{setBusy(false)}
    }else{
      shoppingStore.addItem(group.id,{id:`local-${Date.now()}`,name,price:`$${price.toFixed(2)}`,checked:false,color:SWATCH[colorIdx]})
    }
    setDrafts(p=>({...p,[group.id]:{name:'',price:'0'}}))
  }

  async function deleteItem(listId:string,item:ShoppingItem){
    if(item.shoppingitem_id){try{await apiDelete('/shopping/item',{shoppingitem_id:item.shoppingitem_id})}catch{}}
    shoppingStore.removeItem(listId,item.id)
  }

  const dn=(g:string)=>drafts[g]?.name??''
  const dp=(g:string)=>drafts[g]?.price??'0'
  const sdn=(g:string,v:string)=>setDrafts(p=>({...p,[g]:{...(p[g]??{name:'',price:'0'}),name:v}}))
  const sdp=(g:string,v:string)=>setDrafts(p=>({...p,[g]:{...(p[g]??{name:'',price:'0'}),price:v}}))

  return(
    <GradientBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.topRow}>
          <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]} onPress={()=>router.back()}>
            <Ionicons name="chevron-back" size={22} color={PALETTE.textDark}/>
          </Pressable>
          <Text style={s.title}>Shopping List</Text>
          <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]}>
            <Ionicons name="notifications" size={20} color={PALETTE.textDark}/>
            <View style={s.dot}/>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {busy&&<ActivityIndicator color={PALETTE.active} style={{marginBottom:10}}/>}
          {lists.length===0&&!busy&&(
            <GlassCard style={s.emptyCard}>
              <Text style={s.emptyTitle}>No lists yet</Text>
              <Text style={s.emptySub}>Tap "Add List" to create your first one</Text>
            </GlassCard>
          )}
          {lists.map(group=>(
            <View key={group.id} style={s.section}>
              <Pressable style={({pressed})=>[pressed&&s.pressed]} onPress={()=>shoppingStore.toggleCollapse(group.id)}>
                <GlassCard style={s.groupHeader}>
                  <Text style={s.groupTitle}>{group.title}</Text>
                  <View style={s.groupRight}>
                    {group.list_id&&(
                      <Pressable onPress={()=>loadItems(group)} hitSlop={10} style={({pressed})=>[{marginRight:8},pressed&&s.pressed]}>
                        <Ionicons name="cloud-download-outline" size={18} color={PALETTE.textMuted}/>
                      </Pressable>
                    )}
                    <Ionicons name={group.collapsed?'chevron-up':'chevron-down'} size={20} color={PALETTE.textDark}/>
                  </View>
                </GlassCard>
              </Pressable>
              {!group.collapsed&&(
                <>
                  {group.items.length===0&&<View style={s.emptyList}><Text style={s.emptyListText}>No items yet — add one below</Text></View>}
                  {group.items.map(item=>(
                    <Pressable key={item.id} style={({pressed})=>[pressed&&s.pressed]} onPress={()=>shoppingStore.toggleItem(group.id,item.id)}>
                      <GlassCard style={s.itemCard}>
                        <View style={[s.swatch,{backgroundColor:item.color}]}/>
                        <View style={s.itemInfo}>
                          <Text style={s.itemPrice}>{item.price}</Text>
                          <Text style={[s.itemName,item.checked&&s.itemStrike]}>{item.name}</Text>
                        </View>
                        {item.checked&&<Ionicons name="checkmark-circle" size={20} color={PALETTE.active}/>}
                        <Pressable onPress={()=>deleteItem(group.id,item)} hitSlop={10} style={({pressed})=>[{marginLeft:6},pressed&&s.pressed]}>
                          <Ionicons name="close-circle-outline" size={20} color={PALETTE.textMuted}/>
                        </Pressable>
                      </GlassCard>
                    </Pressable>
                  ))}
                  <View style={s.addRow}>
                    <TextInput style={s.addInput} placeholder="Add item…" placeholderTextColor={PALETTE.textMuted} value={dn(group.id)} onChangeText={v=>sdn(group.id,v)} returnKeyType="next"/>
                    <TextInput style={[s.addInput,{width:72}]} placeholder="$0.00" placeholderTextColor={PALETTE.textMuted} value={dp(group.id)} onChangeText={v=>sdp(group.id,v)} keyboardType="decimal-pad" returnKeyType="done" onSubmitEditing={()=>addItem(group)}/>
                    <Pressable style={({pressed})=>[s.addBtn,pressed&&s.addBtnPressed]} onPress={()=>addItem(group)}>
                      <Ionicons name="add" size={22} color="#fff"/>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ))}
          <View style={{height:110}}/>
        </ScrollView>

        {/* Add List FAB — rectangular, F2E8DC, no border on + */}
        <Pressable style={({pressed})=>[s.fab,pressed&&s.fabPressed]} onPress={()=>router.push('/AddList')}>
          <Text style={s.fabIcon}>+</Text>
          <Text style={s.fabText}>Add List</Text>
        </Pressable>
        <AppBottomNav/>
      </SafeAreaView>
    </GradientBackground>
  )
}

const s=StyleSheet.create({
  safe:       {flex:1,backgroundColor:'transparent'},
  topRow:     {flexDirection:'row',alignItems:'center',marginTop:10,marginBottom:8,paddingHorizontal:16},
  iconBtn:    {width:36,height:36,alignItems:'center',justifyContent:'center',position:'relative'},
  dot:        {position:'absolute',top:6,right:6,width:8,height:8,borderRadius:4,backgroundColor:PALETTE.active,borderWidth:1,borderColor:'#fff'},
  title:      {flex:1,textAlign:'center',fontSize:26,fontWeight:'700',color:PALETTE.textDark,fontFamily:FONTS.title},
  pressed:    {opacity:0.6},
  scroll:     {paddingHorizontal:16,paddingBottom:24},
  section:    {marginBottom:8},
  groupHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:18,paddingVertical:14,marginBottom:8},
  groupRight: {flexDirection:'row',alignItems:'center'},
  groupTitle: {fontSize:18,fontWeight:'700',color:PALETTE.textDark,flex:1,fontFamily:FONTS.title},
  itemCard:   {flexDirection:'row',alignItems:'center',paddingHorizontal:18,paddingVertical:14,marginBottom:8},
  swatch:     {width:36,height:36,borderRadius:18,marginRight:14},
  itemInfo:   {flex:1},
  itemPrice:  {fontSize:16,fontWeight:'700',color:PALETTE.textDark,marginBottom:2,fontFamily:FONTS.titleReg},
  itemName:   {fontSize:13,color:PALETTE.textMuted,fontFamily:FONTS.body},
  itemStrike: {textDecorationLine:'line-through'},
  emptyList:  {paddingVertical:12,paddingHorizontal:4,marginBottom:8},
  emptyListText:{color:PALETTE.textMuted,fontSize:13,fontStyle:'italic',fontFamily:FONTS.body},
  emptyCard:  {padding:40,alignItems:'center',gap:8},
  emptyTitle: {color:PALETTE.textMuted,fontSize:16,fontWeight:'600',fontFamily:FONTS.titleReg},
  emptySub:   {color:PALETTE.textMuted,fontSize:13,fontFamily:FONTS.body},
  addRow:     {flexDirection:'row',gap:8,marginBottom:12,marginTop:4},
  addInput:   {flex:1,borderWidth:1,borderColor:'rgba(236,133,117,0.25)',borderRadius:14,paddingHorizontal:12,paddingVertical:10,fontSize:14,color:PALETTE.textDark,backgroundColor:'rgba(255,255,255,0.65)',fontFamily:FONTS.body},
  addBtn:     {width:44,height:44,borderRadius:14,backgroundColor:PALETTE.active,alignItems:'center',justifyContent:'center'},
  addBtnPressed:{backgroundColor:PALETTE.activeDark},
  // FAB — rectangular, F2E8DC, no border/circle around +
  fab:        {position:'absolute',right:16,bottom:90,flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'rgba(236,133,117,0.88)',borderRadius:14,paddingHorizontal:20,paddingVertical:14},
  fabPressed: {backgroundColor:PALETTE.activeDark},
  fabIcon:    {fontSize:20,color:FAB_TEXT,fontWeight:'800',lineHeight:22},
  fabText:    {color:FAB_TEXT,fontWeight:'700',fontSize:15,fontFamily:FONTS.body},
})
