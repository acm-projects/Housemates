import React, { useState } from 'react'
import { apiPost } from '@/utils/api'
import { API_HOUSE_ID } from './apiConfig'
import { useRouter } from 'expo-router'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { AppBottomNav } from '../components/app-bottom-nav'

const COLORS = {
  bg: '#F7F3F2',
  title: '#EC8575',
  inactive: '#000000',
  textDark: '#000000',
  textMuted: '#5E5A58',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.35)',
  pink: 'rgba(255,154,139,0.7)',
  orange: 'rgba(255,174,127,0.7)',
  yellow: 'rgba(255,218,137,0.7)',
}

function Background() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={[styles.glow, styles.pinkGlow]} />
      <View style={[styles.glow, styles.orangeGlow]} />
      <View style={[styles.glow, styles.yellowGlow]} />
    </View>
  )
}

export default function AddListScreen() {
  const router = useRouter()
  const [listName, setListName] = useState('')
  const [price, setPrice] = useState('00.00')
  const [date, setDate] = useState('02/27')
  const [error, setError] = useState('')

  const handleDone = async () => {
    if (!listName.trim()) {
      setError('Please enter a name for your list.')
      return
    }
    setError('')
    await apiPost('/shopping/list', { name: listName.trim(), house_id: API_HOUSE_ID })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Background />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}><Text style={styles.headerButtonText}>←</Text></TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add List</Text>
          <Text style={styles.headerSubtitle}>Create a new shared list</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BlurView intensity={26} tint="light" style={styles.card}>
          <Text style={styles.sectionLabel}>LIST DETAILS</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>List Name</Text>
            <TextInput style={styles.input} value={listName} onChangeText={setListName} placeholder="e.g. Grocery List" placeholderTextColor={COLORS.textMuted} />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Estimated Price</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor={COLORS.textMuted} keyboardType="decimal-pad" />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="MM/DD" placeholderTextColor={COLORS.textMuted} />
          </View>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </BlurView>
        <TouchableOpacity style={styles.primaryButton} onPress={handleDone}><Text style={styles.primaryButtonText}>Create List</Text></TouchableOpacity>
      </ScrollView>
      <AppBottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 110 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  headerButtonText: { fontSize: 18, color: COLORS.inactive, fontWeight: '700' },
  headerCenter: { alignItems: 'center' },
  headerSpacer: { width: 38, height: 38 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.title },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  card: { borderRadius: 24, overflow: 'hidden', padding: 16, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: COLORS.border },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.title, letterSpacing: 1, marginBottom: 12 },
  inputWrap: { backgroundColor: 'rgba(255,255,255,0.24)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginBottom: 6 },
  input: { fontSize: 16, fontWeight: '500', color: COLORS.textDark },
  errorText: { color: '#A63A2C', fontWeight: '600' },
  primaryButton: { height: 56, borderRadius: 18, backgroundColor: COLORS.title, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110 },
  pinkGlow: { left: -20, top: 290, backgroundColor: COLORS.pink },
  orangeGlow: { right: -18, top: 110, backgroundColor: COLORS.orange },
  yellowGlow: { right: -8, bottom: 150, backgroundColor: COLORS.yellow },
})
