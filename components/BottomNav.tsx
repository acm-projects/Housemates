import { Feather, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

type NavTab = "list" | "bag" | "home" | "calendar" | "bookmark";

type BottomNavProps = {
  activeTab: NavTab;
  onTabPress: (tab: NavTab) => void;
};

export function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onTabPress("list")} accessibilityRole="button">
        <Feather name="list" size={31} color={activeTab === "list" ? "#000" : "#1F2433"} />
      </Pressable>
      <Pressable onPress={() => onTabPress("bag")} accessibilityRole="button">
        <Ionicons name="bag-outline" size={31} color={activeTab === "bag" ? "#000" : "#1F2433"} />
      </Pressable>
      <Pressable onPress={() => onTabPress("home")} accessibilityRole="button">
        <FontAwesome6 name="house" size={31} color={activeTab === "home" ? "#000" : "#1F2433"} />
      </Pressable>
      <Pressable onPress={() => onTabPress("calendar")} accessibilityRole="button">
        <MaterialCommunityIcons
          name="calendar-month"
          size={31}
          color={activeTab === "calendar" ? "#000" : "#1F2433"}
          style={activeTab === "calendar" ? styles.calendarIcon : null}
        />
      </Pressable>
      <Pressable onPress={() => onTabPress("bookmark")} accessibilityRole="button">
        <Ionicons name="bookmark" size={29} color={activeTab === "bookmark" ? "#000" : "#51596C"} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "#B0BDE0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calendarIcon: {
    shadowColor: "rgba(53, 63, 106, 0.35)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
});
