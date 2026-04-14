import * as React from "react";
import { apiDelete, apiGetWithBody, apiPost, apiPut, extractDynamoItems } from "@/utils/api";
import { API_HOUSE_ID, API_USER_ID } from "./apiConfig";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import {
  HomeIcon,
  ChecklistIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ExpensesIcon,
  BellIcon,
} from "./icons";
import { useRouter } from "expo-router";
import { GLASS_COLORS } from "@/components/glass-ui";
import { GradientBackground } from "./gradientBg";

export const COLORS = {
  bg: GLASS_COLORS.bg,
  cardBg: "#F2F5FA",
  primary: "#0A2239",
  secondary: "#176087",
  accent: "#ADB6C4",
  textDark: "#132E32",
  textMuted: "#98AAC5",
  border: "#3590F3",
  borderFocus: "#ADB6C4",
  white: "#FFFFFF",
};

type SplitMember = {
  id: string;
  name: string;
  avatar: string;
  amount: number;
};

type Expense = {
  id: string;
  icon: string;
  amount: number;
  description: string;
};

type GroupedExpenses = {
  date: string;
  expenses: Expense[];
};

const splitMembers: SplitMember[] = [
  { id: "1", name: "You", avatar: "https://i.pravatar.cc/80?img=1", amount: -99.0 },
  { id: "2", name: "Blake", avatar: "https://i.pravatar.cc/80?img=2", amount: 23.0 },
  { id: "3", name: "Sam", avatar: "https://i.pravatar.cc/80?img=3", amount: -99.0 },
  { id: "4", name: "Alex", avatar: "https://i.pravatar.cc/80?img=4", amount: -99.0 },
];

const groupedExpenses: GroupedExpenses[] = [
  {
    date: "February 16, 2026",
    expenses: [
      { id: "1", icon: "https://i.pravatar.cc/40?img=10", amount: 31.0, description: "Grocery Run" },
      { id: "2", icon: "https://i.pravatar.cc/40?img=11", amount: 18.5, description: "Streaming Service" },
    ],
  },
  {
    date: "February 14, 2026",
    expenses: [
      { id: "3", icon: "https://i.pravatar.cc/40?img=12", amount: 62.0, description: "Electricity Bill" },
      { id: "4", icon: "https://i.pravatar.cc/40?img=13", amount: 14.0, description: "Cleaning Supplies" },
    ],
  },
];

function SplitTableCard({ members }: { members: SplitMember[] }) {
  const totalOwed = members.filter((m) => m.amount > 0).reduce((a, m) => a + m.amount, 0);

  return (
    <View style={styles.splitCard}>
      <View style={styles.splitCardHeader}>
        <Text style={styles.splitTitle}>Split Table</Text>
        <View style={styles.splitSummaryRow}>
          <View style={styles.splitSummaryChip}>
            <View style={[styles.summaryDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.splitSummaryText}>+${totalOwed.toFixed(0)} owed to you</Text>
          </View>
        </View>
      </View>

      <View style={styles.membersRow}>
        {members.map((member) => {
          const isPositive = member.amount >= 0;
          return (
            <View key={member.id} style={styles.memberItem}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: member.avatar }} style={styles.avatar} />
                <View style={[styles.statusBadge, { backgroundColor: isPositive ? COLORS.primary : COLORS.accent }]}>
                  <Text style={styles.statusBadgeText}>{isPositive ? "↑" : "↓"}</Text>
                </View>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={[styles.memberAmount, { color: isPositive ? COLORS.primary : COLORS.accent }]}>
                {isPositive ? `+$${member.amount}` : `-$${Math.abs(member.amount)}`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ExpenseItem({ expense }: { expense: Expense }) {
  return (
    <View style={styles.expenseItem}>
      <View style={styles.expenseIconBox}>
        <Image source={{ uri: expense.icon }} style={styles.expenseIconImage} />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseDescription}>{expense.description}</Text>
        <Text style={styles.expenseDate}>Shared equally</Text>
      </View>
      <View style={styles.expenseAmountBox}>
        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
      </View>
    </View>
  );
}

function ExpenseDateGroup({ group }: { group: GroupedExpenses }) {
  const total = group.expenses.reduce((a, e) => a + e.amount, 0);

  return (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeaderRow}>
        <Text style={styles.dateHeader}>{group.date}</Text>
        <Text style={styles.dateTotal}>${total.toFixed(2)}</Text>
      </View>
      {group.expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </View>
  );
}

type TabItem = { id: string; icon: React.ReactNode };

const tabs: TabItem[] = [
  { id: "list", icon: <ChecklistIcon size={24} color={COLORS.primary} /> },
  { id: "wallet", icon: <ShoppingBagIcon size={24} color={COLORS.primary} /> },
  { id: "home", icon: <HomeIcon size={24} color={COLORS.primary} /> },
  { id: "calendar", icon: <CalendarIcon size={24} color={COLORS.primary} /> },
  { id: "flag", icon: <ExpensesIcon size={24} color={COLORS.primary} /> },
];

function BottomTabBar({
  activeTab,
  onTabPress,
}: {
  activeTab: string;
  onTabPress: (id: string) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
          onPress={() => onTabPress(tab.id)}
        >
          {activeTab === tab.id ? <View style={styles.tabActiveIndicator} /> : null}
          <Text style={styles.tabIcon}>{tab.icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ExpensesScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("flag");
  const [expenseName, setExpenseName] = React.useState("Groceries");
  const [expensePrice, setExpensePrice] = React.useState("25");
  const [expenseDue, setExpenseDue] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [expenseIdToDelete, setExpenseIdToDelete] = React.useState("");
  const [expenseApiBusy, setExpenseApiBusy] = React.useState(false);
  const [expenseFetchPreview, setExpenseFetchPreview] = React.useState("");
  const [expenseIdForGet, setExpenseIdForGet] = React.useState("");
  const [expensesUrgentOnly, setExpensesUrgentOnly] = React.useState(false);
  const [updateExpenseId, setUpdateExpenseId] = React.useState("");
  const [updateExpenseName, setUpdateExpenseName] = React.useState("");

  const handleSplitMoney = () => {
    router.push("/splitMoney");
  };

  async function createExpenseApi() {
    const price = Number.parseFloat(expensePrice);
    if (!expenseName.trim() || Number.isNaN(price)) {
      Alert.alert("Invalid", "Enter a name and numeric price.");
      return;
    }

    setExpenseApiBusy(true);
    try {
      const res = (await apiPost("/expenses", {
        house_id: API_HOUSE_ID,
        name: expenseName.trim(),
        price,
        payers: [API_USER_ID],
        owers: [API_USER_ID],
        creator: API_USER_ID,
        is_urgent: false,
        due_date: expenseDue,
      })) as { expense_id?: string; message?: string };

      Alert.alert("Expense created", res.expense_id ?? res.message ?? "OK");
    } catch (e) {
      Alert.alert("Create failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setExpenseApiBusy(false);
    }
  }

  async function deleteExpenseApi() {
    const id = expenseIdToDelete.trim();
    if (!id) {
      Alert.alert("Missing id", "Enter expense_id to delete.");
      return;
    }

    setExpenseApiBusy(true);
    try {
      await apiDelete("/expenses", { expense_id: id });
      Alert.alert("Deleted", "Expense removed.");
      setExpenseIdToDelete("");
    } catch (e) {
      Alert.alert("Delete failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setExpenseApiBusy(false);
    }
  }

  function setPreview(label: string, payload: unknown) {
    setExpenseFetchPreview(`${label}\n${JSON.stringify(payload, null, 2).slice(0, 4000)}`);
  }

  async function getExpenseOne() {
    const id = expenseIdForGet.trim();
    if (!id) {
      Alert.alert("GET /expense", "Enter expense_id.");
      return;
    }

    setExpenseApiBusy(true);
    try {
      const data = await apiGetWithBody("/expense", { expense_id: id });
      const items = extractDynamoItems(data);
      setPreview("GET /expense", items[0] ?? data);
    } catch (e) {
      Alert.alert("Fetch failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setExpenseApiBusy(false);
    }
  }

  async function getExpensesHouse() {
    setExpenseApiBusy(true);
    try {
      const data = await apiGetWithBody("/expenses/house", {
        house_id: API_HOUSE_ID,
        get_urgent: expensesUrgentOnly,
      });
      setPreview("GET /expenses/house", extractDynamoItems(data));
    } catch (e) {
      Alert.alert("Fetch failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setExpenseApiBusy(false);
    }
  }

  async function getExpensesOwer() {
    setExpenseApiBusy(true);
    try {
      const data = await apiGetWithBody("/expenses/ower", {
        house_id: API_HOUSE_ID,
        user_id: API_USER_ID,
      });
      setPreview("GET /expenses/ower", extractDynamoItems(data));
    } catch (e) {
      Alert.alert("Fetch failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setExpenseApiBusy(false);
    }
  }

  async function getExpensesPayer() {
    setExpenseApiBusy(true);
    try {
      const data = await apiGetWithBody("/expenses/payer", {
        house_id: API_HOUSE_ID,
        user_id: API_USER_ID,
      });
      setPreview("GET /expenses/payer", extractDynamoItems(data));
    } catch (e) {
      Alert.alert("Fetch failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setExpenseApiBusy(false);
    }
  }

  async function simplifyExpensesHouse() {
    setExpenseApiBusy(true);
    try {
      const res = await apiPost("/expenses/simplify", {
        house_id: API_HOUSE_ID,
        creator: API_USER_ID,
      });
      setPreview("POST /expenses/simplify", res);
      Alert.alert("Simplified", "New consolidated expense created (see preview).");
    } catch (e) {
      Alert.alert("Simplify failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setExpenseApiBusy(false);
    }
  }

  async function updateExpenseApi() {
    const expense_id = updateExpenseId.trim();
    const name = updateExpenseName.trim();

    if (!expense_id || !name) {
      Alert.alert("PUT /expenses", "Enter expense_id and new name.");
      return;
    }

    setExpenseApiBusy(true);
    try {
      await apiPut("/expenses", { expense_id, name });
      Alert.alert("Updated", "Expense saved.");
    } catch (e) {
      Alert.alert("Update failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setExpenseApiBusy(false);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <View style={styles.backButtonInner}>
              <Text style={styles.backArrow}>←</Text>
            </View>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>Expenses</Text>
            <Text style={styles.headerSubtitle}>March 2026</Text>
          </View>

          <TouchableOpacity style={styles.notifButton}>
            <BellIcon size={22} color={COLORS.textDark} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.accentBar} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SplitTableCard members={splitMembers} />

          <Text style={styles.sectionTitle}>Recent Expenses</Text>

          {groupedExpenses.map((group) => (
            <ExpenseDateGroup key={group.date} group={group} />
          ))}

          <Text style={styles.sectionTitle}>Fetch / simplify / update</Text>
          <View style={styles.apiCard}>
            <Text style={styles.apiHint}>
              GET handlers use a JSON body (see apiGetWithBody). Preview is truncated.
            </Text>

            <TextInput
              style={styles.apiInput}
              value={expenseIdForGet}
              onChangeText={setExpenseIdForGet}
              placeholder="expense_id for GET /expense"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.apiSecondaryBtn}
              onPress={getExpenseOne}
              disabled={expenseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiSecondaryBtnText}>GET /expense</Text>
            </TouchableOpacity>

            <View style={styles.apiRowInline}>
              <Text style={styles.apiInlineLabel}>Urgent only (house query)</Text>
              <Switch
                value={expensesUrgentOnly}
                onValueChange={setExpensesUrgentOnly}
                trackColor={{ false: COLORS.border, true: `${COLORS.secondary}80` }}
              />
            </View>

            <TouchableOpacity
              style={styles.apiSecondaryBtn}
              onPress={getExpensesHouse}
              disabled={expenseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiSecondaryBtnText}>GET /expenses/house</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.apiSecondaryBtn}
              onPress={getExpensesOwer}
              disabled={expenseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiSecondaryBtnText}>GET /expenses/ower</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.apiSecondaryBtn}
              onPress={getExpensesPayer}
              disabled={expenseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiSecondaryBtnText}>GET /expenses/payer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.apiSimplifyBtn}
              onPress={simplifyExpensesHouse}
              disabled={expenseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiPrimaryBtnText}>POST /expenses/simplify</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.apiInput}
              value={updateExpenseId}
              onChangeText={setUpdateExpenseId}
              placeholder="expense_id for PUT /expenses"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.apiInput}
              value={updateExpenseName}
              onChangeText={setUpdateExpenseName}
              placeholder="New name"
              placeholderTextColor={COLORS.textMuted}
            />

            <TouchableOpacity
              style={styles.apiPrimaryBtn}
              onPress={updateExpenseApi}
              disabled={expenseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiPrimaryBtnText}>PUT /expenses</Text>
            </TouchableOpacity>

            <ScrollView
              style={styles.apiPreviewScroll}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.apiPreviewText} selectable>
                {expenseFetchPreview || "—"}
              </Text>
            </ScrollView>
          </View>

          <Text style={styles.sectionTitle}>Expenses API</Text>
          <View style={styles.apiCard}>
            <Text style={styles.apiHint}>POST /expenses and DELETE /expenses (ids from apiConfig)</Text>

            <TextInput
              style={styles.apiInput}
              value={expenseName}
              onChangeText={setExpenseName}
              placeholder="Name"
              placeholderTextColor={COLORS.textMuted}
            />

            <TextInput
              style={styles.apiInput}
              value={expensePrice}
              onChangeText={setExpensePrice}
              placeholder="Price"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
            />

            <TextInput
              style={styles.apiInput}
              value={expenseDue}
              onChangeText={setExpenseDue}
              placeholder="Due date YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.apiPrimaryBtn}
              onPress={createExpenseApi}
              disabled={expenseApiBusy}
              activeOpacity={0.85}
            >
              {expenseApiBusy ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.apiPrimaryBtnText}>Create expense</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.apiInput}
              value={expenseIdToDelete}
              onChangeText={setExpenseIdToDelete}
              placeholder="expense_id to delete"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.apiDangerBtn}
              onPress={deleteExpenseApi}
              disabled={expenseApiBusy}
              activeOpacity={0.85}
            >
              <Text style={styles.apiPrimaryBtnText}>Delete expense</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <TouchableOpacity style={styles.splitMoneyButton} onPress={handleSplitMoney} activeOpacity={0.85}>
          <View style={styles.splitMoneyIconCircle}>
            <Text style={styles.splitMoneyIconText}>$</Text>
          </View>
          <Text style={styles.splitMoneyText}>Split Money</Text>
        </TouchableOpacity>

        <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  backButton: {},
  backButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  backArrow: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 1,
  },
  notifButton: {
    position: "relative",
    padding: 4,
  },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
  },

  accentBar: {
    height: 3,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 4,
  },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textDark,
    letterSpacing: -0.2,
    marginBottom: 12,
    marginTop: 4,
  },

  apiCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(103, 141, 88, 0.12)",
    gap: 10,
  },
  apiHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  apiInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
  },
  apiPrimaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  apiDangerBtn: {
    backgroundColor: "#B0524A",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  apiPrimaryBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 15,
  },
  apiSecondaryBtn: {
    backgroundColor: `${COLORS.secondary}30`,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  apiSecondaryBtnText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  apiSimplifyBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  apiRowInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  apiInlineLabel: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: "600",
  },
  apiPreviewScroll: {
    maxHeight: 180,
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  apiPreviewText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: COLORS.textDark,
  },

  splitCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(103, 141, 88, 0.12)",
    shadowColor: "#2C3A22",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  splitCardHeader: {
    marginBottom: 16,
  },
  splitTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  splitSummaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  splitSummaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  splitSummaryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  membersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  memberItem: {
    alignItems: "center",
    gap: 4,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  statusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.white,
  },
  memberName: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  memberAmount: {
    fontSize: 12,
    fontWeight: "700",
  },

  dateGroup: { marginBottom: 18 },
  dateHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  dateTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textDark,
  },

  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(103, 141, 88, 0.08)",
    shadowColor: "#2C3A22",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  expenseIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: `${COLORS.secondary}30`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  expenseIconImage: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  expenseInfo: { flex: 1 },
  expenseDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  expenseDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  expenseAmountBox: {
    backgroundColor: `${COLORS.primary}12`,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  splitMoneyButton: {
    position: "absolute",
    bottom: 82,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 18,
    paddingLeft: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  splitMoneyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  splitMoneyIconText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.accent,
  },
  splitMoneyText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    padding: 8,
    alignItems: "center",
    position: "relative",
  },
  tabItemActive: {},
  tabActiveIndicator: {
    position: "absolute",
    top: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  tabIcon: { fontSize: 22 },
});