import React, { useCallback, useEffect, useState } from 'react'
import { apiDelete, apiGetWithBody, apiPost, extractDynamoItems } from '@/utils/api'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  View, Text, StyleSheet, Pressable, SafeAreaView,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { API_HOUSE_ID } from './apiConfig'
import { GradientBackground } from './gradientBg'
import { AppBottomNav } from './AppBottomNav'

type Item  = {id:string; name:string; price:string; checked:boolean; shoppingitem_id?:string; color:string}
type Group = {id:string; title:string; items:Item[]; list_id?:string; collapsed:boolean}

const SWATCH = ['#c9b8e8','#f5c6d0','#fde5b0','#b8e0d2','#aed6f1','#f9e0c0']
const C = {
  active:'#EC8575', textDark:'#000', textMuted:'#8b7b6b',
  glass:'rgba(255,255,255,0.65)', glassBorder:'rgba(255,255,255,0.55)',
}

const SEED: Group[] = [
  {id:'g1', title:'Grocery List', collapsed:false, items:[
    {id:'1',name:'Tomatoes',price:'$31.00',checked:false,color:SWATCH[0]},
    {id:'2',name:'Milk',    price:'$31.00',checked:false,color:SWATCH[1]},
  ]},
  {id:'g2', title:'Utilities List', collapsed:false, items:[
    {id:'3',name:'Water Bill',      price:'$31.00',checked:false,color:SWATCH[2]},
    {id:'4',name:'Electricity Bill',price:'$31.00',checked:false,color:SWATCH[3]},
  ]},
]

export default function ShoppingListScreen() {
  const router = useRouter()
  const [data, setData]       = useState<Group[]>(SEED)
  const [busy, setBusy]       = useState(false)
  const [drafts, setDrafts]   = useState<Record<string,{name:string;price:string}>>({})

  const mergeLists = useCallback(async () => {
    setBusy(true)
    try {
      const res  = await apiGetWithBody('/shopping/list', {house_id:API_HOUSE_ID})
      const rows = extractDynamoItems(res)
      setData(prev => {
        const map = new Map(prev.map(g=>[g.id,{...g}]))
        for (const row of rows) {
          const id   = String(row.list_id??''), name = String(row.name??'List')
          if (!id) continue
          const ex = map.get(id)
          map.set(id, ex ? {...ex,title:name,list_id:id} : {id,title:name,list_id:id,items:[],collapsed:false})
        }
        return Array.from(map.values())
      })
    } catch { /* silent */ }
    finally { setBusy(false) }
  }, [])

  useEffect(() => { mergeLists() }, [mergeLists])

  async function loadItems(group: Group) {
    if (!group.list_id) return
    setBusy(true)
    try {
      const rows = extractDynamoItems(await apiGetWithBody('/shopping/items', {list_id:group.list_id}))
      setData(prev => prev.map(g => g.id!==group.id ? g : {
        ...g,
        items: rows.map((it,i) => {
          const sid = String(it.shoppingitem_id??'')
          const pn  = typeof it.price==='number' ? it.price : Number.parseFloat(String(it.price??'0'))
          return {id:sid||`i${Math.random()}`,shoppingitem_id:sid||undefined,name:String(it.name??''),price:Number.isFinite(pn)?`$${pn.toFixed(2)}`:'$0.00',checked:false,color:SWATCH[i%SWATCH.length]}
        }),
      }))
    } catch(e) { Alert.alert('Load items failed', e instanceof Error?e.message:'Error') }
    finally { setBusy(false) }
  }

  async function addItem(group: Group) {
    if (!group.list_id) return
    const d = drafts[group.id] ?? {name:'',price:'0'}
    const name = d.name.trim(), price = Number.parseFloat(d.price)
    if (!name||Number.isNaN(price)) { Alert.alert('Fill in item name and price'); return }
    setBusy(true)
    try {
      const res = (await apiPost('/shopping/item',{name,description:'—',price,list_id:group.list_id,house_id:API_HOUSE_ID})) as {shoppingitem_id?:string}
      const sid = res.shoppingitem_id
      if (!sid) return
      const idx = group.items.length % SWATCH.length
      setData(prev=>prev.map(g=>g.id!==group.id?g:{...g,items:[...g.items,{id:sid,shoppingitem_id:sid,name,price:`$${price.toFixed(2)}`,checked:false,color:SWATCH[idx]}]}))
      setDrafts(prev=>({...prev,[group.id]:{name:'',price:'0'}}))
    } catch(e) { Alert.alert('Add item failed', e instanceof Error?e.message:'Error') }
    finally { setBusy(false) }
  }

  async function deleteItem(gid: string, item: Item) {
    if (!item.shoppingitem_id) return
    setBusy(true)
    try {
      await apiDelete('/shopping/item',{shoppingitem_id:item.shoppingitem_id})
      setData(prev=>prev.map(g=>g.id!==gid?g:{...g,items:g.items.filter(i=>i.id!==item.id)}))
    } catch(e) { Alert.alert('Delete failed', e instanceof Error?e.message:'Error') }
    finally { setBusy(false) }
  }

  function toggleItem(gid:string, iid:string) {
    setData(prev=>prev.map(g=>g.id!==gid?g:{...g,items:g.items.map(i=>i.id!==iid?i:{...i,checked:!i.checked})}))
  }
  function toggleCollapse(gid:string) {
    setData(prev=>prev.map(g=>g.id!==gid?g:{...g,collapsed:!g.collapsed}))
  }

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>

        {/* Header */}
        <View style={s.topRow}>
          <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]} onPress={()=>router.back()}>
            <Ionicons name="chevron-back" size={22} color={C.textDark}/>
          </Pressable>
          <Text style={s.title}>Shopping List</Text>
          <Pressable style={({pressed})=>[s.iconBtn,pressed&&s.pressed]}>
            <Ionicons name="notifications" size={22} color={C.textDark}/>
            <View style={s.dot}/>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {busy && <ActivityIndicator color={C.active} style={{marginBottom:10}}/>}

          {data.map(group => (
            <View key={group.id} style={s.section}>

              {/* Group header — glass card style */}
              <Pressable style={({pressed})=>[s.glassGroupHeader, pressed&&s.pressed]} onPress={()=>toggleCollapse(group.id)}>
                <Text style={s.groupTitle}>{group.title}</Text>
                <Ionicons name={group.collapsed?'chevron-up':'chevron-down'} size={20} color={C.textDark}/>
              </Pressable>

              {!group.collapsed && (
                <>
                  {group.items.map(item => (
                    <Pressable key={item.id}
                      style={({pressed})=>[s.glassCard, pressed&&s.pressed]}
                      onPress={()=>toggleItem(group.id, item.id)}>
                      {/* Colored circle swatch */}
                      <View style={[s.swatch,{backgroundColor:item.color}]}/>
                      <View style={s.itemInfo}>
                        <Text style={s.itemPrice}>{item.price}</Text>
                        <Text style={[s.itemName, item.checked&&s.itemStrike]}>{item.name}</Text>
                      </View>
                      {item.checked && (
                        <Ionicons name="checkmark-circle" size={20} color={C.active}/>
                      )}
                      {item.shoppingitem_id && (
                        <Pressable onPress={()=>deleteItem(group.id,item)} hitSlop={10}
                          style={({pressed})=>[pressed&&s.pressed]}>
                          <Ionicons name="close-circle-outline" size={20} color={C.textMuted} style={{marginLeft:6}}/>
                        </Pressable>
                      )}
                    </Pressable>
                  ))}

                  {/* Add item row (only for server-linked lists) */}
                  {group.list_id && (
                    <View style={s.addRow}>
                      <TextInput
                        style={s.addInput}
                        placeholder="Item name"
                        placeholderTextColor={C.textMuted}
                        value={drafts[group.id]?.name??''}
                        onChangeText={t=>setDrafts(p=>({...p,[group.id]:{...(p[group.id]??{name:'',price:'0'}),name:t}}))}
                      />
                      <TextInput
                        style={[s.addInput,{width:72}]}
                        placeholder="Price"
                        placeholderTextColor={C.textMuted}
                        value={drafts[group.id]?.price??''}
                        onChangeText={t=>setDrafts(p=>({...p,[group.id]:{...(p[group.id]??{name:'',price:'0'}),price:t}}))}
                        keyboardType="decimal-pad"
                      />
                      <Pressable style={({pressed})=>[s.addBtn,pressed&&s.addBtnPressed]} onPress={()=>addItem(group)}>
                        <Ionicons name="add" size={20} color="#fff"/>
                      </Pressable>
                    </View>
                  )}
                </>
              )}
            </View>
          ))}

          <View style={{height:110}}/>
        </ScrollView>

        {/* Add List FAB */}
        <Pressable style={({pressed})=>[s.fab, pressed&&s.fabPressed]} onPress={()=>router.push('/AddList')}>
          <View style={s.fabIcon}><Ionicons name="add" size={20} color="#1a1a1a"/></View>
          <Text style={s.fabText}>Add List</Text>
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
  section:   {marginBottom:8},
  glassGroupHeader: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    backgroundColor:C.glass, borderRadius:18, borderWidth:1, borderColor:C.glassBorder,
    paddingHorizontal:18, paddingVertical:14, marginBottom:8,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:4, elevation:1,
  },
  groupTitle:{fontSize:18, fontWeight:'700', color:C.textDark},
  glassCard: {
    backgroundColor:C.glass, borderRadius:18, borderWidth:1, borderColor:C.glassBorder,
    paddingHorizontal:18, paddingVertical:14, marginBottom:8,
    flexDirection:'row', alignItems:'center',
    shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:6, elevation:2,
  },
  swatch:    {width:36, height:36, borderRadius:18, marginRight:14},
  itemInfo:  {flex:1},
  itemPrice: {fontSize:16, fontWeight:'700', color:C.textDark, marginBottom:2},
  itemName:  {fontSize:13, color:C.textMuted},
  itemStrike:{textDecorationLine:'line-through'},
  addRow:    {flexDirection:'row', gap:8, marginBottom:12, marginTop:4},
  addInput:  {flex:1, borderWidth:1, borderColor:'rgba(236,133,117,0.25)', borderRadius:14, paddingHorizontal:12, paddingVertical:10, fontSize:14, color:C.textDark, backgroundColor:'rgba(255,255,255,0.65)'},
  addBtn:    {width:44, height:44, borderRadius:14, backgroundColor:C.active, alignItems:'center', justifyContent:'center'},
  addBtnPressed:{backgroundColor:'#c96d5e'},
  fab:       {position:'absolute', right:16, bottom:90, flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(236,133,117,0.88)', borderRadius:999, paddingHorizontal:16, paddingVertical:10},
  fabIcon:   {width:30, height:30, borderRadius:15, backgroundColor:'rgba(255,255,255,0.35)', alignItems:'center', justifyContent:'center'},
  fabPressed:{backgroundColor:'#c96d5e'},
  fabText:   {color:'#1a1a1a', fontWeight:'600'},
})
