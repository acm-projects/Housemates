import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { 
  HomeIcon, 
  ChecklistIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ExpensesIcon 
} from './icons';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

// --- Types ---
type Props = {
  onBack?: () => void;
  inviteCode?: string;
};

// --- Main Screen ---

export default function AddHousemateScreen({
  onBack = () => {},
  inviteCode = 'https://yourapp.com/invite/abc123',
}: Props) {
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
        <View style={styles.headerText}>
          <Text style={styles.title}>Add a Housemate</Text>
          <Text style={styles.subtitle}>Scan the code to continue</Text>
        </View>
      </View>

      {/* QR Code Card */}
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <QRCode
            value={inviteCode}
            size={width * 0.6}
            backgroundColor="#C8D0F4"
            color="#1A1A2E"
          />
        </View>
        <Text style={styles.inviteLabel}>Share this code with your housemate</Text>
      </View>

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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  backButton: {
    paddingTop: 4,
    paddingRight: 4,
  },
  backArrow: {
    fontSize: 18,
    color: '#1A1A2E',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.3,
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 15,
    color: '#4A5090',
    marginTop: 2,
    fontFamily: 'serif',
  },

  // QR Card
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 20,
  },
  card: {
    backgroundColor: '#C8D0F4',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inviteLabel: {
    fontSize: 14,
    color: '#4A5090',
    fontFamily: 'serif',
  },
});