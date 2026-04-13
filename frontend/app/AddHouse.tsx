import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

const REGION = 'us-east-2'
const CLIENT_ID = '22fiai4ujv7oi54lk6o6btq4vu'
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION })

const COLORS = {
  bg: '#F7F3F2',
  title: '#EC8575',
  active: '#EC8575',
  inactive: '#000000',
  textDark: '#000000',
  textMuted: '#5E5A58',
  white: '#FFFFFF',
  glass: 'rgba(255,255,255,0.18)',
  border: 'rgba(255,255,255,0.35)',
  pink: 'rgba(255,154,139,0.7)',
  orange: 'rgba(255,174,127,0.7)',
  yellow: 'rgba(255,218,137,0.7)',
}

async function signUp(userData: { name: string; email: string; password: string }) {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: userData.email,
    Password: userData.password,
    UserAttributes: [
      { Name: 'email', Value: userData.email },
      { Name: 'name', Value: userData.name },
    ],
  })
  return cognitoClient.send(command)
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

export default function SignUpScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill out all fields.')
      return
    }
    if (password.trim().length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await signUp({ name: name.trim(), email: email.trim(), password })
      router.push({ pathname: '/VerifyScreen', params: { email: email.trim() } })
    } catch (e: any) {
      const message = String(e?.message || 'Unable to create account.')
      setError(message)
    } finally {
      setLoading(false)
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
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join your housemates today</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <GlassCard>
            <Text style={styles.welcomeTitle}>Welcome home.</Text>
            <Text style={styles.welcomeDesc}>Create your account to get started with shared living.</Text>
          </GlassCard>

          <GlassCard>
            <Text style={styles.sectionLabel}>YOUR DETAILS</Text>

            <View style={[styles.inputWrap, focusedField === 'name' && styles.inputWrapFocused]}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Jordan Smith"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={[styles.inputWrap, focusedField === 'password' && styles.inputWrapFocused]}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 characters"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoCapitalize="none"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </GlassCard>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppBottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.title, letterSpacing: 1, marginBottom: 12 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
  welcomeDesc: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, lineHeight: 20 },
  inputWrap: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  inputWrapFocused: { borderColor: COLORS.title, backgroundColor: 'rgba(255,255,255,0.34)' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginBottom: 6 },
  input: { fontSize: 16, fontWeight: '500', color: COLORS.textDark },
  errorText: { color: '#A63A2C', fontWeight: '600', marginTop: 4 },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.title,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  pinkGlow: { left: -20, top: 290, backgroundColor: COLORS.pink },
  orangeGlow: { right: -18, top: 110, backgroundColor: COLORS.orange },
  yellowGlow: { right: -8, bottom: 150, backgroundColor: COLORS.yellow },
})
