import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CognitoUser } from 'amazon-cognito-identity-js'
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { getUserPool } from '../lib/auth'

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

export default function VerifyScreen() {
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    if (!email || !code.trim()) {
      setError('Enter the verification code.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const userPool = getUserPool()
      const userData = {
        Username: email,
        Pool: userPool,
      }
      const cognitoUser = new CognitoUser(userData)
      
      cognitoUser.confirmRegistration(code.trim(), true, (err, result) => {
        if (err) {
          setLoading(false)
          setError(String(err?.message || 'Invalid verification code'))
        } else {
          setLoading(false)
          router.replace('/signin')
        }
      })
    } catch (e: any) {
      setLoading(false)
      setError(String(e?.message || 'Invalid verification code'))
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <Background />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Verify Email</Text>
          <Text style={styles.headerSubtitle}>Confirm your account</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <BlurView intensity={26} tint="light" style={styles.card}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="6 digit code"
              placeholderTextColor={COLORS.textMuted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              textAlign="center"
            />
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.primaryButton} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryButtonText}>Confirm Account</Text>}
          </TouchableOpacity>
        </BlurView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
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
  content: { flex: 1, padding: 16, justifyContent: 'center', paddingBottom: 110 },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, marginBottom: 18, lineHeight: 20 },
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
  input: { fontSize: 18, fontWeight: '600', color: COLORS.textDark },
  errorText: { color: '#A63A2C', fontWeight: '600', marginBottom: 12 },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.title,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110 },
  pinkGlow: { left: -20, top: 290, backgroundColor: COLORS.pink },
  orangeGlow: { right: -18, top: 110, backgroundColor: COLORS.orange },
  yellowGlow: { right: -8, bottom: 150, backgroundColor: COLORS.yellow },
})
