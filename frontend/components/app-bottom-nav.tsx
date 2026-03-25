import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export function AppBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const goTo = (path: '/' | '/tasks' | '/settings') => {
    if (pathname === path) return;
    router.replace(path);
  };

  const isHome = pathname === '/' || pathname === '/index';
  const isTasks = pathname === '/tasks';
  const isSettings = pathname === '/settings';

  return (
    <View style={styles.wrap}>
      <View style={styles.dock}>
        <Pressable style={styles.iconButton} onPress={() => goTo('/tasks')}>
          <Ionicons name="checkmark-done-outline" size={28} color={isTasks ? '#11131a' : '#141722'} />
        </Pressable>

        <Pressable style={styles.iconButton}>
          <Ionicons name="briefcase-outline" size={27} color="#141722" />
        </Pressable>

        <Pressable onPress={() => goTo('/')} style={[styles.homeBubble, isHome && styles.activeBubble]}>
          <Ionicons name="home" size={18} color="#f3f4f8" />
        </Pressable>

        <Pressable style={styles.iconButton}>
          <Ionicons name="calendar-outline" size={25} color="#141722" />
        </Pressable>

        <Pressable style={styles.iconButton} onPress={() => goTo('/settings')}>
          <Ionicons name="bookmark-outline" size={24} color={isSettings ? '#11131a' : '#141722'} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center',
  },
  dock: {
    width: '91%',
    height: 68,
    backgroundColor: 'rgba(214, 214, 216, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBubble: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#12141b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeBubble: {
    backgroundColor: '#0f1218',
  },
});