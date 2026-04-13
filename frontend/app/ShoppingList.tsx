import React, { useCallback, useEffect, useState } from "react"
import { apiDelete, apiGetWithBody, apiPost, apiPut, extractDynamoItems } from "@/utils/api"
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native"
import { API_HOUSE_ID } from "./apiConfig"
import { BackgroundGlows, GLASS_COLORS } from "@/components/glass-ui"
import {
  HomeIcon,
  ChecklistIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ExpensesIcon
} from "./icons"

// --- Types ---
type Item = {
  id: string
  name: string
  price: string
  checked: boolean
  shoppingitem_id?: string
}

type Group = {
  id: string
  title: string
  items: Item[]
  list_id?: string
}

type TabItem = { id: string; icon: React.ReactNode }

// --- Colors ---
export const COLORS = {
  bg:           GLASS_COLORS.bg,
  cardBg:       '#F2F5FA',  
  primary:      '#0A2239',
  secondary:    '#6CA6C1',
  accent:       '#ADB6C4',
  textDark:     '#132E32',
  textMuted:    '#98AAC5',
  border:       '#6CA6C1', 
  borderFocus:  '#ADB6C4',
  white:        '#FFFFFF',
}


// --- Tab Bar ---
const tabs: TabItem[] = [
  { id: "list",     icon: <ChecklistIcon   size={24} color={COLORS.primary} /> },
  { id: "wallet",   icon: <ShoppingBagIcon size={24} color={COLORS.primary} /> },
  { id: "home",     icon: <HomeIcon        size={24} color={COLORS.primary} /> },
  { id: "calendar", icon: <CalendarIcon    size={24} color={COLORS.primary} /> },
  { id: "flag",     icon: <ExpensesIcon    size={24} color={COLORS.primary} /> }
]

function BottomTabBar({
  activeTab,
  onTabPress
}: {
  activeTab: string
  onTabPress: (id: string) => void
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={() => onTabPress(tab.id)}
        >
          {activeTab === tab.id && <View style={styles.tabIndicator} />}
          {tab.icon}
        </TouchableOpacity>
      ))}
    </View>
  )
}

// --- Sample Data ---
const initialData: Group[] = [
  {
    id: "g1",
    title: "Produce",
    items: [
      { id: "1", name: "Bananas", price: "$1.20", checked: false },
      { id: "2", name: "Apples",  price: "$2.00", checked: false }
    ]
  },
  {
    id: "g2",
    title: "Dairy",
    items: [
      { id: "3", name: "Milk", price: "$3.10", checked: false },
      { id: "4", name: "Eggs", price: "$4.25", checked: false }
    ]
  }
]

// --- Main Screen ---
export default function ShoppingListScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("wallet")
  const [data, setData] = useState<Group[]>(initialData)
  const [newListName, setNewListName] = useState("")
  const [shopBusy, setShopBusy] = useState(false)
  const [itemDrafts, setItemDrafts] = useState<Record<string, { name: string; description: string; price: string }>>({})
  const [updateListId, setUpdateListId] = useState("")
  const [updateListName, setUpdateListName] = useState("")
  const [updateItemId, setUpdateItemId] = useState("")
  const [updateItemName, setUpdateItemName] = useState("")
  const [updateItemPrice, setUpdateItemPrice] = useState("")

  const mergeListsFromApi = useCallback(async () => {
    setShopBusy(true)
    try {
      const data = await apiGetWithBody("/shopping/list", { house_id: API_HOUSE_ID })
      const rows = extractDynamoItems(data)
      setData((prev) => {
        const byId = new Map(prev.map((g) => [g.id, { ...g }]))
        for (const row of rows) {
          const list_id = String(row.list_id ?? "")
          const name = String(row.name ?? "List")
          if (!list_id) continue
          const existing = byId.get(list_id)
          if (existing) {
            byId.set(list_id, { ...existing, title: name, list_id })
          } else {
            byId.set(list_id, { id: list_id, title: name, list_id, items: [] })
          }
        }
        return Array.from(byId.values())
      })
    } catch (e) {
      Alert.alert("GET /shopping/list failed", e instanceof Error ? e.message : "Unknown error")
    } finally {
      setShopBusy(false)
    }
  }, [])

  useEffect(() => {
    mergeListsFromApi()
  }, [mergeListsFromApi])

  async function loadItemsForGroup(group: Group) {
    if (!group.list_id) return
    setShopBusy(true)
    try {
      const data = await apiGetWithBody("/shopping/items", { list_id: group.list_id })
      const rows = extractDynamoItems(data)
      setData((prev) =>
        prev.map((g) =>
          g.id !== group.id
            ? g
            : {
                ...g,
                items: rows.map((item) => {
                  const shoppingitem_id = String(item.shoppingitem_id ?? "")
                  const priceVal = item.price
                  const priceNum =
                    typeof priceVal === "number"
                      ? priceVal
                      : Number.parseFloat(String(priceVal ?? "0"))
                  return {
                    id: shoppingitem_id || `i-${Math.random()}`,
                    shoppingitem_id: shoppingitem_id || undefined,
                    name: String(item.name ?? ""),
                    price: Number.isFinite(priceNum) ? `$${priceNum.toFixed(2)}` : "$0.00",
                    checked: false,
                  }
                }),
              },
        ),
      )
    } catch (e) {
      Alert.alert("GET /shopping/items failed", e instanceof Error ? e.message : "Unknown error")
    } finally {
      setShopBusy(false)
    }
  }

  async function updateListViaApi() {
    const list_id = updateListId.trim()
    const name = updateListName.trim()
    if (!list_id || !name) {
      Alert.alert("PUT /shopping/list", "Enter list_id and new name.")
      return
    }
    setShopBusy(true)
    try {
      await apiPut("/shopping/list", { list_id, name })
      Alert.alert("Updated", "List name saved.")
      await mergeListsFromApi()
    } catch (e) {
      Alert.alert("Update list failed", e instanceof Error ? e.message : "Unknown error")
    } finally {
      setShopBusy(false)
    }
  }

  async function updateItemViaApi() {
    const shoppingitem_id = updateItemId.trim()
    const name = updateItemName.trim()
    const priceRaw = updateItemPrice.trim()
    if (!shoppingitem_id || !name) {
      Alert.alert("PUT /shopping/item", "Enter shoppingitem_id and name.")
      return
    }
    let price: number | undefined
    if (priceRaw !== "") {
      const n = Number.parseFloat(priceRaw)
      if (Number.isNaN(n)) {
        Alert.alert("Invalid price", "Use a number.")
        return
      }
      price = n
    }
    setShopBusy(true)
    try {
      const body: Record<string, unknown> = { shoppingitem_id, name }
      if (price !== undefined) body.price = price
      await apiPut("/shopping/item", body)
      Alert.alert("Updated", "Item saved.")
      await mergeListsFromApi()
    } catch (e) {
      Alert.alert("Update item failed", e instanceof Error ? e.message : "Unknown error")
    } finally {
      setShopBusy(false)
    }
  }

  function draftFor(groupId: string) {
    return itemDrafts[groupId] ?? { name: "", description: "", price: "0" }
  }

  function setDraft(groupId: string, patch: Partial<{ name: string; description: string; price: string }>) {
    setItemDrafts((prev) => ({
      ...prev,
      [groupId]: { ...draftFor(groupId), ...patch },
    }))
  }

  async function createListApi() {
    const name = newListName.trim()
    if (!name) {
      Alert.alert("Name required", "Enter a list name.")
      return
    }
    setShopBusy(true)
    try {
      const res = (await apiPost("/shopping/list", {
        name,
        house_id: API_HOUSE_ID,
      })) as { list_id?: string; message?: string }
      if (!res.list_id) {
        Alert.alert("List", res.message ?? "Created but no list_id in response")
        return
      }
      setData((prev) => [
        ...prev,
        { id: res.list_id!, title: name, list_id: res.list_id, items: [] },
      ])
      setNewListName("")
      Alert.alert("List created", res.list_id)
    } catch (e) {
      Alert.alert("Create list failed", e instanceof Error ? e.message : "Unknown error")
    } finally {
      setShopBusy(false)
    }
  }

  async function addItemApi(group: Group) {
    if (!group.list_id) return
    const d = draftFor(group.id)
    const name = d.name.trim()
    const description = d.description.trim() || "—"
    const price = Number.parseFloat(d.price)
    if (!name || Number.isNaN(price)) {
      Alert.alert("Invalid item", "Enter name and numeric price.")
      return
    }
    setShopBusy(true)
    try {
      const res = (await apiPost("/shopping/item", {
        name,
        description,
        price,
        list_id: group.list_id,
        house_id: API_HOUSE_ID,
      })) as { shoppingitem_id?: string; message?: string }
      const sid = res.shoppingitem_id
      if (!sid) {
        Alert.alert("Item", res.message ?? "No shoppingitem_id returned")
        return
      }
      setData((prev) =>
        prev.map((g) =>
          g.id !== group.id
            ? g
            : {
                ...g,
                items: [
                  ...g.items,
                  {
                    id: sid,
                    shoppingitem_id: sid,
                    name,
                    price: `$${price.toFixed(2)}`,
                    checked: false,
                  },
                ],
              },
        ),
      )
      setDraft(group.id, { name: "", description: "", price: "0" })
    } catch (e) {
      Alert.alert("Add item failed", e instanceof Error ? e.message : "Unknown error")
    } finally {
      setShopBusy(false)
    }
  }

  async function deleteListApi(group: Group) {
    if (!group.list_id) return
    setShopBusy(true)
    try {
      await apiDelete("/shopping/list", { list_id: group.list_id })
      setData((prev) => prev.filter((g) => g.id !== group.id))
    } catch (e) {
      Alert.alert("Delete list failed", e instanceof Error ? e.message : "Unknown error")
    } finally {
      setShopBusy(false)
    }
  }

  async function deleteItemApi(groupId: string, item: Item) {
    if (!item.shoppingitem_id) return
    setShopBusy(true)
    try {
      await apiDelete("/shopping/item", { shoppingitem_id: item.shoppingitem_id })
      setData((prev) =>
        prev.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, items: g.items.filter((i) => i.id !== item.id) },
        ),
      )
    } catch (e) {
      Alert.alert("Delete item failed", e instanceof Error ? e.message : "Unknown error")
    } finally {
      setShopBusy(false)
    }
  }

  function toggleItem(groupId: string, itemId: string) {
    setData(prev =>
      prev.map(group => {
        if (group.id !== groupId) return group
        return {
          ...group,
          items: group.items.map(item => {
            if (item.id !== itemId) return item
            return { ...item, checked: !item.checked }
          })
        }
      })
    )
  }

  const total = data.reduce((sum, g) => {
    return sum + g.items.reduce((s, item) => {
      const price = parseFloat(item.price.replace("$", "")) || 0
      return s + (item.checked ? price : 0)
    }, 0)
  }, 0)

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundGlows />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
      </View>

      {/* Accent bar */}
      <View style={styles.accentBar} />

      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.apiPanel}>
          <Text style={styles.apiTitle}>GET /shopping/list · GET /shopping/items</Text>
          <TouchableOpacity
            style={styles.apiBtnSecondary}
            onPress={mergeListsFromApi}
            disabled={shopBusy}
          >
            <Text style={styles.apiBtnSecondaryText}>Refresh lists from house</Text>
          </TouchableOpacity>
          <Text style={styles.apiTitle}>POST /shopping/list</Text>
          <View style={styles.apiRow}>
            <TextInput
              style={styles.apiInput}
              placeholder="New list name"
              placeholderTextColor={COLORS.textMuted}
              value={newListName}
              onChangeText={setNewListName}
            />
            <TouchableOpacity
              style={styles.apiBtn}
              onPress={createListApi}
              disabled={shopBusy}
            >
              {shopBusy ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.apiBtnText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.apiSub}>PUT /shopping/list</Text>
          <TextInput
            style={styles.apiInputFull}
            placeholder="list_id"
            placeholderTextColor={COLORS.textMuted}
            value={updateListId}
            onChangeText={setUpdateListId}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.apiInputFull}
            placeholder="New list title"
            placeholderTextColor={COLORS.textMuted}
            value={updateListName}
            onChangeText={setUpdateListName}
          />
          <TouchableOpacity style={styles.apiBtnSecondary} onPress={updateListViaApi} disabled={shopBusy}>
            <Text style={styles.apiBtnSecondaryText}>Update list name</Text>
          </TouchableOpacity>
          <Text style={styles.apiSub}>PUT /shopping/item</Text>
          <TextInput
            style={styles.apiInputFull}
            placeholder="shoppingitem_id"
            placeholderTextColor={COLORS.textMuted}
            value={updateItemId}
            onChangeText={setUpdateItemId}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.apiInputFull}
            placeholder="New item name"
            placeholderTextColor={COLORS.textMuted}
            value={updateItemName}
            onChangeText={setUpdateItemName}
          />
          <TextInput
            style={styles.apiInputFull}
            placeholder="Price (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={updateItemPrice}
            onChangeText={setUpdateItemPrice}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.apiBtnSecondary} onPress={updateItemViaApi} disabled={shopBusy}>
            <Text style={styles.apiBtnSecondaryText}>Update item</Text>
          </TouchableOpacity>
          <Text style={styles.apiSub}>
            Lists with a server id: load items, add items (POST), delete list or item. Tap a list row below to fill list_id for PUT.
          </Text>
        </View>

        {data.map(group => {
          const checkedCount = group.items.filter(i => i.checked).length
          const progressPct  = group.items.length > 0
            ? checkedCount / group.items.length
            : 0

          return (
            <View key={group.id} style={styles.groupCard}>

              {/* Group header */}
              <View style={styles.groupHeader}>
                <TouchableOpacity
                  style={styles.groupTitleHit}
                  onPress={() => {
                    if (group.list_id) setUpdateListId(group.list_id)
                  }}
                  disabled={!group.list_id}
                >
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  {group.list_id ? (
                    <Text style={styles.groupTitleHint}>tap title → PUT list id</Text>
                  ) : null}
                </TouchableOpacity>
                <View style={styles.groupHeaderRight}>
                  <Text style={styles.groupProgress}>
                    {checkedCount}/{group.items.length}
                  </Text>
                  {group.list_id ? (
                    <>
                      <TouchableOpacity onPress={() => loadItemsForGroup(group)} hitSlop={8}>
                        <Ionicons name="cloud-download-outline" size={20} color={COLORS.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteListApi(group)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={20} color="#B0524A" />
                      </TouchableOpacity>
                    </>
                  ) : null}
                </View>
              </View>

              {/* Progress bar — outer track + inner fill View */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPct * 100}%` }
                  ]}
                />
              </View>

              {/* Items */}
              {group.items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => toggleItem(group.id, item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, item.checked && styles.checkboxActive]}>
                    {item.checked && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.checked && styles.itemChecked]}>
                      {item.name}
                    </Text>
                  </View>
                  <View style={[styles.priceChip, item.checked && styles.priceChipChecked]}>
                    <Text style={[styles.itemPrice, item.checked && styles.itemPriceChecked]}>
                      {item.price}
                    </Text>
                  </View>
                  {item.shoppingitem_id ? (
                    <TouchableOpacity
                      onPress={() => deleteItemApi(group.id, item)}
                      onLongPress={() => {
                        setUpdateItemId(item.shoppingitem_id ?? "")
                        setUpdateItemName(item.name)
                        setUpdateItemPrice(
                          String(parseFloat(item.price.replace("$", "")) || ""),
                        )
                      }}
                      hitSlop={8}
                      style={styles.itemDeleteHit}
                    >
                      <Text style={styles.itemDeleteText}>×</Text>
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              ))}

              {group.list_id ? (
                <View style={styles.addItemBox}>
                  <Text style={styles.addItemLabel}>POST /shopping/item</Text>
                  <TextInput
                    style={styles.addItemInput}
                    placeholder="Item name"
                    placeholderTextColor={COLORS.textMuted}
                    value={draftFor(group.id).name}
                    onChangeText={(t) => setDraft(group.id, { name: t })}
                  />
                  <TextInput
                    style={styles.addItemInput}
                    placeholder="Description"
                    placeholderTextColor={COLORS.textMuted}
                    value={draftFor(group.id).description}
                    onChangeText={(t) => setDraft(group.id, { description: t })}
                  />
                  <TextInput
                    style={styles.addItemInput}
                    placeholder="Price"
                    placeholderTextColor={COLORS.textMuted}
                    value={draftFor(group.id).price}
                    onChangeText={(t) => setDraft(group.id, { price: t })}
                    keyboardType="decimal-pad"
                  />
                  <TouchableOpacity
                    style={styles.addItemBtn}
                    onPress={() => addItemApi(group)}
                    disabled={shopBusy}
                  >
                    <Text style={styles.addItemBtnText}>Add item</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

            </View>
          )
        })}

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total checked</Text>
          <Text style={styles.totalPrice}>${total.toFixed(2)}</Text>
        </View>

      </ScrollView>
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/AddList')}
      >
        <Ionicons name="add" size={26} color={COLORS.white} />
      </Pressable>

      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />

    </SafeAreaView>
  )
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bg
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop:        20,
    paddingBottom:     8
  },
  title: {
    fontSize:   24,
    fontWeight: "800",
    color:      COLORS.textDark
  },

  accentBar: {
    height:           3,
    backgroundColor:  COLORS.secondary,
    marginHorizontal: 20,
    borderRadius:     2,
    marginBottom:     4
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop:        16,
    paddingBottom:     100
  },

  groupCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius:    16,
    padding:         16,
    marginBottom:    16,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    shadowColor:     "#2C3A22",
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       2
  },

  groupHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   10
  },
  groupHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  groupTitleHit: {
    flex: 1,
    marginRight: 8,
  },
  groupTitle: {
    fontSize:   16,
    fontWeight: "700",
    color:      COLORS.textDark
  },
  groupTitleHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  groupProgress: {
    fontSize:   13,
    fontWeight: "600",
    color:      COLORS.textMuted
  },

  // Progress bar — track wraps fill
  progressTrack: {
    height:          6,
    backgroundColor: "#176087",
    borderRadius:    6,
    overflow:        "hidden",
    marginBottom:    12
  },
  progressFill: {
    height:          6,
    backgroundColor: COLORS.primary,
    borderRadius:    6
  },

  itemRow: {
    flexDirection: "row",
    alignItems:    "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E8D8"
  },

  checkbox: {
    width:           20,
    height:          20,
    borderRadius:    6,
    borderWidth:     2,
    borderColor:     COLORS.primary,
    marginRight:     12,
    alignItems:      "center",
    justifyContent:  "center"
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor:     COLORS.primary
  },
  checkMark: {
    color:      "#fff",
    fontSize:   11,
    fontWeight: "800",
    lineHeight: 13
  },

  itemInfo:    { flex: 1 },
  itemName:    { fontSize: 15, color: COLORS.textDark, fontWeight: "500" },
  itemChecked: { textDecorationLine: "line-through", color: COLORS.textMuted },

  priceChip: {
    backgroundColor:  `${COLORS.primary}12`,
    borderRadius:     8,
    paddingHorizontal: 10,
    paddingVertical:  4
  },
  priceChipChecked: {
    backgroundColor: `${COLORS.textMuted}20`
  },
  itemPrice: {
    fontSize:   13,
    fontWeight: "700",
    color:     COLORS.textDark
  },
  itemPriceChecked: {
    color: COLORS.textMuted
  },

  itemDeleteHit: {
    marginLeft: 6,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  itemDeleteText: {
    fontSize: 22,
    color: "#B0524A",
    fontWeight: "700",
    lineHeight: 24,
  },

  apiPanel: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  apiTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
  },
  apiSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 16,
  },
  apiRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  apiInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
  },
  apiBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 88,
    alignItems: "center",
  },
  apiBtnSecondary: {
    backgroundColor: `${COLORS.secondary}35`,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  apiBtnSecondaryText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  apiBtnText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  apiInputFull: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
    marginBottom: 6,
  },

  addItemBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8EDF5",
    gap: 8,
  },
  addItemLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  addItemInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
  },
  addItemBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  addItemBtnText: {
    color: COLORS.white,
    fontWeight: "700",
  },

  totalCard: {
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    backgroundColor: COLORS.cardBg,
    padding:         16,
    borderRadius:    16,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    shadowColor:     "#2C3A22",
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       2
  },
  totalLabel: {
    fontSize:   16,
    fontWeight: "700",
    color:      COLORS.textDark
  },
  totalPrice: {
    fontSize:   18,
    fontWeight: "800",
    color:      COLORS.primary
  },

  tabBar: {
    flexDirection:        "row",
    justifyContent:       "space-around",
    backgroundColor:      COLORS.cardBg,
    paddingVertical:      10,
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    borderTopWidth:       1,
    borderColor:          COLORS.border,
    shadowColor:          "#000",
    shadowOffset:         { width: 0, height: -2 },
    shadowOpacity:        0.05,
    shadowRadius:         8,
    elevation:            8
  },
  tabItem: {
    padding:  8,
    alignItems: "center",
    position: "relative"
  },
  tabIndicator: {
    position:        "absolute",
    top:             2,
    width:           4,
    height:          4,
    borderRadius:    2,
    backgroundColor: COLORS.accent
  }
})