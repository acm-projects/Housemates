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

  const handleAddHouse = () => {
    if (!houseName.trim()) {
      setError('Please enter a name for your house.');
      return;
    }
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
          <Text style={styles.backArrow}>{'◀︎'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add a House</Text>
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
          <View style={styles.card}>

            {/* House Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Name your house!"
                placeholderTextColor="#4A5090"
                value={houseName}
                onChangeText={setHouseName}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
              <View style={styles.inputLine} />
            </View>

            {/* Add House Members */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={onAddHousemate}
              accessibilityRole="button"
              accessibilityLabel="Add house members"
              activeOpacity={0.7}
            >
              <View style={styles.membersRow}>
                <Text style={styles.placeholderText}>Add house members</Text>
                <Text style={styles.addIconText}>⊕</Text>
              </View>
              <View style={styles.inputLine} />
            </TouchableOpacity>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Create a password for your house"
                placeholderTextColor="#4A5090"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleAddHouse}
              />
              <View style={styles.inputLine} />
            </View>

            {/* Validation error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Add House Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddHouse}
              accessibilityRole="button"
              accessibilityLabel="Add house"
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Add house</Text>
            </TouchableOpacity>

          </View>
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
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Card
  card: {
    backgroundColor: '#C8D0F4',
    borderRadius: 20,
    padding: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
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
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#4A5090',
    fontFamily: 'serif',
  },
  addIconText: {
    fontSize: 22,
    color: '#4A5090',
    marginRight: 4,
  },

  // Error
  errorText: {
    color: '#C0392B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Button
  addButton: {
    backgroundColor: '#4A5090',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'serif',
  },
});