import { Text, Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native";

import { colors } from "../constants/theme";

type FilterPillProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function FilterPill({ label, active, onPress, style, textStyle }: FilterPillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, active ? styles.active : null, style]}
      accessibilityRole="button"
    >
      <Text
        style={[styles.text, active ? styles.activeText : null, textStyle]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "#C9D5EF",
    borderRadius: 28,
    paddingVertical: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: colors.primary,
  },
  text: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 22,
  },
  activeText: {
    color: colors.white,
    fontWeight: "700",
  },
});
