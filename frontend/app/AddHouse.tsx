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
import {
  HomeIcon,
  ChecklistIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ExpensesIcon
} from './icons';

// --- Types ---
type Props = {
  onBack?: () => void;
  onAddHousemate?: () => void;
  onAddHouse?: (data: { houseName: string; password: string }) => void;
};

// --- Main Screen ---
export default function AddHouseScreen({
  onBack = () => {},
  onAddHousemate = () => {},
  onAddHouse = () => {},
}: Props) {
  const [houseName, setHouseName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function addHouse(name: string) {
    try {
      const result = await apiPost("/house", { name });
      console.log(result);
    } catch (err) {
      console.error("Error adding house:", err);
    }
  }

  const handleAddHouse = () => {
    if (!houseName.trim()) {
      setError('Please enter a name for your house.');
      return;
    }
    addHouse(houseName);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    onAddHouse({ houseName, password });
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
            <Text style={styles.backArrow}>{'←'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Add a House</Text>
          <Text style={styles.subtitle}>Set up your shared home</Text>
        </View>
      </View>

      {/* Decorative top accent bar */}
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

          {/* Step indicators */}
          <View style={styles.stepsRow}>
            <View style={styles.stepActive}><Text style={styles.stepActiveText}>1</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepInactive}><Text style={styles.stepInactiveText}>2</Text></View>
            <View style={styles.stepLine} />
            <View style={styles.stepInactive}><Text style={styles.stepInactiveText}>3</Text></View>
          </View>

          <Text style={styles.cardSectionLabel}>HOUSE DETAILS</Text>

          {/* House Name Input */}
          <View style={[styles.inputContainer, focusedField === 'name' && styles.inputContainerFocused]}>
            <Text style={styles.inputLabel}>House Name</Text>
            <TextInput
              style={styles.input}
              cursorColor={COLORS.primary}
              selectionColor={`${COLORS.primary}40`}
              placeholder="e.g. The Green House"
              placeholderTextColor={COLORS.textMuted}
              value={houseName}
              onChangeText={setHouseName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Add House Members */}
          <TouchableOpacity
            style={styles.membersButton}
            onPress={onAddHousemate}
            accessibilityRole="button"
            accessibilityLabel="Add house members"
            activeOpacity={0.75}
          >
            <View style={styles.membersButtonLeft}>
              <View style={styles.memberIconCircle}>
                <Text style={styles.memberIconText}>👥</Text>
              </View>
              <Text style={styles.membersButtonText}>Invite Housemates</Text>
            </View>
            <Text style={styles.membersChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.cardSectionLabel}>SECURITY</Text>

          {/* Password Input */}
          <View style={[styles.inputContainer, focusedField === 'password' && styles.inputContainerFocused]}>
            <Text style={styles.inputLabel}>House Password</Text>
            <TextInput
              style={styles.input}
              cursorColor={COLORS.primary}
              selectionColor={`${COLORS.primary}40`}
              placeholder="Min. 6 characters"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleAddHouse}
            />
          </View>

          {/* Validation error */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Add House Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddHouse}
            accessibilityRole="button"
            accessibilityLabel="Add house"
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonText}>Create House</Text>
            <Text style={styles.addButtonArrow}>→</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>You can always change these settings later.</Text>

        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// --- Colors ---
const COLORS = {
  bg: '#FDFDFF',
  cardBg: '#D1DAE6',
  primary: '#0A2239',
  secondary: '#176087',
  accent: '#ADB6C4',//
  textDark: '#132E32',
  textMuted: '#98AAC5',
  border: '#3590F3',
  borderFocus: '#ADB6C4',
  stepInactive: '#ADB6C4',
  white: '#FFFFFF',

};

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
  headerTextGroup: {
    flex: 1,
  },
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

  // Accent bar
  accentBar: {
    height: 3,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 4,
  },

  // Keyboard + Scroll
  keyboardView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // Steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActiveText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  stepInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.stepInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInactiveText: {
    color: COLORS.stepInactive,
    fontWeight: '700',
    fontSize: 14,
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: COLORS.stepInactive,
    marginHorizontal: 6,
    maxWidth: 48,
  },

  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 14,
  },

  // Input
  inputContainer: {
    backgroundColor: '#FAFAF7',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
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

  // Members Button
  membersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${COLORS.secondary}22`,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
  },
  membersButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberIconText: {
    fontSize: 14,
  },
  membersButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
  membersChevron: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: '300',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },

  // Error
  errorBanner: {
    backgroundColor: '#FFF0EE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  errorText: {
    color: '#B0524A',
    fontSize: 13,
    fontWeight: '500',
  },

  // Button
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
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
  addButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  addButtonArrow: {
    color: COLORS.secondary,
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
