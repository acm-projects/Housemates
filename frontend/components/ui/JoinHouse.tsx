import React, { useState } from 'react';
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

// --- Types ---
type Props = {
  onBack?: () => void;
  onJoinWithQR?: () => void;
  onJoinHouse?: (data: { password: string }) => void;
  qrPreviewValue?: string;
};

// --- Main Screen ---

export default function JoinHouseScreen({
  onBack = () => {},
  onJoinWithQR = () => {},
  onJoinHouse = () => {},
  qrPreviewValue = 'join-house-qr',
}: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleJoinHouse = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    onJoinHouse({ password });
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
          <Text style={styles.backArrow}>{'◀︎'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Join a House</Text>
        <View style={styles.headerSpacer} />
      </View>

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

          {/* QR Code Card */}
          <TouchableOpacity
            style={styles.qrCard}
            onPress={onJoinWithQR}
            accessibilityRole="button"
            accessibilityLabel="Join with QR code"
            activeOpacity={0.8}
          >
            <Text style={styles.qrText}>Join with QR code</Text>
            {/* Placeholder QR box — replace with a real scanner trigger */}
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>{'▦'}</Text>
            </View>
          </TouchableOpacity>

          {/* Password Card */}
          <View style={styles.passwordCard}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Or enter a password"
                placeholderTextColor="#4A5090"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleJoinHouse}
              />
              <View style={styles.inputLine} />
            </View>
          </View>

          {/* Validation error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Join House Button */}
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinHouse}
            accessibilityRole="button"
            accessibilityLabel="Join House"
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>Join House!</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF0',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
  },
  backArrow: {
    fontSize: 18,
    color: '#1A1A2E',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.3,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  headerSpacer: {
    width: 40,
  },

  // Keyboard + Scroll
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },

  // QR Card
  qrCard: {
    backgroundColor: '#C8D0F4',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  qrText: {
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '400',
    fontFamily: 'serif',
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C8D0F4',
  },
  qrPlaceholderText: {
    fontSize: 48,
    color: '#1A1A2E',
  },

  // Password Card
  passwordCard: {
    backgroundColor: '#C8D0F4',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    fontSize: 16,
    color: '#1A1A2E',
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontFamily: 'serif',
  },
  inputLine: {
    height: 1,
    backgroundColor: '#4A5090',
    marginTop: 4,
  },

  // Error
  errorText: {
    color: '#C0392B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Join Button
  joinButton: {
    backgroundColor: '#4A5090',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignSelf: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'serif',
  },
});
