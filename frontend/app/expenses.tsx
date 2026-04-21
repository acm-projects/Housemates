import * as React from "react";
import { apiGetWithBody, extractDynamoItems } from "@/utils/api";
import { API_HOUSE_ID, API_USER_ID } from "./apiConfig";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { GradientBackground } from "./gradientBg";
import { AppBottomNav } from "./AppBottomNav";
import { GlassCard, GLASS_COLORS } from "@/components/glass-ui";
import { FONTS, PALETTE } from "./fonts";

const AVATAR_BG = ["#c9b8e8", "#1a1a3a", "#2a1a2e", "#e8c4a0"];
function Avatar({ size = 52, idx = 0 }: { size?: number; idx?: number }) {
  return (
    <View
      style={[
        av.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: AVATAR_BG[idx % AVATAR_BG.length],
        },
      ]}
    >
      <View
        style={[
          av.head,
          {
            width: size * 0.38,
            height: size * 0.38,
            borderRadius: size * 0.19,
          },
        ]}
      />
      <View
        style={[
          av.body,
          {
            width: size * 0.62,
            height: size * 0.38,
            borderRadius: size * 0.19,
          },
        ]}
      />
    </View>
  );
}
const av = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    position: "relative",
  },
  head: {
    backgroundColor: "rgba(255,255,255,0.35)",
    position: "absolute",
    top: "18%",
  },
  body: {
    backgroundColor: "rgba(255,255,255,0.35)",
    position: "absolute",
    bottom: 0,
  },
});

// --- API types (from stash) ---
type ApiExpense = {
  expense_id: string;
  name: string;
  price: number;
  add_date?: string;
  due_date?: string;
  is_urgent?: boolean;
  payers?: string[];
  owers?: string[];
};
type ApiUser = { user_id: string; name: string };

// --- UI types ---
type SplitMember = { id: string; name: string; amount: number };
type Expense = {
  id: string;
  amount: number;
  description: string;
  sub: string;
  colorIdx: number;
};
type DateGroup = { date: string; expenses: Expense[] };

// --- Data helpers (from stash) ---
function isoToLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function groupByAddDate(expenses: ApiExpense[]): DateGroup[] {
  const map = new Map<string, Expense[]>();
  const sorted = [...expenses].sort((a, b) =>
    (b.add_date ?? "").localeCompare(a.add_date ?? ""),
  );
  sorted.forEach((e, i) => {
    const label = e.add_date ? isoToLabel(e.add_date) : "Unknown date";
    const key = (e.add_date ?? "unknown").slice(0, 10);
    const mapKey = `${label}||${key}`;
    if (!map.has(mapKey)) map.set(mapKey, []);
    map.get(mapKey)!.push({
      id: e.expense_id,
      amount: typeof e.price === "number" ? e.price : Number(e.price) || 0,
      description: e.name ?? "Untitled",
      sub: e.is_urgent
        ? "Urgent"
        : e.due_date
          ? `Due ${isoToLabel(e.due_date)}`
          : "Shared equally",
      colorIdx: i,
    });
  });
  return Array.from(map.entries()).map(([key, exps]) => ({
    date: key.split("||")[0],
    expenses: exps,
  }));
}

function computeBalances(
  expenses: ApiExpense[],
  users: ApiUser[],
): SplitMember[] {
  const net = new Map<string, number>();
  for (const u of users) net.set(u.user_id, 0);
  if (!net.has(API_USER_ID)) net.set(API_USER_ID, 0);
  for (const e of expenses) {
    const price = typeof e.price === "number" ? e.price : Number(e.price) || 0;
    const payers = Array.isArray(e.payers) ? e.payers : [];
    const owers = Array.isArray(e.owers) ? e.owers : [];
    const perOwer = owers.length > 0 ? price / owers.length : 0;
    const perPayer = payers.length > 0 ? price / payers.length : 0;
    for (const o of owers) net.set(o, (net.get(o) ?? 0) - perOwer);
    for (const p of payers) net.set(p, (net.get(p) ?? 0) + perPayer);
  }
  const result: SplitMember[] = [
    { id: API_USER_ID, name: "You", amount: net.get(API_USER_ID) ?? 0 },
  ];
  for (const u of users) {
    if (u.user_id === API_USER_ID) continue;
    result.push({
      id: u.user_id,
      name: u.name,
      amount: net.get(u.user_id) ?? 0,
    });
  }
  return result;
}

export default function ExpensesScreen({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [members, setMembers] = React.useState<SplitMember[]>([]);
  const [dateGroups, setDateGroups] = React.useState<DateGroup[]>([]);

  async function loadData() {
    try {
      const [expenseData, userData] = await Promise.all([
        apiGetWithBody("/expenses/house", { house_id: API_HOUSE_ID }),
        apiGetWithBody("/users/house", { house_id: API_HOUSE_ID }),
      ]);
      const expenses = extractDynamoItems(expenseData) as ApiExpense[];
      const users = extractDynamoItems(userData) as ApiUser[];
      setMembers(computeBalances(expenses, users));
      setDateGroups(groupByAddDate(expenses));
    } catch {
      /* show empty state */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);
  function onRefresh() {
    setRefreshing(true);
    loadData();
  }

  return (
    <GradientBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.topRow}>
          <Pressable
            style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
            onPress={() => {
              if (onBack) onBack();
              else router.back();
            }}
          >
            <Ionicons name="chevron-back" size={22} color={PALETTE.textDark} />
          </Pressable>
          <Text style={s.title}>Expenses</Text>
          <Pressable style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}>
            <Ionicons name="notifications" size={22} color={PALETTE.textDark} />
            <View style={s.dot} />
          </Pressable>
        </View>

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={PALETTE.active} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={PALETTE.active}
              />
            }
          >
            {/* Split Table — GlassCard */}
            {members.length > 0 && (
              <GlassCard style={s.splitCard}>
                <Text style={s.splitTitle}>Split Table</Text>
                <View style={s.membersRow}>
                  {members.map((m, i) => {
                    const pos = m.amount >= 0;
                    return (
                      <View key={m.id} style={s.memberCol}>
                        <View style={s.avatarWrap}>
                          <Avatar size={52} idx={i} />
                          <View
                            style={[
                              s.badge,
                              {
                                backgroundColor: pos
                                  ? PALETTE.active
                                  : "#ADB6C4",
                              },
                            ]}
                          >
                            <Text style={s.badgeText}>{pos ? "↑" : "↓"}</Text>
                          </View>
                        </View>
                        <Text style={s.memberName} numberOfLines={1}>
                          {m.name}
                        </Text>
                        <Text
                          style={[
                            s.memberAmt,
                            { color: pos ? PALETTE.active : "#ADB6C4" },
                          ]}
                        >
                          {pos
                            ? `+$${m.amount.toFixed(0)}`
                            : `-$${Math.abs(m.amount).toFixed(0)}`}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </GlassCard>
            )}

            {/* Expense groups */}
            {dateGroups.length === 0 ? (
              <View style={s.emptyWrap}>
                <Text style={s.emptyText}>No expenses yet</Text>
                <Text style={s.emptyHint}>Tap Split Money to add one</Text>
              </View>
            ) : (
              dateGroups.map((group) => (
                <View key={group.date} style={s.dateGroup}>
                  <Text style={s.dateHeader}>{group.date}</Text>
                  {group.expenses.map((exp) => (
                    <GlassCard key={exp.id} style={s.expCard}>
                      <View style={s.expIconBox}>
                        <Avatar size={38} idx={exp.colorIdx} />
                      </View>
                      <View style={s.expInfo}>
                        <Text style={s.expAmt}>${exp.amount.toFixed(2)}</Text>
                        <Text style={s.expDesc}>{exp.description}</Text>
                        <Text style={s.expSub}>{exp.sub}</Text>
                      </View>
                    </GlassCard>
                  ))}
                </View>
              ))
            )}
            <View style={{ height: 130 }} />
          </ScrollView>
        )}

        {/* Rectangular Split Money FAB */}
        <Pressable
          style={({ pressed }) => [s.fab, pressed && s.fabPressed]}
          onPress={() => router.push("/splitMoney")}
        >
          <View style={s.fabIcon}>
            <Text style={s.fabIconText}>$</Text>
          </View>
          <Text style={s.fabText}>Split Money</Text>
        </Pressable>
        <AppBottomNav />
      </SafeAreaView>
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.active,
    borderWidth: 1,
    borderColor: "#fff",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    color: PALETTE.textDark,
    fontFamily: FONTS.title,
  },
  pressed: { opacity: 0.6 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  splitCard: { padding: 20, marginBottom: 20 },
  splitTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: PALETTE.textDark,
    marginBottom: 16,
    fontFamily: FONTS.title,
  },
  membersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 12,
  },
  memberCol: { alignItems: "center", gap: 4 },
  avatarWrap: { position: "relative", marginBottom: 2 },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  memberName: {
    fontSize: 11,
    fontWeight: "600",
    color: PALETTE.textMuted,
    maxWidth: 60,
  },
  memberAmt: { fontSize: 13, fontWeight: "700", fontFamily: FONTS.body },
  emptyWrap: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700", color: PALETTE.textMuted },
  emptyHint: { fontSize: 13, color: PALETTE.textMuted, opacity: 0.6 },
  dateGroup: { marginBottom: 8 },
  dateHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: PALETTE.textDark,
    marginBottom: 10,
    paddingHorizontal: 4,
    fontFamily: FONTS.title,
  },
  expCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 8,
  },
  expIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 14,
    overflow: "hidden",
  },
  expInfo: { flex: 1 },
  expAmt: {
    fontSize: 16,
    fontWeight: "700",
    color: PALETTE.textDark,
    marginBottom: 2,
    fontFamily: FONTS.titleReg,
  },
  expDesc: { fontSize: 13, color: PALETTE.textMuted, fontFamily: FONTS.body },
  expSub: {
    fontSize: 11,
    color: PALETTE.textMuted,
    opacity: 0.7,
    marginTop: 2,
    fontFamily: FONTS.body,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 82,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(236,133,117,0.90)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    paddingLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fabIconText: { fontSize: 18, fontWeight: "800", color: "#fff" },
  fabPressed: { backgroundColor: PALETTE.activeDark },
  fabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    fontFamily: FONTS.body,
  },
});
