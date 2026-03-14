import React, { useState } from 'react'
import { apiPost } from "@/utils/api"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'
import {
  HomeIcon,
  ChecklistIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ExpensesIcon,
  DownloadIcon,
  AddToCalendarIcon
} from './icons'

// --- Types ---
type Props = {
  onBack?: () => void
  onDone?: (data: { listName: string; price: string; date: string }) => void
}

// --- API ---
async function saveList(data: { listName: string; price: string; date: string }) {
  try {
    const result = await apiPost('/lists/add', data)
    console.log(result)
  } catch (err) {
    console.error('Error saving list:', err)
  }
}

const COLORS = {
  bg: '#FDFDFF',
  cardBg: '#D1DAE6',
  primary: '#0A2239',
  secondary: '#176087',
  accent: '#ADB6C4',
  textDark: '#132E32',
  textMuted: '#98AAC5',
  border: '#3590F3',
  borderFocus: '#ADB6C4',
  stepInactive: '#ADB6C4',
  white: '#FFFFFF',
}


// --- Tab Bar ---
type TabItem = { id: string; icon: React.ReactNode }

const tabs: TabItem[] = [
  { id: 'list',     icon: <ChecklistIcon   size={24} color={COLORS.primary} /> },
  { id: 'wallet',   icon: <ShoppingBagIcon size={24} color={COLORS.primary} /> },
  { id: 'home',     icon: <HomeIcon        size={24} color={COLORS.primary} /> },
  { id: 'calendar', icon: <CalendarIcon    size={24} color={COLORS.primary} /> },
  { id: 'flag',     icon: <ExpensesIcon    size={24} color={COLORS.primary} /> }
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
          {activeTab === tab.id && <View style={styles.tabActiveIndicator} />}
          {tab.icon}
        </TouchableOpacity>
      ))}
    </View>
  )
}

// --- Main Screen ---
export default function AddListScreen({ onBack, onDone }: Props) {
  const [activeTab,    setActiveTab]    = useState('wallet')
  const [listName,     setListName]     = useState('')
  const [price,        setPrice]        = useState('00.00')
  const [date,         setDate]         = useState('02/27')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error,        setError]        = useState('')

  const handleDone = () => {
    if (!listName.trim()) {
      setError('Please enter a name for your list.')
      return
    }
    setError('')
    saveList({ listName, price, date })
    onDone?.({ listName, price, date })
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <View style={styles.backButtonInner}>
            <Text style={styles.backArrow}>←</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Add List</Text>
          <Text style={styles.subtitle}>Create a new shared list</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Accent bar */}
      <View style={styles.accentBar} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* List Name */}
          <Text style={styles.sectionLabel}>LIST DETAILS</Text>

          <View style={[styles.inputCard, focusedField === 'name' && styles.inputCardFocused]}>
            <Text style={styles.inputLabel}>List Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Grocery List"
              placeholderTextColor={COLORS.textMuted}
              value={listName}
              onChangeText={setListName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              cursorColor={COLORS.primary}
              selectionColor={`${COLORS.primary}40`}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <Text style={styles.sectionLabel}>DETAILS</Text>

          {/* Price row — DownloadIcon = dollar/currency circle SVG */}
          <View style={[styles.rowCard, focusedField === 'price' && styles.rowCardFocused]}>
            <View style={styles.rowCardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: `${COLORS.secondary}50` }]}>
                <DownloadIcon size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.inputLabel}>ESTIMATED PRICE</Text>
                <Text style={styles.rowCardSubtitle}>Total cost</Text>
              </View>
            </View>
            <View style={styles.pillRow}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={[styles.inlinePill, focusedField === 'price' && styles.inlinePillFocused]}
                value={price}
                onChangeText={setPrice}
                onFocus={() => setFocusedField('price')}
                onBlur={() => setFocusedField(null)}
                cursorColor={COLORS.primary}
                selectionColor={`${COLORS.primary}40`}
                keyboardType="decimal-pad"
                returnKeyType="next"
                textAlign="center"
              />
            </View>
          </View>

          {/* Date row — AddToCalendarIcon = calendar + cross SVG */}
          <View style={[styles.rowCard, focusedField === 'date' && styles.rowCardFocused]}>
            <View style={styles.rowCardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: `${COLORS.secondary}50` }]}>
                <AddToCalendarIcon size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.inputLabel}>DUE DATE</Text>
                <Text style={styles.rowCardSubtitle}>When should this be done?</Text>
              </View>
            </View>
            <TextInput
              style={[styles.inlinePill, focusedField === 'date' && styles.inlinePillFocused]}
              value={date}
              onChangeText={setDate}
              onFocus={() => setFocusedField('date')}
              onBlur={() => setFocusedField(null)}
              cursorColor={COLORS.primary}
              selectionColor={`${COLORS.primary}40`}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              onSubmitEditing={handleDone}
              textAlign="center"
            />
          </View>

          {/* Error */}
          {error !== '' && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          {/* Done button */}
          <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.85}>
            <Text style={styles.doneButtonText}>Create List</Text>
            <Text style={styles.doneButtonArrow}>→</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />

    </SafeAreaView>
  )
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        18
  },
  backButtonInner: {
    width:           38,
    height:          38,
    borderRadius:    12,
    backgroundColor: COLORS.cardBg,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     COLORS.border,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.07,
    shadowRadius:    3,
    elevation:       2
  },
  backArrow:       { fontSize: 18, color: COLORS.primary, fontWeight: '600' },
  headerTextGroup: { flex: 1, alignItems: 'center' },
  title:           { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
  subtitle:        { fontSize: 12, color: COLORS.textMuted },

  accentBar: {
    height:          3,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 20,
    borderRadius:    2,
    marginBottom:    4
  },

  keyboardView:  { flex: 1 },
  scrollContent: { padding: 20, gap: 12 },

  sectionLabel: {
    fontSize:      11,
    fontWeight:    '700',
    color:         COLORS.primary,
    letterSpacing: 1.2,
    marginTop:     4
  },

  inputCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius:    16,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    padding:         14,
    shadowColor:     '#2C3A22',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       2
  },
  inputCardFocused: { borderColor: COLORS.primary, backgroundColor: '#F2FAF0' },

  inputLabel: {
    fontSize:      11,
    fontWeight:    '600',
    color:         COLORS.primary,
    letterSpacing: 0.5,
    marginBottom:  5
  },
  input: {
    fontSize:        16,
    fontWeight:      '500',
    color:           COLORS.textDark,
    paddingVertical: 2
  },

  rowCard: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius:    16,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    padding:         14,
    shadowColor:     '#2C3A22',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       2
  },
  rowCardFocused:  { borderColor: COLORS.primary, backgroundColor: '#F2FAF0' },
  rowCardLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowCardSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },

  iconCircle: {
    width:          36,
    height:         36,
    borderRadius:   10,
    alignItems:     'center',
    justifyContent: 'center'
  },

  pillRow:        { flexDirection: 'row', alignItems: 'center', gap: 2 },
  currencyPrefix: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  inlinePill: {
    backgroundColor:  `${COLORS.primary}12`,
    borderRadius:     10,
    borderWidth:      1.5,
    borderColor:      'transparent',
    paddingHorizontal: 12,
    paddingVertical:  7,
    fontSize:         14,
    fontWeight:       '700',
    color:            COLORS.textDark,
    minWidth:         76,
    textAlign:        'center'
  },
  inlinePillFocused: {
    borderColor:     COLORS.primary,
    backgroundColor: `${COLORS.primary}18`
  },

  errorBanner: {
    backgroundColor:  '#FFF0EE',
    borderRadius:     12,
    borderWidth:      1,
    borderColor:      COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical:  10
  },
  errorText: { color: '#B0524A', fontSize: 13, fontWeight: '500' },

  doneButton: {
    backgroundColor: COLORS.primary,
    padding:         16,
    borderRadius:    16,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    marginTop:       6,
    shadowColor:     COLORS.primary,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.3,
    shadowRadius:    12,
    elevation:       6
  },
  doneButtonText:  { color: '#fff', fontWeight: '700', fontSize: 17 },
  doneButtonArrow: { color: COLORS.secondary, fontSize: 18, fontWeight: '700' },

  tabBar: {
    flexDirection:       'row',
    justifyContent:      'space-around',
    backgroundColor:     COLORS.cardBg,
    paddingVertical:     10,
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    borderTopWidth:      1,
    borderColor:         COLORS.border,
    shadowColor:         '#000',
    shadowOffset:        { width: 0, height: -2 },
    shadowOpacity:       0.05,
    shadowRadius:        8,
    elevation:           8
  },
  tabItem:            { padding: 8, alignItems: 'center', position: 'relative' },
  tabActiveIndicator: {
    position:        'absolute',
    top:             2,
    width:           4,
    height:          4,
    borderRadius:    2,
    backgroundColor: COLORS.accent
  }
})
