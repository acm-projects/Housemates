import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { BlurView } from 'expo-blur'

type Props = {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}

export function FrostedCard({ children, style }: Props) {
  return (
    <BlurView intensity={40} tint="light" style={[s.card, style]}>
      {children}
    </BlurView>
  )
}

const s = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.80)',
    // Drop shadow — 18% opacity as requested
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
})
