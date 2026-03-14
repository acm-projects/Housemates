import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from "react-native"
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
}

type Group = {
  id: string
  title: string
  items: Item[]
}

type TabItem = { id: string; icon: React.ReactNode }

// --- Colors ---
const COLORS = {
  bg: '#FDFDFF',
  cardBg: '#D1DAE6', 
  primary: '#0A2239',
  secondary: '#176087',
  accent: '#ADB6C4',//
  textDark: '#132E32',
  textMuted: '#98AAC5',
  border: '#3590F3',
  borderFocus: '#ADB6C4',
  stepInactive: '#ADB6C4',
  white: '#FFFFFF',

};


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
  const [activeTab, setActiveTab] = useState("wallet")
  const [data, setData]           = useState<Group[]>(initialData)

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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
      </View>

      {/* Accent bar */}
      <View style={styles.accentBar} />

      <ScrollView contentContainerStyle={styles.scroll}>

        {data.map(group => {
          const checkedCount = group.items.filter(i => i.checked).length
          const progressPct  = group.items.length > 0
            ? checkedCount / group.items.length
            : 0

          return (
            <View key={group.id} style={styles.groupCard}>

              {/* Group header */}
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <Text style={styles.groupProgress}>
                  {checkedCount}/{group.items.length}
                </Text>
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
                </TouchableOpacity>
              ))}

            </View>
          )
        })}

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total checked</Text>
          <Text style={styles.totalPrice}>${total.toFixed(2)}</Text>
        </View>

      </ScrollView>

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
  groupTitle: {
    fontSize:   16,
    fontWeight: "700",
    color:      COLORS.textDark
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