import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import AppBottomNav from './AppBottomNav';

type Props = {
  inviteCode?: string;
};

export default function AddHousemateScreen({
  inviteCode = 'https://yourapp.com/invite/abc123',
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.pinkGlow} />
      <View style={styles.orangeGlow} />
      <View style={styles.yellowGlow} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={20} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Add a Housemate</Text>
          <Text style={styles.subtitle}>Scan the Code to Continue</Text>
        </View>

        <TouchableOpacity style={styles.bellWrap}>
          <Ionicons name="notifications" size={20} color="#1a1a1a" />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <View style={styles.qrCard}>
          <QRCode value={inviteCode} size={280} />
        </View>
      </View>

      <AppBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3F2',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#EC8575',
  },
  bellWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: '#f5a08c',
  },
  main: {
    paddingTop: 32,
  },
  qrCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinkGlow: {
    position: 'absolute',
    left: -20,
    top: 290,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,154,139,0.7)',
  },
  orangeGlow: {
    position: 'absolute',
    right: -18,
    top: 110,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,174,127,0.7)',
  },
  yellowGlow: {
    position: 'absolute',
    right: -8,
    bottom: 150,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,218,137,0.7)',
  },
});
