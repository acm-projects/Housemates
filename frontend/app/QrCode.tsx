import React from 'react'
import { apiPost } from "@/utils/api"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from 'react-native'
import {
  HomeIcon,
  ChecklistIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ExpensesIcon
} from './icons'
import QRCode from 'react-native-qrcode-svg'

const { width } = Dimensions.get('window')

// --- Types ---
type Props = {
  onBack?: () => void
  inviteCode?: string
}

// --- Colors ---
const COLORS = {
  bg:        'DBF9F4',
  cardBg:    '#FFFFFF',
  primary:   '#678D58',
  secondary: '#A6C48A',
  accent:    '#DD9787',
  textDark:  '#2C3A22',
  textMuted: '#8A9E7A',
  border:    '#D4C4A0'
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

      {/* Content */}
      <View style={styles.content}>

        {/* Instructions card */}
        <View style={styles.instructionCard}>
          <View style={styles.instructionRow}>
            <View style={styles.stepBullet}><Text style={styles.stepNumber}>1</Text></View>
            <Text style={styles.instructionText}>Show this QR code to your housemate</Text>
          </View>
          <View style={styles.instructionRow}>
            <View style={styles.stepBullet}><Text style={styles.stepNumber}>2</Text></View>
            <Text style={styles.instructionText}>They scan it with their camera or app</Text>
          </View>
          <View style={styles.instructionRow}>
            <View style={styles.stepBullet}><Text style={styles.stepNumber}>3</Text></View>
            <Text style={styles.instructionText}>They'll instantly join your house!</Text>
          </View>
        </View>

        {/* QR Card */}
        <View style={styles.qrWrapper}>
          <View style={styles.qrCard}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <QRCode
              value={inviteCode}
              size={width * 0.48}
              backgroundColor="transparent"
              color={COLORS.textDark}
            />
          </View>

          {/* Active indicator */}
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeLabel}>Invite code active</Text>
          </View>
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
    backgroundColor: COLORS.bg
  },

  // Header
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        18,
    paddingBottom:     12
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
  title:           { fontSize: 22, fontWeight: '800', color: COLORS.textDark, letterSpacing: -0.4 },
  subtitle:        { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },

  // Accent bar
  accentBar: {
    height:           3,
    backgroundColor:  COLORS.secondary,
    marginHorizontal: 20,
    borderRadius:     2,
    marginBottom:     4
  },

  // Content
  content: {
    flex:              1,
    paddingHorizontal: 20,
    paddingTop:        20,
    alignItems:        'center'
  },

  // Instructions card
  instructionCard: {
    width:           '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius:    16,
    padding:         18,
    marginBottom:    24,
    borderWidth:     1,
    borderColor:     `${COLORS.primary}18`,
    shadowColor:     '#2C3A22',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.06,
    shadowRadius:    8,
    elevation:       2,
    gap:             12
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12
  },
  stepBullet: {
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: COLORS.secondary,
    alignItems:      'center',
    justifyContent:  'center'
  },
  stepNumber:       { fontSize: 13, fontWeight: '700', color: COLORS.cardBg },
  instructionText:  { fontSize: 14, fontWeight: '500', color: COLORS.textDark, flex: 1 },

  // QR wrapper
  qrWrapper: {
    alignItems:    'center',
    marginBottom:  24
  },
  qrCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius:    24,
    padding:         28,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    shadowColor:     COLORS.primary,
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.15,
    shadowRadius:    20,
    elevation:       8,
    position:        'relative'
  },

  // Corner decorations
  corner: {
    position:  'absolute',
    width:     20,
    height:    20,
    borderColor: COLORS.primary,
    borderWidth: 2.5
  },
  cornerTL: { top: 10, left: 10,  borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius:     5 },
  cornerTR: { top: 10, right: 10, borderLeftWidth:  0, borderBottomWidth: 0, borderTopRightRadius:    5 },
  cornerBL: { bottom: 10, left: 10,  borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius:  5 },
  cornerBR: { bottom: 10, right: 10, borderLeftWidth:  0, borderTopWidth: 0, borderBottomRightRadius: 5 },

  // Active pill
  activePill: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    marginTop:      14
  },
  activeDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: COLORS.primary
  },
  activeLabel: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // Share button
  shareButton: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: COLORS.accent,
    borderRadius:    16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor:     COLORS.accent,
    shadowOffset:    { width: 0, height: 5 },
    shadowOpacity:   0.28,
    shadowRadius:    10,
    elevation:       5
  },
  shareButtonIcon: { fontSize: 16, color: COLORS.cardBg },
  shareButtonText: { color: COLORS.cardBg, fontSize: 16, fontWeight: '700' },

  footerNote: { color: COLORS.textMuted, fontSize: 12, marginTop: 14 }
})
