import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shadows } from '@/constants/theme';

type AnnouncementCardProps = {
  message: string;
  time: string;
  isActive: boolean;
  onPress: () => void;
};

export function AnnouncementCard({ message, time, isActive, onPress }: AnnouncementCardProps) {
  return (
    <Pressable style={[styles.card, isActive && styles.cardActive]} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Feather name="message-square" size={20} color="#1f232f" />
      </View>
      <View style={styles.textWrap}>
        <Text numberOfLines={1} style={styles.message}>
          {message}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 16,
    ...shadows.soft,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: '#1790ee',
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#e9eaef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textWrap: {
    flex: 1,
  },
  message: {
    fontSize: 18,
    color: '#2f3039',
    fontWeight: '500',
  },
  time: {
    fontSize: 14,
    color: '#6c6c7d',
    marginTop: 4,
    fontWeight: '600',
  },
});
