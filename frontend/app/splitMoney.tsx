import * as React from 'react'
import { useState } from 'react'
import { apiPost } from '@/utils/api'
import { useRouter } from 'expo-router'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
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

type SplitOption = 'you_owe' | 'they_owe' | 'split'
type LoanType = 'cash loan' | 'venmo' | 'zelle'

async function splitMoney(data: { amount: number; users: string[] }) {
  return apiPost('/money/split', data)
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

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <BlurView intensity={26} tint="light" style={[styles.glassCard, style]}>
      {children}
    </BlurView>
  )
}

export default function SplitMoneyScreen() {
  const router = useRouter()
  const [friendName, setFriendName] = useState('')
  const [loanType, setLoanType] = useState<LoanType>('cash loan')
  const [amount, setAmount] = useState('')
  const [selectedSplitOption, setSelectedSplitOption] = useState<SplitOption | null>(null)
  const [showLoanDropdown, setShowLoanDropdown] = useState(false)

  const handleDone = async () => {
    await splitMoney({ amount: parseFloat(amount || '0'), users: friendName ? [friendName] : [] })
  }

  const displayName = friendName || 'your housemate'
  const displayAmount = amount || '0.00'

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <Background />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Split Money</Text>
          <Text style={styles.headerSubtitle}>Settle up with your house</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard>
          <Text style={styles.sectionLabel}>NEW BILL</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>With</Text>
            <TextInput style={styles.input} value={friendName} onChangeText={setFriendName} placeholder="Housemate name" placeholderTextColor={COLORS.textMuted} />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputWrap, styles.flexOne]}>
              <Text style={styles.inputLabel}>Payment via</Text>
              <TouchableOpacity onPress={() => setShowLoanDropdown((v) => !v)} style={styles.dropdownTrigger}>
                <Text style={styles.dropdownText}>{loanType}</Text>
                <Text style={styles.dropdownText}>⌄</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrap, styles.flexOne]}>
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.amountRow}>
                <Text style={styles.amountPrefix}>$</Text>
                <TextInput style={[styles.input, styles.amountInput]} value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={COLORS.textMuted} keyboardType="decimal-pad" />
              </View>
            </View>
          </View>

          {showLoanDropdown && (
            <View style={styles.dropdownMenu}>
              {(['cash loan', 'venmo', 'zelle'] as LoanType[]).map((option) => (
                <TouchableOpacity key={option} style={styles.dropdownOption} onPress={() => { setLoanType(option); setShowLoanDropdown(false) }}>
                  <Text style={styles.dropdownText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.summaryBubble}>
            <Text style={styles.summaryText}>{displayName} owes you ${displayAmount} via {loanType}</Text>
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.sectionLabel}>HOW TO SPLIT</Text>
          {[
            { key: 'you_owe' as SplitOption, label: `You owe ${displayName}`, desc: `$${displayAmount}` },
            { key: 'they_owe' as SplitOption, label: `${displayName} owes you`, desc: `$${displayAmount}` },
            { key: 'split' as SplitOption, label: 'Split the bill', desc: `$${(parseFloat(displayAmount || '0') / 2).toFixed(2)} each` },
          ].map((option) => {
            const active = selectedSplitOption === option.key
            return (
              <TouchableOpacity key={option.key} style={[styles.optionCard, active && styles.optionCardActive]} onPress={() => setSelectedSplitOption(option.key)}>
                <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{option.label}</Text>
                <Text style={[styles.optionDesc, active && styles.optionLabelActive]}>{option.desc}</Text>
              </TouchableOpacity>
            )
          })}
        </GlassCard>

        <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
          <Text style={styles.primaryButtonText}>Confirm and Save</Text>
        </TouchableOpacity>
      </ScrollView>

      <AppBottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 110, gap: 16 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: { fontSize: 18, color: COLORS.inactive, fontWeight: '700' },
  headerCenter: { alignItems: 'center' },
  headerSpacer: { width: 38, height: 38 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.title },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.title, letterSpacing: 1, marginBottom: 12 },
  inputWrap: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  inputLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginBottom: 6 },
  input: { fontSize: 16, fontWeight: '500', color: COLORS.textDark },
  row: { flexDirection: 'row', gap: 10 },
  flexOne: { flex: 1 },
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownText: { fontSize: 15, color: COLORS.textDark, fontWeight: '600' },
  dropdownMenu: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  dropdownOption: { paddingHorizontal: 14, paddingVertical: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  amountPrefix: { color: COLORS.textDark, fontWeight: '800', marginRight: 4 },
  amountInput: { flex: 1 },
  summaryBubble: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  summaryText: { color: COLORS.textDark, fontWeight: '600', textAlign: 'center' },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  optionCardActive: { borderColor: COLORS.title, backgroundColor: 'rgba(236,133,117,0.18)' },
  optionLabel: { color: COLORS.textDark, fontSize: 15, fontWeight: '700' },
  optionLabelActive: { color: COLORS.title },
  optionDesc: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginTop: 4 },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.title,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110 },
  pinkGlow: { left: -20, top: 290, backgroundColor: COLORS.pink },
  orangeGlow: { right: -18, top: 110, backgroundColor: COLORS.orange },
  yellowGlow: { right: -8, bottom: 150, backgroundColor: COLORS.yellow },
})
