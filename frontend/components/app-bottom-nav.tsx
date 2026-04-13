import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { GLASS_COLORS } from '@/components/glass-ui';

type NavPath = '/taskPage' | '/ShoppingList' | '/home' | '/calendar' | '/expenses';

export function AppBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const goTo = (path: NavPath) => {
    if (pathname === path) return;
    router.push(path);
  };

  const active = (p: NavPath) => pathname === p || (p === '/home' && (pathname === '/' || pathname === '/index'));

  const color = (p: NavPath) => (active(p) ? GLASS_COLORS.active : GLASS_COLORS.inactive);

  return (
    <View style={styles.wrap}>
      <BlurView intensity={40} tint="light" style={styles.dock}>
        <View pointerEvents="none" style={styles.dockTint} />

        <Pressable style={styles.iconButton} onPress={() => goTo('/taskPage')} hitSlop={8}>
          <Ionicons name="list-outline" size={24} color={color('/taskPage')} />
        </Pressable>

        <Pressable style={styles.iconButton} onPress={() => goTo('/ShoppingList')} hitSlop={8}>
          <Ionicons name="bag-outline" size={24} color={color('/ShoppingList')} />
        </Pressable>

        <Pressable style={styles.iconButton} onPress={() => goTo('/home')} hitSlop={8}>
          <Ionicons name="home-outline" size={26} color={color('/home')} />
        </Pressable>

        <Pressable style={styles.iconButton} onPress={() => goTo('/calendar')} hitSlop={8}>
          <Ionicons name="calendar-outline" size={24} color={color('/calendar')} />
        </Pressable>

        <Pressable style={styles.iconButton} onPress={() => goTo('/expenses')} hitSlop={8}>
          <Ionicons name="ribbon-outline" size={24} color={color('/expenses')} />
        </Pressable>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    alignItems: 'center',
  },
  dock: {
    width: '100%',
    maxWidth: 420,
    height: 64,
    borderRadius: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: GLASS_COLORS.border,
  },
  dockTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
