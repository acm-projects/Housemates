import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary:   '#0A2239',
  secondary: '#176087',
  accent:    '#ADB6C4',
  white:     '#FFFFFF',
  border:    '#3590F3',
  cardBg:    '#D1DAE6',
};

export function AppBottomNav() {
  const router   = useRouter();
  const pathname = usePathname();

  const tabs = [
    { route: '/taskPage',     icon: 'list-outline'     },
    { route: '/ShoppingList', icon: 'bag-outline'      },
    { route: '/home',         icon: 'home-outline'     },
    { route: null,     icon: 'calendar-outline' }, // because there is no calendar currently
    { route: '/expenses',     icon: 'card-outline'     },
  ] as const;

  return (
    <View style={styles.navContainer}>
      {tabs.map(({ route, icon }) => {
        const isActive = pathname === route;
        return (
          <Pressable
            key={route}
            onPress={() => {
              if (route) router.push(route);
            }}
            style={styles.navButton}
          >
            {isActive && <View style={styles.activeDot} />}
            <Ionicons
              name={icon}
              size={24}
              color={isActive ? COLORS.secondary : COLORS.primary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection:        'row',
    justifyContent:       'space-around',
    alignItems:           'center',
    height:               70,
    backgroundColor:      COLORS.cardBg,
    borderTopWidth:       1,
    borderTopColor:       '#E8EDF5',
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    position:      'absolute',
    bottom:        0,
    left:          0,
    right:         0,
    paddingBottom: 10,
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius:  8,
    elevation:     8,
  },
  navButton: {
    padding:        10,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },
  activeDot: {
    position:        'absolute',
    top:             2,
    width:           4,
    height:          4,
    borderRadius:    2,
    backgroundColor: COLORS.accent,
  },
});
