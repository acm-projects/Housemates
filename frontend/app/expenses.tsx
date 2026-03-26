import * as React from "react";
import { apiPost } from "@/utils/api";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  HomeIcon,
  ChecklistIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ExpensesIcon,
  BellIcon
} from './icons';
import { useRouter } from 'expo-router';

export const COLORS = {
  bg: '#FDFDFF',
  cardBg: '#F2F5FA',
  primary: '#0A2239',
  secondary: '#176087',
  accent: '#ADB6C4',
  textDark: '#132E32',
  textMuted: '#98AAC5',
  border: '#3590F3',
  borderFocus: '#ADB6C4',
  white: '#FFFFFF',
}

// --- Types ---
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

// --- Sample Data ---
const splitMembers: SplitMember[] = [
  { id: '1', name: 'You', avatar: 'https://i.pravatar.cc/80?img=1', amount: -99.0 },
  { id: '2', name: 'Blake', avatar: 'https://i.pravatar.cc/80?img=2', amount: 23.0 },
  { id: '3', name: 'Sam', avatar: 'https://i.pravatar.cc/80?img=3', amount: -99.0 },
  { id: '4', name: 'Alex', avatar: 'https://i.pravatar.cc/80?img=4', amount: -99.0 },
];

const groupedExpenses: GroupedExpenses[] = [
  {
    date: 'February 16, 2026',
    expenses: [
      { id: '1', icon: 'https://i.pravatar.cc/40?img=10', amount: 31.0, description: 'Grocery Run' },
      { id: '2', icon: 'https://i.pravatar.cc/40?img=11', amount: 18.5, description: 'Streaming Service' },
    ],
  },
  {
    date: 'February 14, 2026',
    expenses: [
      { id: '3', icon: 'https://i.pravatar.cc/40?img=12', amount: 62.0, description: 'Electricity Bill' },
      { id: '4', icon: 'https://i.pravatar.cc/40?img=13', amount: 14.0, description: 'Cleaning Supplies' },
    ],
  },
];

// --- Components ---
async function addExpense(data: { amount: number; description: string }) {
  try {
    const result = await apiPost("/expenses/add", data);
    console.log(result);
  } catch (err) {
    console.error("Error adding expense:", err);
  }
}

function SplitTableCard({ members }: { members: SplitMember[] }) {
  const totalOwed = members.filter(m => m.amount > 0).reduce((a, m) => a + m.amount, 0);

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
                  <Text style={styles.statusBadgeText}>{isPositive ? '↑' : '↓'}</Text>
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

// --- Tab Bar ---
type TabItem = { id: string; icon: React.ReactNode };
const tabs: TabItem[] = [
  { id: 'list', icon: <ChecklistIcon size={24} color={COLORS.primary} /> },
  { id: 'wallet', icon: <ShoppingBagIcon size={24} color={COLORS.primary} /> },
  { id: 'home', icon: <HomeIcon size={24} color={COLORS.primary} /> },
  { id: 'calendar', icon: <CalendarIcon size={24} color={COLORS.primary} /> },
  { id: 'flag', icon: <ExpensesIcon size={24} color={COLORS.primary} /> },
];

function BottomTabBar({ activeTab, onTabPress }: { activeTab: string; onTabPress: (id: string) => void }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
          onPress={() => onTabPress(tab.id)}
        >
          {activeTab === tab.id && <View style={styles.tabActiveIndicator} />}
          <Text style={styles.tabIcon}>{tab.icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --- Main Screen ---
export default function ExpensesScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('flag');

  const handleSplitMoney = () => {
    router.push('/splitMoney');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
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

      {/* Content */}
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

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Split Money FAB */}
      <TouchableOpacity style={styles.splitMoneyButton} onPress={handleSplitMoney} activeOpacity={0.85}>
        <View style={styles.splitMoneyIconCircle}>
          <Text style={styles.splitMoneyIconText}>$</Text>
        </View>
        <Text style={styles.splitMoneyText}>Split Money</Text>
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}


// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  backArrow: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },
  notifButton: {
    position: 'relative',
    padding: 4,
  },
  notifDot: {
    position: 'absolute',
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

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.2,
    marginBottom: 12,
    marginTop: 4,
  },

  // Split Table Card
  splitCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(103, 141, 88, 0.12)',
    shadowColor: '#2C3A22',
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
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  splitSummaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  splitSummaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  memberItem: {
    alignItems: 'center',
    gap: 4,
  },
  avatarWrapper: {
    position: 'relative',
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
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  memberName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  memberAmount: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Date Groups
  dateGroup: { marginBottom: 18 },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  dateTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // Expense Item
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(103, 141, 88, 0.08)',
    shadowColor: '#2C3A22',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  expenseIconImage: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  expenseInfo: { flex: 1 },
  expenseDescription: {
    fontSize: 15,
    fontWeight: '600',
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
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Split Money FAB
  splitMoneyButton: {
    position: 'absolute',
    bottom: 82,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  splitMoneyIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.accent,
  },
  splitMoneyText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {},
  tabActiveIndicator: {
    position: 'absolute',
    top: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  tabIcon: { fontSize: 22 },
});
