import React, { useState } from 'react';
import { apiDelete, apiGetWithBody, apiPost, apiPut, extractDynamoItems } from "@/utils/api";
import { API_HOUSE_ID, API_USER_ID } from "./apiConfig";
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
  ActivityIndicator,
  Alert,
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
  const [newHouseName, setNewHouseName] = useState('');
  const [createUserId, setCreateUserId] = useState(API_USER_ID);
  const [houseIdToDelete, setHouseIdToDelete] = useState('');
  const [houseApiBusy, setHouseApiBusy] = useState(false);
  const [updateHouseId, setUpdateHouseId] = useState('');
  const [updateHouseName, setUpdateHouseName] = useState('');
  const [addMemberHouseId, setAddMemberHouseId] = useState('');
  const [addMemberUserId, setAddMemberUserId] = useState(API_USER_ID);
  const [usersHouseIdForGet, setUsersHouseIdForGet] = useState(API_HOUSE_ID);
  const [usersHousePreview, setUsersHousePreview] = useState('');

  async function fetchUsersInHouse() {
    const house_id = usersHouseIdForGet.trim();
    if (!house_id) {
      Alert.alert('GET /users/house', 'Enter a house_id.');
      return;
    }
    setHouseApiBusy(true);
    try {
      const data = await apiGetWithBody('/users/house', { house_id });
      const users = extractDynamoItems(data);
      setUsersHousePreview(JSON.stringify(users, null, 2).slice(0, 6000));
    } catch (e) {
      Alert.alert('Fetch users failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setHouseApiBusy(false);
    }
  }

  async function createHouseApi() {
    const name = newHouseName.trim();
    const user_id = createUserId.trim();
    if (!name || !user_id) {
      Alert.alert('Missing fields', 'Enter a house name and user id.');
      return;
    }
    setHouseApiBusy(true);
    try {
      const res = (await apiPost('/house', { name, user_id })) as {
        id?: string;
        message?: string;
      };
      Alert.alert(
        'House created',
        res.id ? `house id: ${res.id}` : (res.message ?? 'OK'),
      );
      setNewHouseName('');
    } catch (e) {
      Alert.alert('Create house failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setHouseApiBusy(false);
    }
  }

  async function updateHouseApi() {
    const id = updateHouseId.trim();
    const name = updateHouseName.trim();
    if (!id || !name) {
      Alert.alert('PUT /house', 'Enter house id and new name.');
      return;
    }
    setHouseApiBusy(true);
    try {
      await apiPut('/house', { id, name });
      Alert.alert('Updated', 'House name saved.');
    } catch (e) {
      Alert.alert('Update house failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setHouseApiBusy(false);
    }
  }

  async function addUserToHouseApi() {
    const id = addMemberHouseId.trim();
    const user_id = addMemberUserId.trim();
    if (!id || !user_id) {
      Alert.alert('PUT /house/user', 'Enter house id and user_id to append.');
      return;
    }
    setHouseApiBusy(true);
    try {
      await apiPut('/house/user', { id, user_id });
      Alert.alert('Member added', 'User appended to house users list.');
    } catch (e) {
      Alert.alert('Add member failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setHouseApiBusy(false);
    }
  }

  async function deleteHouseApi() {
    const house_id = houseIdToDelete.trim();
    if (!house_id) {
      Alert.alert('Missing id', 'Enter house_id to delete.');
      return;
    }
    setHouseApiBusy(true);
    try {
      await apiDelete('/house', { house_id });
      Alert.alert('Deleted', 'House and related data removed.');
      setHouseIdToDelete('');
    } catch (e) {
      Alert.alert('Delete house failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setHouseApiBusy(false);
    }
  }

  const handleJoinHouse = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
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

          <View style={styles.apiCard}>
            <Text style={styles.cardSectionLabel}>USERS IN HOUSE (GET /users/house)</Text>
            <Text style={styles.passwordHint}>
              Lists Users_HM rows for this house (same index as the backend house-index).
            </Text>
            <TextInput
              style={styles.apiInput}
              placeholder="house_id"
              placeholderTextColor={COLORS.textMuted}
              value={usersHouseIdForGet}
              onChangeText={setUsersHouseIdForGet}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.apiCreateBtn}
              onPress={fetchUsersInHouse}
              disabled={houseApiBusy}
              activeOpacity={0.85}
            >
              {houseApiBusy ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.apiBtnText}>Fetch users in house</Text>
              )}
            </TouchableOpacity>
            {usersHousePreview ? (
              <ScrollView
                style={styles.usersPreviewScroll}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.usersPreviewText} selectable>
                  {usersHousePreview}
                </Text>
              </ScrollView>
            ) : null}

            <Text style={[styles.cardSectionLabel, { marginTop: 20 }]}>CREATE HOUSE (POST /house)</Text>
            <Text style={styles.passwordHint}>Creates a new house in DynamoDB and S3 bucket.</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="House name"
              placeholderTextColor={COLORS.textMuted}
              value={newHouseName}
              onChangeText={setNewHouseName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.apiInput}
              placeholder="user_id (Cognito sub)"
              placeholderTextColor={COLORS.textMuted}
              value={createUserId}
              onChangeText={setCreateUserId}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.apiCreateBtn}
              onPress={createHouseApi}
              disabled={houseApiBusy}
              activeOpacity={0.85}
            >
              {houseApiBusy ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.apiBtnText}>Create house</Text>
              )}
            </TouchableOpacity>
            <Text style={[styles.cardSectionLabel, { marginTop: 16 }]}>DELETE HOUSE (DELETE /house)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="house_id to delete"
              placeholderTextColor={COLORS.textMuted}
              value={houseIdToDelete}
              onChangeText={setHouseIdToDelete}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.apiDeleteBtn}
              onPress={deleteHouseApi}
              disabled={houseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiBtnText}>Delete house</Text>
            </TouchableOpacity>
            <Text style={[styles.cardSectionLabel, { marginTop: 16 }]}>UPDATE HOUSE (PUT /house)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="house id"
              placeholderTextColor={COLORS.textMuted}
              value={updateHouseId}
              onChangeText={setUpdateHouseId}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.apiInput}
              placeholder="New house name"
              placeholderTextColor={COLORS.textMuted}
              value={updateHouseName}
              onChangeText={setUpdateHouseName}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={styles.apiCreateBtn}
              onPress={updateHouseApi}
              disabled={houseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiBtnText}>Update house name</Text>
            </TouchableOpacity>
            <Text style={[styles.cardSectionLabel, { marginTop: 16 }]}>ADD USER (PUT /house/user)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="house id"
              placeholderTextColor={COLORS.textMuted}
              value={addMemberHouseId}
              onChangeText={setAddMemberHouseId}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.apiInput}
              placeholder="user_id to append"
              placeholderTextColor={COLORS.textMuted}
              value={addMemberUserId}
              onChangeText={setAddMemberUserId}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.apiCreateBtn}
              onPress={addUserToHouseApi}
              disabled={houseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiBtnText}>Add user to house</Text>
            </TouchableOpacity>
          </View>

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

  apiCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(103, 141, 88, 0.1)',
  },
  apiInput: {
    backgroundColor: '#FAFAF7',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 10,
  },
  apiCreateBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  apiDeleteBtn: {
    backgroundColor: '#B0524A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  apiBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  usersPreviewScroll: {
    maxHeight: 160,
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  usersPreviewText: {
    fontSize: 11,
    color: COLORS.textDark,
  },
});
