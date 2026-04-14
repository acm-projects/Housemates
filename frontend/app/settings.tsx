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

const COLORS = {
  bg: '#F7F3F2',
  pageGlowPink: 'rgba(255,154,139,0.18)',
  pageGlowOrange: 'rgba(255,174,127,0.16)',
  pageGlowYellow: 'rgba(255,218,137,0.18)',
  cardBg: 'rgba(255,255,255,0.84)',
  memberRowBg: 'rgba(255,241,211,0.40)',
  active: '#EC8575',
  toggleThumb: 'rgba(236,133,117,0.60)',
  toggleTrack: 'rgba(255,195,160,0.20)',
  textDark: '#000000',
  textMuted: '#5C5C5C',
  white: '#FFFFFF',
  inputBorder: 'rgba(0,0,0,0.08)',
  shadow: '#000000',
};

const members = ['1', '2', '3'];

export default function SettingsScreen() {
  const router = useRouter();
  const [taskReminders, setTaskReminders] = useState(false);
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
      <View style={styles.page}>
        <View style={styles.bgPink} />
        <View style={styles.bgOrange} />
        <View style={styles.bgYellow} />

        <View style={styles.topRow}>
          <Pressable style={styles.topIconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textDark} />
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Settings</Text>
          </View>

          <Pressable style={styles.topIconButton}>
            <View>
              <Ionicons name="notifications" size={20} color={COLORS.textDark} />
              <View style={styles.headerDot} />
            </View>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={20} color={COLORS.textDark} />
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
                  <ActivityIndicator color={COLORS.textDark} />
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

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Ionicons name="notifications" size={18} color={COLORS.textDark} />
                <View style={styles.smallDot} />
              </View>
              <Text style={styles.sectionTitle}>Notification Settings</Text>
            </View>

            <View style={styles.settingsList}>
              {[
                { label: 'Task Reminders', value: taskReminders, setter: setTaskReminders },
                { label: 'Payment Reminders', value: paymentReminders, setter: setPaymentReminders },
              ].map((setting) => (
                <View key={setting.label} style={styles.settingRow}>
                  <View style={styles.settingLabelWrap as ViewStyle}>
                    <Text style={styles.settingLabel}>{setting.label}</Text>
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

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={19} color={COLORS.textDark} />
              <Text style={styles.sectionTitle}>Household Members</Text>
            </View>

            {members.map((member) => (
              <View key={member} style={styles.memberItem}>
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={30}
                  color="#2B1D1D"
                  style={styles.memberIcon}
                />
                <View style={styles.memberTextWrap}>
                  <Text style={styles.memberLabel}>MEMBER</Text>
                  <Text style={styles.memberNumber}>{member}</Text>
                </View>
              </View>
            ))}

            <Pressable style={styles.addMemberRow}>
              <View style={styles.addMemberIconWrap}>
                <Ionicons name="add" size={18} color={COLORS.active} />
              </View>
              <Text style={styles.addMemberText}>Add a housemate</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.addHouseButton}
            onPress={() => router.push('/AddHouse')}
            android_ripple={{ color: `${COLORS.white}20` }}
          >
            <View style={styles.addHouseIconBox}>
              <Ionicons name="home" size={18} color={COLORS.white} />
            </View>
            <View style={styles.addHouseTextWrap}>
              <Text style={styles.addHouseTitle}>Add House</Text>
              <Text style={styles.addHouseSubtitle}>Set up a new shared home</Text>
            </View>
            <View style={styles.addHouseChevron}>
              <Ionicons name="chevron-forward" size={17} color="rgba(255,255,255,0.75)" />
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  page: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
  },

  bgPink: {
    position: 'absolute',
    left: -20,
    top: 290,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: COLORS.pageGlowPink,
  },

  bgOrange: {
    position: 'absolute',
    right: -18,
    top: 110,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: COLORS.pageGlowOrange,
  },

  bgYellow: {
    position: 'absolute',
    right: -8,
    bottom: 150,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: COLORS.pageGlowYellow,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    paddingHorizontal: 4,
  },

  topIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  headerDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.active,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 28,
    gap: 22,
  },

  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  smallDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.active,
  },

  profileHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 12,
    lineHeight: 16,
  },

  profileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 0.3,
    marginBottom: 4,
  },

  profileInput: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: 'rgba(255,255,255,0.92)',
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },

  profileBtnSecondaryText: {
    fontWeight: '700',
    color: COLORS.textDark,
    fontSize: 14,
  },

  profileBtnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.active,
  },

  profileBtnPrimaryText: {
    fontWeight: '700',
    color: COLORS.white,
    fontSize: 14,
  },

  settingsList: {
    gap: 10,
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 62,
  },

  settingLabelWrap: {
    flex: 1,
    justifyContent: 'center',
  },

  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  toggleTrack: {
    width: 50,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.toggleTrack,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },

  toggleTrackActive: {
    backgroundColor: COLORS.active,
  },

  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.toggleThumb,
    alignSelf: 'flex-start',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.white,
  },

  memberItem: {
    backgroundColor: COLORS.memberRowBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  memberIcon: {
    marginRight: 8,
  },

  memberTextWrap: {
    flex: 1,
  },

  memberLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textDark,
  },

  memberNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textDark,
    marginTop: 2,
  },

  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
    paddingHorizontal: 2,
  },

  addMemberIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(236,133,117,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addMemberText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  addHouseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.active,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },

  addHouseIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addHouseTextWrap: {
    flex: 1,
  },

  addHouseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  addHouseSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },

  addHouseChevron: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});