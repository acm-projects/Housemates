import { StyleSheet, View } from "react-native";
import { ReactNode } from "react";

interface GradientBackgroundProps {
  children: ReactNode
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pinkGlow} />
      <View style={styles.orangeGlow} />
      <View style={styles.yellowGlow} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3F2",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  pinkGlow: {
    position: "absolute",
    left: -20,
    top: 290,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,154,139,0.7)",
  },
  orangeGlow: {
    position: "absolute",
    right: -18,
    top: 110,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,174,127,0.7)",
  },
  yellowGlow: {
    position: "absolute",
    right: -8,
    bottom: 150,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,218,137,0.7)",
  },
});