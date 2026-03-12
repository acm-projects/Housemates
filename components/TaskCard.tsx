import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/theme";
import type { TaskItem } from "../constants/tasks";

type TaskCardProps = {
  task: TaskItem;
  onPress?: () => void;
  onPressSticky?: () => void;
  onPressStatus?: () => void;
  onToggleDone?: () => void;
  done?: boolean;
};

const tagMap = {
  Done: { bg: colors.tagDoneBg, text: colors.tagTextDone },
  Urgent: { bg: colors.tagUrgentBg, text: colors.tagTextUrgent },
  "To-do": { bg: colors.tagTodoBg, text: colors.tagTextTodo },
};

export function TaskCard({
  task,
  onPress,
  onPressSticky,
  onPressStatus,
  onToggleDone,
  done,
}: TaskCardProps) {
  const tagStyle = tagMap[task.status];

  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <Pressable
        style={[styles.sticky, { backgroundColor: task.stickyColor }]}
        onPress={onPressSticky}
        accessibilityRole="button"
      />
      <Text style={styles.category}>{task.category}</Text>
      <Text style={styles.title}>{task.title}</Text>

      <View style={styles.footerRow}>
        <View style={styles.timeWrap}>
          <MaterialIcons name="access-time" size={17} color="#6E554A" />
          <Text style={styles.time}>{task.time}</Text>
        </View>

        <View style={styles.statusWrap}>
          <Pressable
            style={[styles.statusChip, { backgroundColor: tagStyle.bg }]}
            onPress={onPressStatus}
            accessibilityRole="button"
          >
            <Text style={[styles.statusText, { color: tagStyle.text }]}>{task.status}</Text>
          </Pressable>
          <Pressable onPress={onToggleDone} accessibilityRole="button">
            <Octicons name={done ? "check-circle-fill" : "circle"} size={20} color="#242833" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 26,
    borderColor: "#8A9BD7",
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 22,
    marginBottom: 18,
    position: "relative",
  },
  sticky: {
    width: 46,
    height: 46,
    borderRadius: 14,
    position: "absolute",
    right: 20,
    top: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  category: {
    color: colors.textSubtle,
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    color: colors.textMain,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    lineHeight: 24,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  time: {
    color: "#6A4D40",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusChip: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: "#3E486A",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
