import * as React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

/** Matches signup / app-wide glass + mesh background */
export const GLASS_COLORS = {
  bg: '#F7F3F2',
  title: '#EC8575',
  active: '#EC8575',
  inactive: '#000000',
  textDark: '#000000',
  textMuted: '#5E5A58',
  white: '#FFFFFF',
  glass: 'rgba(255,255,255,0.18)',
  border: 'rgba(255,255,255,0.35)',
  pink: 'rgba(255,154,139,0.7)',
  orange: 'rgba(255,174,127,0.7)',
  yellow: 'rgba(255,218,137,0.7)',
} as const;

export function BackgroundGlows() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={[styles.glow, styles.pinkGlow]} />
      <View style={[styles.glow, styles.orangeGlow]} />
      <View style={[styles.glow, styles.yellowGlow]} />
    </View>
  );
}

export function GlassCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <BlurView intensity={26} tint="light" style={[styles.glassCard, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  pinkGlow: { left: -20, top: 290, backgroundColor: GLASS_COLORS.pink },
  orangeGlow: { right: -18, top: 110, backgroundColor: GLASS_COLORS.orange },
  yellowGlow: { right: -8, bottom: 150, backgroundColor: GLASS_COLORS.yellow },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 16,
    backgroundColor: GLASS_COLORS.glass,
    borderWidth: 1,
    borderColor: GLASS_COLORS.border,
  },
});
