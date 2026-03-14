import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NotificationCard from "@/components/NotificationCard";
import HouseholdMembersCard from "@/components/HouseholdMembersCard";
import BottomTabBar from "@/components/BottomTabBar";
import Colors from "@/constants/Colors";

export default function SettingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"tasks" | "shopping" | "home" | "calendar" | "saved">("home");

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.icon} />
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <NotificationCard />
        <HouseholdMembersCard />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.headerText,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 8,
  },
});
