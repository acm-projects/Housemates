import React, { useState } from 'react';
import { apiPost } from "@/utils/api";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

// --- Types ---
type Props = {
  onBack?: () => void;
  onJoinHouse?: (data: { password: string }) => void;
};

// --- Colors ---
export const COLORS = {
  bg:           '#FDFDFF',
  cardBg:       '#F2F5FA',
  primary:      '#0A2239',
  secondary:    '#176087',
  accent:       '#ADB6C4',
  textDark:     '#132E32',
  textMuted:    '#98AAC5',
  border:       '#3590F3',
  borderFocus:  '#ADB6C4',
  white:        '#FFFFFF',
}

// --- Main Screen ---
export default function JoinHouseScreen({
  onBack = () => {},
  onJoinHouse = () => {},
}: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  async function joinHouse(code: string) {
    try {
      const result = await apiPost("/house/join", { inviteCode: code });
      console.log(result);
    } catch (err) {
      console.error("Error joining house:", err);
    }
  }

  const handleJoinHouse = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    joinHouse(password);
    setError('');
    onJoinHouse({ password });
  };

  const handleScanQR = () => {
    router.push('/QrCode');
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <Text style={styles.backArrow}>←</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Join a House</Text>
          <Text style={styles.subtitle}>Connect with your housemates</Text>
        </View>
      </View>

      <View style={styles.accentBar} />

      {/* Keyboard-aware content */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* QR Option Card — tapping navigates to the QR/addHousemate screen */}
          <TouchableOpacity
            style={styles.qrCard}
            onPress={handleScanQR}
            accessibilityRole="button"
            accessibilityLabel="Join with QR code"
            activeOpacity={0.8}
          >
            <View style={styles.qrCardLeft}>
              <View style={styles.qrIconBox}>
                <Text style={styles.qrIconText}>▦</Text>
              </View>
              <View>
                <Text style={styles.qrCardTitle}>Scan QR Code</Text>
                <Text style={styles.qrCardDesc}>Fastest way to join</Text>
              </View>
            </View>
            <View style={styles.qrBadge}>
              <Text style={styles.qrBadgeText}>SCAN</Text>
            </View>
          </TouchableOpacity>

          {/* Divider with OR */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          {/* Password Card */}
          <View style={styles.passwordCard}>
            <Text style={styles.cardSectionLabel}>ENTER PASSWORD</Text>
            <Text style={styles.passwordHint}>Ask your housemate for your house password.</Text>

            <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
              <Text style={styles.inputLabel}>House Password</Text>
              <TextInput
                style={styles.input}
                cursorColor={COLORS.primary}
                selectionColor={`${COLORS.primary}40`}
                placeholder="Min. 6 characters"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleJoinHouse}
              />
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}
          </View>

          {/* Join Button */}
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinHouse}
            accessibilityRole="button"
            accessibilityLabel="Join House"
            activeOpacity={0.85}
          >
            <Text style={styles.joinButtonText}>Join House</Text>
            <Text style={styles.joinButtonArrow}>→</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>Need help? Contact your housemate to resend the invite.</Text>

        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 14,
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
  headerTextGroup: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
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

  keyboardView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },

  // QR Card
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  qrCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qrIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIconText: {
    fontSize: 30,
    color: COLORS.white,
  },
  qrCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  qrCardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  qrBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  qrBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // OR divider
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Password Card
  passwordCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 22,
    marginBottom: 22,
    shadowColor: '#2C3A22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(103, 141, 88, 0.1)',
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  passwordHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
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

  // Error
  errorBanner: {
    backgroundColor: '#FFF0EE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  errorText: {
    color: '#B0524A',
    fontSize: 13,
    fontWeight: '500',
  },

  // Join Button
  joinButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  joinButtonArrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 16,
  },
});
