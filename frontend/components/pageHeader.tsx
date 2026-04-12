import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type PageHeaderProps = {
  title: string;
  showBack?: boolean;
};

export function PageHeader({ title, showBack = true }: PageHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </Pressable>
      ) : (
        <View style={styles.iconSpacer} />
      )}
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Notifications">
        <Ionicons name="notifications-outline" size={22} color="#1a1a1a" />
        <View style={styles.notifDot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: { width: 40, height: 40 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f5a08c',
    borderWidth: 1,
    borderColor: '#fff',
  },
});
