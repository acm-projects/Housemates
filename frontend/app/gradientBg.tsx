import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

export function GradientBackground({ children }: { children: ReactNode }) {
  return (
    <View style={s.container}>
      {/* White base */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#FFFAF7" }]} />

      {/* Pink blob — middle left, pulled further off-screen */}
      <View style={s.pinkBlob} />

      {/* Peach blob — top right, tucked into corner */}
      <View style={s.peachBlob} />

      {/* Pale golden blob — bottom right */}
      <View style={s.yellowBlob} />

      {/* Blur pass to melt blobs softly */}
      <BlurView intensity={150} tint="light" style={StyleSheet.absoluteFillObject} />

      <View style={s.content}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  content:   { flex: 1 },

  pinkBlob: {
    position:        "absolute",
    width:           300,
    height:          300,
    borderRadius:    150,
    backgroundColor: "rgba(255, 148, 130, 0.65)",
    left:            -160,
    top:             "35%",
  },
  peachBlob: {
    position:        "absolute",
    width:           260,
    height:          240,
    borderRadius:    130,
    backgroundColor: "rgba(255, 196, 140, 0.60)",
    right:           -120,
    top:             -80,
  },
  yellowBlob: {
    position:        "absolute",
    width:           280,
    height:          260,
    borderRadius:    140,
    backgroundColor: "rgba(224, 196, 140, 0.62)",
    right:           -100,
    bottom:          -80,
  },
});