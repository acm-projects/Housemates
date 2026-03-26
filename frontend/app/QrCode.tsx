import React from 'react'
import { apiPost } from "@/utils/api"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native'
import {
  HomeIcon,
  ChecklistIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ExpensesIcon
} from './icons'
import QRCode from 'react-native-qrcode-svg'

const { width, height } = Dimensions.get('window')

// --- Types ---
type Props = {
  onBack?: () => void
  inviteCode?: string
}

// --- Colors ---
const COLORS = {
  bg:          '#FDFDFF',
  cardBg:      '#D1DAE6',
  primary:     '#0A2239',
  secondary:   '#176087',
  accent:      '#ADB6C4',
  textDark:    '#132E32',
  textMuted:   '#98AAC5',
  border:      '#3590F3',
  borderFocus: '#ADB6C4',
  white:       '#FFFFFF',
}

// --- API ---
async function validateQrCode(code: string) {
  try {
    const result = await apiPost("/qr/validate", { code })
    console.log(result)
  } catch (err) {
    console.error("Error validating QR code:", err)
  }
}

// --- Main Screen ---
export default function AddHousemateScreen({
  onBack = () => {},
  inviteCode = 'https://yourapp.com/invite/abc123'
}: Props) {

  const handleShare = () => validateQrCode(inviteCode)

  // QR size: leaves room for all other content without scrolling
  // Approximate available height minus header, accent bar, instructions, code box, button, footer, gaps
  const reservedHeight = 80 + 3 + 16 + 110 + 60 + 56 + 30 + 80
  const availableForCard = height - reservedHeight
  const cardPadding = 16
  const activePillHeight = 36
  const qrSize = Math.min(
    availableForCard - cardPadding * 2 - activePillHeight,
    width - 20 * 2 - cardPadding * 2
  )

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <Text style={styles.backArrow}>←</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Add a Housemate</Text>
          <Text style={styles.subtitle}>Share code to invite someone</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Accent bar */}
      <View style={styles.accentBar} />

      {/* Fixed layout — no scroll */}
      <View style={styles.content}>

        {/* Instructions card */}
        <View style={styles.instructionCard}>
          {[
            { n: '1', text: 'Show this QR code to your housemate' },
            { n: '2', text: 'They scan it with their camera or app' },
            { n: '3', text: "They'll instantly join your house!" },
          ].map(step => (
            <View key={step.n} style={styles.instructionRow}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepNumber}>{step.n}</Text>
              </View>
              <Text style={styles.instructionText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* QR Card */}
        <View style={styles.qrCard}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          <QRCode
            value={inviteCode}
            size={qrSize}
            backgroundColor="transparent"
            color={COLORS.primary}
          />

          {/* Active indicator */}
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeLabel}>Invite code active</Text>
          </View>
        </View>

        {/* Invite code string */}
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>INVITE CODE</Text>
          <Text style={styles.codeValue} numberOfLines={1} ellipsizeMode="middle">
            {inviteCode}
          </Text>
        </View>

        {/* Share button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Text style={styles.shareButtonIcon}>⬆</Text>
          <Text style={styles.shareButtonText}>Share Invite Link</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>This invite code does not expire.</Text>

      </View>

    </SafeAreaView>
  )
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        18,
    paddingBottom:     8,
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
    elevation:       2,
  },
  backArrow:       { fontSize: 18, color: COLORS.primary, fontWeight: '600' },
  headerTextGroup: { flex: 1, alignItems: 'center' },
  title:           { fontSize: 22, fontWeight: '800', color: COLORS.textDark, letterSpacing: -0.4 },
  subtitle:        { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },

  accentBar: {
    height:           3,
    backgroundColor:  COLORS.secondary,
    marginHorizontal: 20,
    borderRadius:     2,
    marginBottom:     4,
  },

  // Fixed content layout
  content: {
    flex:              1,
    paddingHorizontal: 20,
    paddingTop:        12,
    paddingBottom:     16,
    gap:               12,
    alignItems:        'center',
  },

  // Instructions card
  instructionCard: {
    width:           '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius:    16,
    padding:         14,
    borderWidth:     1,
    borderColor:     `${COLORS.primary}18`,
    shadowColor:     COLORS.primary,
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.06,
    shadowRadius:    8,
    elevation:       2,
    gap:             10,
  },
  instructionRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBullet:      {
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: COLORS.secondary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepNumber:      { fontSize: 13, fontWeight: '700', color: COLORS.white },
  instructionText: { fontSize: 14, fontWeight: '500', color: COLORS.textDark, flex: 1 },

  // QR Card — flex 1 so it fills leftover space
  qrCard: {
    width:           '100%',
    flex:            1,
    backgroundColor: COLORS.cardBg,
    borderRadius:    24,
    padding:         16,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    shadowColor:     COLORS.primary,
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.12,
    shadowRadius:    20,
    elevation:       8,
    position:        'relative',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // Corner decorations
  corner: {
    position:    'absolute',
    width:       20,
    height:      20,
    borderColor: COLORS.primary,
    borderWidth: 2.5,
  },
  cornerTL: { top: 10, left: 10,  borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius:     5 },
  cornerTR: { top: 10, right: 10, borderLeftWidth:  0, borderBottomWidth: 0, borderTopRightRadius:    5 },
  cornerBL: { bottom: 10, left: 10,  borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius:  5 },
  cornerBR: { bottom: 10, right: 10, borderLeftWidth:  0, borderTopWidth: 0, borderBottomRightRadius: 5 },

  // Active pill
  activePill:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  activeDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.secondary },
  activeLabel: { fontSize: 13, color: COLORS.secondary, fontWeight: '600' },

  // Invite code box
  codeBox: {
    width:           '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius:    12,
    padding:         14,
    borderWidth:     1,
    borderColor:     `${COLORS.primary}18`,
  },
  codeLabel: {
    fontSize:      10,
    fontWeight:    '700',
    color:         COLORS.accent,
    letterSpacing: 1.2,
    marginBottom:  4,
  },
  codeValue: {
    fontSize:   13,
    fontWeight: '600',
    color:      COLORS.primary,
  },

  // Share button
  shareButton: {
    width:             '100%',
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               8,
    backgroundColor:   COLORS.primary,
    borderRadius:      16,
    paddingVertical:   15,
    shadowColor:       COLORS.primary,
    shadowOffset:      { width: 0, height: 6 },
    shadowOpacity:     0.28,
    shadowRadius:      12,
    elevation:         6,
  },
  shareButtonIcon: { fontSize: 16, color: COLORS.accent, fontWeight: '700' },
  shareButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  footerNote: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
})
