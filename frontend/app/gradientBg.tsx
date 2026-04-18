import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function GradientBackground({ children }: { children: ReactNode }) {
  return (
    <View style={s.container}>
      <LinearGradient
        colors={["#F2F0F0","#F6E7E1","#F3EEE8","#EEE7D8"]}
        locations={[0,0.38,0.72,1]}
        start={{x:0,y:0}} end={{x:1,y:1}}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={s.content}>{children}</View>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex:1, overflow:'hidden' },
  content: { flex:1 },
});
