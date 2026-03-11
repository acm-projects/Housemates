import * as React from "react";
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
  ExpensesIcon 
} from './icons';
// --- Types ---
type SplitMember = {
  id: string;
  name: string;
  avatar: string; // uri or require()
  amount: number; // negative = owes, positive = owed
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
      { id: '1', icon: 'https://i.pravatar.cc/40?img=10', amount: 31.0, description: 'Nuclear Bomb!' },
      { id: '2', icon: 'https://i.pravatar.cc/40?img=10', amount: 31.0, description: 'Nuclear Bomb!' },
    ],
  },
  {
    date: 'February 14, 2026',
    expenses: [
      { id: '3', icon: 'https://i.pravatar.cc/40?img=10', amount: 31.0, description: 'Nuclear Bomb!' },
      { id: '4', icon: 'https://i.pravatar.cc/40?img=10', amount: 31.0, description: 'Nuclear Bomb!' },
    ],
  },
];

// --- Components ---

function SplitTableCard({ members }: { members: SplitMember[] }) {
  return (
    <View style={styles.splitCard}>
      <Text style={styles.splitTitle}>Split Table</Text>
      <View style={styles.membersRow}>
        {members.map((member) => (
          <View key={member.id} style={styles.memberItem}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: member.avatar }} style={styles.avatar} />
              <View
                style={[
                  styles.arrowBadge,
                  { backgroundColor: member.amount >= 0 ? '#D4E89C' : '#F5B0B0' },
                ]}
              >
                <Text style={styles.arrowText}>{member.amount >= 0 ? '↑' : '↓'}</Text>
              </View>
            </View>
            <Text
              style={[
                styles.memberAmount,
                { color: member.amount >= 0 ? '#A8D5A2' : '#F5B0B0' },
              ]}
            >
              {member.amount >= 0 ? `$${member.amount.toFixed(2)}` : `-$${Math.abs(member.amount).toFixed(2)}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ExpenseItem({ expense }: { expense: Expense }) {
  return (
    <View style={styles.expenseItem}>
      <View style={styles.expenseIcon}>
        <Image source={{ uri: expense.icon }} style={styles.expenseIconImage} />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
        <Text style={styles.expenseDescription}>{expense.description}</Text>
      </View>
    </View>
  );
}

function ExpenseDateGroup({ group }: { group: GroupedExpenses }) {
  return (
    <View style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{group.date}</Text>
      {group.expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </View>
  );
}

type TabItem = {
  id: string;
  icon: string;
};

const tabs: TabItem[] = [
  { id: 'list', icon: <ChecklistIcon size={24} color="#2D2D4E" /> },
  { id: 'wallet', icon: <ShoppingBagIcon size={24} color="#2D2D4E" /> },
  { id: 'home', icon: <HomeIcon size={24} color="#2D2D4E" /> },
  { id: 'calendar', icon: <CalendarIcon size={24} color="#2D2D4E" /> },
  { id: 'flag', icon: <ExpensesIcon size={24} color="#2D2D4E" /> },
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
          <Text style={styles.tabIcon}>{tab.icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --- Main Screen ---

export default function ExpensesScreen({
  onBack,
  onSplitMoney,
}: {
  onBack?: () => void;
  onSplitMoney?: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState('home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{'◀︎-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SplitTableCard members={splitMembers} />

        {groupedExpenses.map((group) => (
          <ExpenseDateGroup key={group.date} group={group} />
        ))}

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Split Money FAB */}
      <TouchableOpacity style={styles.splitMoneyButton} onPress={onSplitMoney}>
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
const COLORS = {
  bg: '#E8E8F0',
  cardBg: '#C5C5D8',
  expenseBg: '#CBCBE6',
  primary: '#6B6B9E',
  textDark: '#2D2D4E',
  textMuted: '#6B6B8D',
  white: '#FFFFFF',
  border: '#5A5A8A',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.textDark,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  bellButton: {
    padding: 4,
  },
  bellIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Split Table Card
  splitCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  splitTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
    fontFamily: 'serif',
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  memberItem: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  arrowBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  memberAmount: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Date Groups
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 12,
    fontFamily: 'serif',
  },

  // Expense Item
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.expenseBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  expenseIconImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  expenseDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Split Money FAB
  splitMoneyButton: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingLeft: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
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
    fontWeight: '700',
    color: COLORS.primary,
  },
  splitMoneyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Bottom Tab Bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: {
    padding: 8,
  },
  tabItemActive: {
    opacity: 1,
  },
  tabIcon: {
    fontSize: 22,
  },
});