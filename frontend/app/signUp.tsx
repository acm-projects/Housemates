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
import { AppBottomNav } from '../components/app-bottom-nav'
import { BackgroundGlows, GlassCard, GLASS_COLORS } from '@/components/glass-ui'

const REGION = 'us-east-2'
const CLIENT_ID = '22fiai4ujv7oi54lk6o6btq4vu'
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION })

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
      router.push({ pathname: '/verify', params: { email: email.trim() } })
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
      <BackgroundGlows />

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
                placeholderTextColor={GLASS_COLORS.textMuted}
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
                placeholderTextColor={GLASS_COLORS.textMuted}
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
                placeholderTextColor={GLASS_COLORS.textMuted}
                secureTextEntry
                autoCapitalize="none"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </GlassCard>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color={GLASS_COLORS.white} /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppBottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: GLASS_COLORS.bg },
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
    borderColor: GLASS_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: { fontSize: 18, color: GLASS_COLORS.inactive, fontWeight: '700' },
  headerCenter: { alignItems: 'center' },
  headerSpacer: { width: 38, height: 38 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: GLASS_COLORS.title },
  headerSubtitle: { fontSize: 12, color: GLASS_COLORS.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: GLASS_COLORS.title, letterSpacing: 1, marginBottom: 12 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: GLASS_COLORS.textDark },
  welcomeDesc: { fontSize: 14, color: GLASS_COLORS.textMuted, marginTop: 4, lineHeight: 20 },
  inputWrap: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  inputWrapFocused: { borderColor: GLASS_COLORS.title, backgroundColor: 'rgba(255,255,255,0.34)' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: GLASS_COLORS.textMuted, marginBottom: 6 },
  input: { fontSize: 16, fontWeight: '500', color: GLASS_COLORS.textDark },
  errorText: { color: '#A63A2C', fontWeight: '600', marginTop: 4 },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: GLASS_COLORS.title,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: GLASS_COLORS.white, fontSize: 16, fontWeight: '800' },
})
