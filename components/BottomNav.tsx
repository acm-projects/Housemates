import { Feather, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, shadows } from '@/constants/theme';

export function BottomNav() {
  return (
    <View style={styles.wrap}>
      <BlurView intensity={34} tint="light" style={styles.blur}>
        <Pressable style={styles.iconButton}>
          <Feather name="check-square" size={28} color="#212121" />
        </Pressable>
        <Pressable style={styles.iconButton}>
          <Feather name="shopping-bag" size={28} color="#212121" />
        </Pressable>
        <Pressable style={[styles.iconButton, styles.active]}>
          <Feather name="home" size={24} color={colors.white} />
        </Pressable>
        <Pressable style={styles.iconButton}>
          <Feather name="calendar" size={28} color="#212121" />
        </Pressable>
        <Pressable style={styles.iconButton}>
          <MaterialIcons name="bookmark-border" size={30} color="#212121" />
        </Pressable>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
  },
  blur: {
    width: '90%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.navBackground,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    ...shadows.soft,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#010204',
    borderRadius: 14,
  },
});
