import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiPost } from "@/utils/api";
import AppBottomNav from "./AppBottomNav";

// --- Colors ---
const COLORS = {
  bg: '#F7F3F2',
  active: '#EC8575',
  text: '#000000',
  white: '#FFFFFF',
};

// --- Screen ---
export default function JoinHouseScreen() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinWithQR = () => {
    router.push('/QrCode');
  };

  const handleJoinWithPassword = async () => {
    if (!password.trim()) return;

    setLoading(true);
    try {
      await apiPost('/house/join', { password });
      router.push('/home');
    } catch (e) {
      console.error('Join house failed', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.pinkGlow} />
      <View style={styles.orangeGlow} />
      <View style={styles.yellowGlow} />

      <Text style={styles.title}>Join a House</Text>

      <TouchableOpacity style={styles.qrCard} onPress={handleJoinWithQR}>
        <Text style={styles.cardText}>Join with QR Code</Text>
        <View style={styles.qrIconWrap}>
          <Ionicons name="qr-code" size={38} color="#1a1a1a" />
        </View>
      </TouchableOpacity>

      <View style={styles.inputCard}>
        <TextInput
          placeholder="Or Enter a Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="#8b7b6b"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.joinButton, (!password.trim() || loading) && styles.joinButtonDisabled]}
        onPress={handleJoinWithPassword}
        disabled={!password.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.joinText}>Join House!</Text>
        )}
      </TouchableOpacity>

      <AppBottomNav />
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3F2',
    padding: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#EC8575',
    marginBottom: 20,
  },

  qrCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  cardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  qrIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  input: {
    fontSize: 18,
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd4',
    paddingBottom: 8,
  },

  joinButton: {
    alignSelf: 'center',
    minWidth: 200,
    backgroundColor: 'rgba(245,160,140,0.9)',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  joinButtonDisabled: { opacity: 0.5 },

  joinText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
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