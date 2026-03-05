import * as React from "react";
import { useState } from "react";
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
} from 'react-native';

// --- Components ---

function SignUpForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  onSignUp,
}: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSignUp: () => void;
}) {
  return (
    <View style={styles.formCard}>
      {/* Name */}
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#6B6B9E"
          autoCapitalize="words"
          autoCorrect={false}
        />
        <View style={styles.inputLine} />
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#6B6B9E"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.inputLine} />
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#6B6B9E"
          secureTextEntry
          autoCapitalize="none"
        />
        <View style={styles.inputLine} />
      </View>

      {/* Sign Up Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.signUpButton} onPress={onSignUp}>
          <Text style={styles.signUpButtonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Tab Bar (reused) ---
type TabItem = {
  id: string;
  icon: string;
};

const tabs: TabItem[] = [
  { id: 'list', icon: '☰' },
  { id: 'wallet', icon: '👜' },
  { id: 'home', icon: '🏠' },
  { id: 'calendar', icon: '📅' },
  { id: 'flag', icon: '🚩' },
];

function BottomTabBar({
  activeTab,
  onTabPress,
}: {
  activeTab: string;
  onTabPress: (id: string) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={() => onTabPress(tab.id)}
        >
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
  const [activeTab, setActiveTab] = useState('home');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    onSignUp?.({ name, email, password });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{'◀︎-'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Sign Up</Text>
          <Text style={styles.headerSubtitle}>Sign up to continue</Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SignUpForm
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSignUp={handleSignUp}
        />
      </KeyboardAvoidingView>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

// --- Styles ---
const COLORS = {
  bg: '#E8E8F0',
  cardBg: '#CBCBE6',
  primary: '#6B6B9E',
  textDark: '#2D2D4E',
  textMuted: '#6B6B8D',
  white: '#FFFFFF',
  inputLine: '#3D3D6E',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.textDark,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 2,
    textDecorationLine: 'underline',
    fontFamily: 'serif',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  inputGroup: {
    marginBottom: 28,
  },
  input: {
    fontSize: 16,
    color: COLORS.textDark,
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontFamily: 'serif',
  },
  inputLine: {
    height: 1,
    backgroundColor: COLORS.inputLine,
    marginTop: 4,
  },

  // Button
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  signUpButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  signUpButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'serif',
  },

  // Bottom Tab Bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#C5C5D8',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: {
    padding: 8,
  },
  tabIcon: {
    fontSize: 22,
  },
});
