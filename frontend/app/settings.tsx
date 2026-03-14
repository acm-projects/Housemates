import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

const members = ['1', '2', '3'];

export default function SettingsScreen() {
  const router = useRouter();
  const [taskReminders, setTaskReminders] = useState(false);
  const [paymentReminders, setPaymentReminders] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.topRow}>
          <Pressable style={styles.topIconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={23} color="#1d2030" />
          </Pressable>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Settings</Text>
          </View>
          <Pressable style={styles.topIconButton}>
            <Ionicons name="notifications" size={21} color="#1d2030" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notificationCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={25} color="#171a2b" />
              <Text style={styles.sectionTitle}>Notification Settings</Text>
            </View>

            <View style={styles.settingsList}>
              <View style={styles.settingRow}>
                <View style={styles.settingLabelWrap}>
                  <Text style={styles.settingLabel}>Task Reminders</Text>
                </View>
                <View style={styles.switchWrap}>
                  <Pressable
                    onPress={() => setTaskReminders((value) => !value)}
                    style={[styles.toggleTrack, taskReminders && styles.toggleTrackActive]}>
                    <View style={[styles.toggleThumb, taskReminders && styles.toggleThumbActive]} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLabelWrap}>
                  <Text style={styles.settingLabel}>Payment Reminders</Text>
                </View>
                <View style={styles.switchWrap}>
                  <Pressable
                    onPress={() => setPaymentReminders((value) => !value)}
                    style={[styles.toggleTrack, paymentReminders && styles.toggleTrackActive]}>
                    <View
                      style={[styles.toggleThumb, paymentReminders && styles.toggleThumbActive]}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.membersCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={25} color="#f4f4f7" />
              <Text style={styles.memberSectionTitle}>Household Members</Text>
            </View>

            {members.map((member) => (
              <View key={member} style={styles.memberItem}>
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={38}
                  color="#2d1014"
                />
                <View style={styles.memberTextWrap}>
                  <Text style={styles.memberLabel}>MEMBER</Text>
                  <Text style={styles.memberNumber}>{member}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.bottomBuffer} />
        </ScrollView>

        <AppBottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e7e8ee',
  },
  page: {
    flex: 1,
    backgroundColor: '#e7e8ee',
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 4,
    marginBottom: 14,
  },
  topIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    color: '#1f2232',
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  notificationCard: {
    backgroundColor: '#b9c4e9',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#9aaad6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#161928',
    fontSize: 20,
    lineHeight: 26,
    fontFamily: 'System',
    fontWeight: '500',
    flexShrink: 1,
  },
  settingsList: {
    gap: 12,
    marginTop: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  settingLabelWrap: {
    flex: 1,
    maxWidth: '72%',
    justifyContent: 'center',
  } satisfies ViewStyle,
  settingLabel: {
    color: '#1f2130',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: 'Georgia',
    paddingRight: 16,
    flexWrap: 'nowrap',
  },
  switchWrap: {
    width: 72,
    height: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  toggleTrack: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1e7ea',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#7f8ec4',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#565659',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleThumbActive: {
    backgroundColor: '#1f2338',
    alignSelf: 'flex-end',
  },
  membersCard: {
    backgroundColor: '#7281b8',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  memberSectionTitle: {
    color: '#f4f4f7',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
    flexShrink: 1,
  },
  memberItem: {
    backgroundColor: '#f7f7f8',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    minHeight: 76,
  },
  memberTextWrap: {
    justifyContent: 'center',
  },
  memberLabel: {
    color: '#26262e',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  memberNumber: {
    color: '#26262e',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  bottomBuffer: {
    height: 88,
  },
});
