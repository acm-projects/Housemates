import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  type ViewStyle,
  View,
} from 'react-native';
import { AppBottomNav } from '../components/app-bottom-nav';

const COLORS = {
  bg:          '#FDFDFF',
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        {/* Header */}
        <View style={styles.topRow}>
<<<<<<< HEAD
          <Pressable style={styles.topIconButton} onPress={() => router.back()}>
            <View style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
            </View>
=======
          <Pressable style={styles.topIconButton} onPress={() => router.replace('/')}>
            <Ionicons name="chevron-back" size={23} color="#1d2030" />
>>>>>>> 651e2acdcb42e3816e228cd85993702b449e4183
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
