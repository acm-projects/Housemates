import { apiGetWithBody, apiPut, extractDynamoItems } from '@/utils/api';
import { API_USER_ID } from './apiConfig';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type ViewStyle,
  View,
} from 'react-native';
import { AppBottomNav } from '../components/app-bottom-nav';
import { BackgroundGlows, GLASS_COLORS } from '@/components/glass-ui';

const COLORS = {
  bg:          GLASS_COLORS.bg,
  cardBg:      '#D1DAE6',
  primary:     '#0A2239',
  secondary:   '#176087',
  accent:      '#ADB6C4',
  textDark:    '#132E32',
  textMuted:   '#98AAC5',
  border:      '#3590F3',
  white:       '#FFFFFF',
}

const members = ['1', '2', '3'];

export default function SettingsScreen() {
  const router = useRouter();
  const [taskReminders,    setTaskReminders]    = useState(false);
  const [paymentReminders, setPaymentReminders] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePfp, setProfilePfp] = useState('');
  const [profileSettingsJson, setProfileSettingsJson] = useState('{}');
  const [profileBusy, setProfileBusy] = useState(false);

  const loadProfile = useCallback(async () => {
    setProfileBusy(true);
    try {
      const data = await apiGetWithBody('/users', { user_id: API_USER_ID });
      const rows = extractDynamoItems(data);
      const u = rows[0];
      if (!u) return;
      setProfileName(String(u.name ?? ''));
      setProfileEmail(String(u.email ?? ''));
      setProfilePhone(String(u.phone_number ?? ''));
      setProfilePfp(String(u.pfp_url ?? ''));
      const s = u.settings;
      setProfileSettingsJson(
        s != null && typeof s === 'object' ? JSON.stringify(s, null, 2) : '{}',
      );
    } catch (e) {
      Alert.alert('GET /users failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setProfileBusy(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function saveProfile() {
    let settings: unknown = undefined;
    const raw = profileSettingsJson.trim();
    if (raw) {
      try {
        settings = JSON.parse(raw);
      } catch {
        Alert.alert('Invalid JSON', 'Fix the settings JSON before saving.');
        return;
      }
    }
    const body: Record<string, unknown> = { user_id: API_USER_ID };
    if (profileName.trim() !== '') body.name = profileName.trim();
    if (profileEmail.trim() !== '') body.email = profileEmail.trim();
    if (profilePhone.trim() !== '') body.phone_number = profilePhone.trim();
    if (profilePfp.trim() !== '') body.pfp_url = profilePfp.trim();
    if (settings !== undefined) body.settings = settings;
    const updateKeys = Object.keys(body).filter((k) => k !== 'user_id');
    if (updateKeys.length === 0) {
      Alert.alert('Nothing to save', 'Change at least one field (or set settings JSON).');
      return;
    }
    setProfileBusy(true);
    try {
      await apiPut('/users', body);
      Alert.alert('Saved', 'Profile updated (PUT /users).');
    } catch (e) {
      Alert.alert('PUT /users failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setProfileBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundGlows />
      <View style={styles.page}>

        {/* Header */}
        <View style={styles.topRow}>
        <Pressable style={styles.topIconButton} onPress={() => router.back()}>
        <View style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </View>
          </Pressable>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Settings</Text>
          </View>
          <Pressable style={styles.topIconButton}>
            <View style={styles.backBtn}>
              <Ionicons name="notifications" size={19} color={COLORS.primary} />
            </View>
          </Pressable>
        </View>

        {/* Accent bar */}
        <View style={styles.accentBar} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile — GET /users + PUT /users */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons name="person-circle-outline" size={22} color={COLORS.secondary} />
              </View>
              <Text style={styles.sectionTitle}>Your profile</Text>
            </View>
            <Text style={styles.profileHint}>
              GET /users and PUT /users · user_id: {API_USER_ID}
            </Text>
            <Text style={styles.profileLabel}>Name</Text>
            <TextInput
              style={styles.profileInput}
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Display name"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.profileLabel}>Email</Text>
            <TextInput
              style={styles.profileInput}
              value={profileEmail}
              onChangeText={setProfileEmail}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={styles.profileLabel}>Phone</Text>
            <TextInput
              style={styles.profileInput}
              value={profilePhone}
              onChangeText={setProfilePhone}
              placeholder="Phone number"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
            />
            <Text style={styles.profileLabel}>Profile photo URL</Text>
            <TextInput
              style={styles.profileInput}
              value={profilePfp}
              onChangeText={setProfilePfp}
              placeholder="https://…"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />
            <Text style={styles.profileLabel}>Settings (JSON object)</Text>
            <TextInput
              style={[styles.profileInput, styles.profileJsonInput]}
              value={profileSettingsJson}
              onChangeText={setProfileSettingsJson}
              placeholder="{}"
              placeholderTextColor={COLORS.textMuted}
              multiline
            />
            <View style={styles.profileActions}>
              <Pressable
                style={styles.profileBtnSecondary}
                onPress={loadProfile}
                disabled={profileBusy}
              >
                {profileBusy ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <Text style={styles.profileBtnSecondaryText}>Reload</Text>
                )}
              </Pressable>
              <Pressable
                style={styles.profileBtnPrimary}
                onPress={saveProfile}
                disabled={profileBusy}
              >
                <Text style={styles.profileBtnPrimaryText}>Save profile</Text>
              </Pressable>
            </View>
          </View>

          {/* Notification Settings Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons name="notifications" size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.sectionTitle}>Notification Settings</Text>
            </View>

            <View style={styles.settingsList}>
              {[
                { label: 'Task Reminders',    value: taskReminders,    setter: setTaskReminders },
                { label: 'Payment Reminders', value: paymentReminders, setter: setPaymentReminders },
              ].map((setting) => (
                <View key={setting.label} style={styles.settingRow}>
                  <View style={styles.settingLabelWrap as ViewStyle}>
                    <Text style={styles.settingLabel}>{setting.label}</Text>
                    <Text style={styles.settingSubtext}>
                      {setting.value ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setting.setter((v) => !v)}
                    style={[styles.toggleTrack, setting.value && styles.toggleTrackActive]}
                  >
                    <View style={[styles.toggleThumb, setting.value && styles.toggleThumbActive]} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Household Members Card */}
          <View style={styles.membersCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBox, { backgroundColor: `${COLORS.primary}20` }]}>
                <Ionicons name="people" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.memberSectionTitle}>Household Members</Text>
            </View>

            {members.map((member) => (
              <View key={member} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={32}
                    color={COLORS.secondary}
                  />
                </View>
                <View style={styles.memberTextWrap}>
                  <Text style={styles.memberLabel}>MEMBER</Text>
                  <Text style={styles.memberNumber}>{member}</Text>
                </View>
                <View style={styles.memberChevron}>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
                </View>
              </View>
            ))}

            {/* Add member row */}
            <Pressable style={styles.addMemberRow}>
              <View style={[styles.memberAvatar, { backgroundColor: `${COLORS.border}20` }]}>
                <Ionicons name="add" size={22} color={COLORS.secondary} />
              </View>
              <Text style={styles.addMemberText}>Add a housemate</Text>
            </Pressable>
          </View>

          {/* Add House Button */}
          <Pressable
            style={styles.addHouseButton}
            onPress={() => router.push('/AddHouse')}
            android_ripple={{ color: `${COLORS.white}20` }}
          >
            <View style={styles.addHouseIconBox}>
              <Ionicons name="home" size={20} color={COLORS.white} />
            </View>
            <View style={styles.addHouseTextWrap}>
              <Text style={styles.addHouseTitle}>Add House</Text>
              <Text style={styles.addHouseSubtitle}>Set up a new shared home</Text>
            </View>
            <View style={styles.addHouseChevron}>
              <Ionicons name="chevron-forward" size={18} color={`${COLORS.white}80`} />
            </View>
          </Pressable>

          <View style={{ height: 100 }} />
        </ScrollView>

        <AppBottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  page:     { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20 },

  // Header
  topRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 18, marginBottom: 8,
  },
  topIconButton: { width: 40, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${COLORS.border}50`,
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textDark },

  accentBar: {
    height: 3, backgroundColor: COLORS.secondary,
    borderRadius: 2, marginBottom: 16,
  },

  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 28, gap: 16 },

  // Cards shared
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22,
    borderWidth: 1, borderColor: `${COLORS.border}30`,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  membersCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 14, elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 16,
  },
  sectionIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${COLORS.secondary}20`,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle:       { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  memberSectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.white },

  profileHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 12,
    lineHeight: 16,
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  profileInput: {
    borderWidth: 1,
    borderColor: `${COLORS.border}80`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  profileJsonInput: {
    minHeight: 72,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  profileBtnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.secondary}12`,
  },
  profileBtnSecondaryText: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 15,
  },
  profileBtnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
  },
  profileBtnPrimaryText: {
    fontWeight: '700',
    color: COLORS.white,
    fontSize: 15,
  },

  // Toggle rows
  settingsList: { gap: 14 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', minHeight: 48,
  },
  settingLabelWrap: { flex: 1, justifyContent: 'center' },
  settingLabel:   { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  settingSubtext: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  toggleTrack: {
    width: 52, height: 28, borderRadius: 14,
    backgroundColor: '#DDE3EE',
    justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleTrackActive: { backgroundColor: `${COLORS.secondary}80` },
  toggleThumb: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignSelf: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 3, elevation: 2,
  },
  toggleThumbActive: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-end',
  },

  // Member items
  memberItem: {
    backgroundColor: `${COLORS.white}15`,
    borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 10,
    borderWidth: 1, borderColor: `${COLORS.white}20`,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: `${COLORS.secondary}30`,
    alignItems: 'center', justifyContent: 'center',
  },
  memberTextWrap: { flex: 1 },
  memberLabel: {
    fontSize: 10, fontWeight: '700',
    color: COLORS.accent, letterSpacing: 1,
  },
  memberNumber: { fontSize: 15, fontWeight: '600', color: COLORS.white, marginTop: 2 },
  memberChevron: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: `${COLORS.white}10`,
    alignItems: 'center', justifyContent: 'center',
  },
  addMemberRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 8, paddingHorizontal: 14,
    marginTop: 2,
  },
  addMemberText: { fontSize: 15, fontWeight: '600', color: `${COLORS.white}80` },

  // Add House Button
  addHouseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  addHouseIconBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: `${COLORS.white}20`,
    alignItems: 'center', justifyContent: 'center',
  },
  addHouseTextWrap: { flex: 1 },
  addHouseTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.white,
  },
  addHouseSubtitle: {
    fontSize: 12, color: `${COLORS.white}80`, marginTop: 2,
  },
  addHouseChevron: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: `${COLORS.white}15`,
    alignItems: 'center', justifyContent: 'center',
  },
});
