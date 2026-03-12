import { Pressable, Text, StyleSheet } from "react-native";

import { colors } from "../constants/theme";
import type { DateItem } from "../constants/tasks";

type DateChipProps = {
  item: DateItem;
  selected?: boolean;
  onPress?: () => void;
};

export const DATE_CHIP_WIDTH = 110;
export const DATE_CHIP_GAP = 14;

export function DateChip({ item, selected, onPress }: DateChipProps) {
  const isSelected = Boolean(selected);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, isSelected ? styles.activeContainer : null]}
      accessibilityRole="button"
    >
      <Text style={[styles.month, isSelected ? styles.activeText : null]}>{item.month}</Text>
      <Text style={[styles.day, isSelected ? styles.activeText : null]}>{item.day}</Text>
      <Text style={[styles.weekDay, isSelected ? styles.activeText : null]}>{item.weekDay}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: DATE_CHIP_WIDTH,
    height: 142,
    borderRadius: 28,
    backgroundColor: colors.chipBg,
    alignItems: "center",
    justifyContent: "center",
  },
  activeContainer: {
    backgroundColor: colors.chipActive,
  },
  month: {
    fontSize: 21,
    color: colors.textMain,
    lineHeight: 25,
  },
  day: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: "800",
    color: colors.textMain,
    lineHeight: 38,
  },
  weekDay: {
    marginTop: 6,
    fontSize: 21,
    color: colors.textMain,
    lineHeight: 25,
  },
  activeText: {
    color: colors.white,
  },
});
