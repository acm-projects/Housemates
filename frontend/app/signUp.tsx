import * as React from "react";
import { useState } from "react";
import { apiPost } from "@/utils/api";
import { useRouter, Link, Redirect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  HomeIcon,
  ChecklistIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ExpensesIcon
} from './icons';

export const COLORS = {
  bg:           '#FDFDFF',
  cardBg:       '#F2F5FA',   // ← was #D1DAE6; lighter for better contrast
  primary:      '#0A2239',
  secondary:    '#176087',
  accent:       '#ADB6C4',
  textDark:     '#132E32',
  textMuted:    '#98AAC5',
  border:       '#3590F3',
  borderFocus:  '#ADB6C4',
  white:        '#FFFFFF',
}

// --- API ---
async function signUp(userData: { name: string; email: string; password: string }): Promise<string> {
  try {
    const result = await apiPost("/user/signup", userData);
    console.log(result);
    return result;
  } catch (err) {
    console.error("Error signing up:", err);
    throw err;
  }
}

// --- Tab Bar ---
type TabItem = { id: string; icon: React.ReactNode };
const tabs: TabItem[] = [
  { id: 'list', icon: <ChecklistIcon size={24} color={COLORS.primary}/> },
  { id: 'wallet', icon: <ShoppingBagIcon size={24} color={COLORS.primary} /> },
  { id: 'home', icon: <HomeIcon size={24} color={COLORS.primary} /> },
  { id: 'calendar', icon: <CalendarIcon size={24} color={COLORS.primary} /> },
  { id: 'flag', icon: <ExpensesIcon size={24} color={COLORS.primary} /> },
];

function BottomTabBar({ activeTab, onTabPress }: { activeTab: string; onTabPress: (id: string) => void }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
          onPress={() => onTabPress(tab.id)}
        >
          {activeTab === tab.id && <View style={styles.tabActiveIndicator} />}
          <Text style={styles.tabIcon}>{tab.icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --- Main Screen ---
export default function SignUpScreen({
  onBack,
  onSignUp,
}: {
  onBack?: () => void;
  onSignUp?: (data: { name: string; email: string; password: string }) => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignUp = () => {
    signUp({ name, email, password });
    onSignUp?.({ name, email, password });
    router.replace('/home')
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <View style={styles.backButtonInner}>
            <Text style={styles.backArrow}>←</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join your housemates today</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.accentBar} />

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">


          {/* Welcome illustration area */}
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Welcome home.</Text>
              <Text style={styles.welcomeDesc}>Create your account to get started with shared living.</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.cardSectionLabel}>YOUR DETAILS</Text>

            {/* Name */}
            <View style={[styles.inputContainer, focusedField === 'name' && styles.inputContainerFocused]}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                cursorColor={COLORS.primary}
                selectionColor={`${COLORS.primary}40`}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Jordan Smith"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Email */}
            <View style={[styles.inputContainer, focusedField === 'email' && styles.inputContainerFocused]}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                cursorColor={COLORS.primary}
                selectionColor={`${COLORS.primary}40`}
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

            {/* Password */}
            <View style={[styles.inputContainer, focusedField === 'password' && styles.inputContainerFocused, { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                cursorColor={COLORS.primary}
                selectionColor={`${COLORS.primary}40`}
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
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} activeOpacity={0.85}>
            <Text style={styles.signUpButtonText}>Create Account</Text>
            <Text style={styles.signUpArrow}>→</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  backButton: {},
  backButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  backArrow: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  accentBar: {
    height: 3,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 4,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Welcome
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(103, 141, 88, 0.12)',
    shadowColor: '#2C3A22',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeEmoji: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: `${COLORS.secondary}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: { flex: 1 },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  welcomeDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 3,
    lineHeight: 18,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#2C3A22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(103, 141, 88, 0.1)',
    gap: 14,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  inputContainer: {
    backgroundColor: '#FAFAF7',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputContainerFocused: {
    borderColor: COLORS.borderFocus,
    backgroundColor: '#F2FAF0',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
    paddingVertical: 2,
  },

  // Terms
  termsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Sign Up Button
  signUpButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  signUpButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  signUpArrow: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: '700',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {
    opacity: 1,
  },
  tabActiveIndicator: {
    position: 'absolute',
    top: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  tabIcon: { fontSize: 22 },
});