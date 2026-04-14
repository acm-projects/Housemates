import { Ionicons } from '@expo/vector-icons'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

export function AppBottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const go = (route: '/home' | '/taskPage' | '/ShoppingList' | '/calendar' | '/expenses') => {
    if (pathname !== route) {
      router.push(route)
    }
  }

  const iconColor = (route: string) => {
    return pathname === route ? '#111111' : '#6B7280'
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <Pressable style={styles.navIconButton} onPress={() => go('/home')} hitSlop={12}>
          <Ionicons name="home-outline" size={22} color={iconColor('/home')} />
        </Pressable>

        <Pressable style={styles.navIconButton} onPress={() => go('/taskPage')} hitSlop={12}>
          <Ionicons name="checkmark-circle-outline" size={22} color={iconColor('/taskPage')} />
        </Pressable>

        <Pressable style={styles.navIconButton} onPress={() => go('/ShoppingList')} hitSlop={12}>
          <Ionicons name="basket-outline" size={22} color={iconColor('/ShoppingList')} />
        </Pressable>

        <Pressable style={styles.navIconButton} onPress={() => go('/calendar')} hitSlop={12}>
          <Ionicons name="calendar-outline" size={22} color={iconColor('/calendar')} />
        </Pressable>

        <Pressable style={styles.navIconButton} onPress={() => go('/expenses')} hitSlop={12}>
          <Ionicons name="card-outline" size={22} color={iconColor('/expenses')} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  nav: {
    height: 64,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  navIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
})