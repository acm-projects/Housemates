import * as React from "react";
import { useState } from "react";
import { apiPost } from "@/utils/api";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import {
  HomeIcon,
  ChecklistIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ExpensesIcon,
  AddToCalendarIcon,
  CashIcon,
  VenmoIcon,
  ZelleIcon
} from './icons';

// --- Types ---
type SplitOption = 'you_owe' | 'they_owe' | 'split';
type LoanType = 'cash loan' | 'venmo' | 'zelle';

// --- API ---
async function splitMoney(data: { amount: number; users: string[] }) {
  try {
    const result = await apiPost("/money/split", data);
    console.log(result);
  } catch (err) {
    console.error("Error splitting money:", err);
  }
}

// --- Components ---
function AddBillCard({
  friendName, setFriendName,
  loanType, setLoanType,
  amount, setAmount,
  showLoanDropdown, setShowLoanDropdown,
  focusedField, setFocusedField,
}: {
  friendName: string; setFriendName: (v: string) => void;
  loanType: LoanType; setLoanType: (v: LoanType) => void;
  amount: string; setAmount: (v: string) => void;
  showLoanDropdown: boolean; setShowLoanDropdown: (v: boolean) => void;
  focusedField: string | null; setFocusedField: (v: string | null) => void;
}) {
  const loanOptions: LoanType[] = ['cash loan', 'venmo', 'zelle'];
  const loanIconComponents: Record<LoanType, React.ReactNode> = {
    'cash loan': <CashIcon  size={16} color={COLORS.primary} />,
    'venmo':     <VenmoIcon size={16} color={COLORS.primary} />,
    'zelle':     <ZelleIcon size={16} color={COLORS.primary} />,
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionLabel}>NEW BILL</Text>

      {/* Friend name */}
      <View style={[styles.inputContainer, focusedField === 'friend' && styles.inputContainerFocused]}>
        <Text style={styles.inputLabel}>With</Text>
        <TextInput
          style={styles.input}
                cursorColor={COLORS.primary}
                selectionColor={`${COLORS.primary}40`}
          value={friendName}
          onChangeText={setFriendName}
          placeholder="Housemate's name"
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setFocusedField('friend')}
          onBlur={() => setFocusedField(null)}
        />
      </View>

      {/* Loan type + amount row */}
      <View style={styles.twoColRow}>
        <View style={styles.twoColLeft}>
          <TouchableOpacity
            style={[styles.inputContainer, styles.inputContainerDropdown, focusedField === 'loan' && styles.inputContainerFocused]}
            onPress={() => setShowLoanDropdown(!showLoanDropdown)}
            activeOpacity={0.8}
          >
            <Text style={styles.inputLabel}>Payment via</Text>
            <View style={styles.dropdownTrigger}>
              <View style={styles.dropdownValueRow}>
                {loanIconComponents[loanType]}
                <Text style={styles.dropdownValue}>{loanType}</Text>
              </View>
              <Text style={[styles.dropdownArrow, showLoanDropdown && styles.dropdownArrowOpen]}>⌄</Text>
            </View>
          </TouchableOpacity>

          {showLoanDropdown && (
            <View style={styles.dropdownMenu}>
              {loanOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.dropdownOption, option === loanType && styles.dropdownOptionActive]}
                  onPress={() => { setLoanType(option); setShowLoanDropdown(false); }}
                >
                  <View style={styles.dropdownOptionRow}>
                    {loanIconComponents[option]}
                    <Text style={[styles.dropdownOptionText, option === loanType && styles.dropdownOptionTextActive]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.twoColRight}>
          <View style={[styles.inputContainer, focusedField === 'amount' && styles.inputContainerFocused]}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySign}>$</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                cursorColor={COLORS.primary}
                selectionColor={`${COLORS.primary}40`}
                onFocus={() => setFocusedField('amount')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Summary */}
      {(friendName || amount) ? (
        <View style={styles.summaryBubble}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryName}>{friendName || 'Your housemate'}</Text>
            {' owes you '}
            <Text style={styles.summaryAmount}>${amount || '0.00'}</Text>
            {' via '}
            <Text style={styles.summaryName}>{loanType}</Text>
          </Text>
        </View>
      ) : null}

      {/* Add date */}
      <TouchableOpacity style={styles.addDateButton}>
        <AddToCalendarIcon size={16} color={COLORS.textDark} />
        <Text style={styles.addDateText}>Add a date (optional)</Text>
      </TouchableOpacity>
    </View>
  );
}

function SplitOptionsCard({
  friendName, amount, selectedOption, onSelectOption,
}: {
  friendName: string; amount: string;
  selectedOption: SplitOption | null; onSelectOption: (option: SplitOption) => void;
}) {
  const displayName = friendName || 'your housemate';
  const displayAmount = amount || '0.00';

  const options: { key: SplitOption; label: string; icon: string; desc: string }[] = [
    { key: 'you_owe', label: `You owe ${displayName}`, icon: '↑', desc: `$${displayAmount}` },
    { key: 'they_owe', label: `${displayName} owes you`, icon: '↓', desc: `$${displayAmount}` },
    { key: 'split', label: 'Split the bill', icon: '⇄', desc: `$${(parseFloat(displayAmount || '0') / 2).toFixed(2)} each` },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionLabel}>HOW TO SPLIT</Text>
      <View style={styles.splitOptionsGrid}>
        {options.map((option) => {
          const isActive = selectedOption === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.splitOptionCard, isActive && styles.splitOptionCardActive]}
              onPress={() => onSelectOption(option.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.splitOptionIcon, isActive && styles.splitOptionIconActive]}>
                <Text style={[styles.splitOptionIconText, isActive && styles.splitOptionIconTextActive]}>{option.icon}</Text>
              </View>
              <Text style={[styles.splitOptionLabel, isActive && styles.splitOptionLabelActive]}>{option.label}</Text>
              <Text style={[styles.splitOptionDesc, isActive && styles.splitOptionDescActive]}>{option.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// --- Tab Bar ---
type TabItem = { id: string; icon: React.ReactNode };
const tabs: TabItem[] = [
  { id: 'list', icon: <ChecklistIcon size={24} color="#678D58" /> },
  { id: 'wallet', icon: <ShoppingBagIcon size={24} color="#678D58" /> },
  { id: 'home', icon: <HomeIcon size={24} color="#678D58" /> },
  { id: 'calendar', icon: <CalendarIcon size={24} color="#678D58" /> },
  { id: 'flag', icon: <ExpensesIcon size={24} color="#678D58" /> },
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
export default function SplitMoneyScreen({
  onBack,
  onDone,
}: {
  onBack?: () => void;
  onDone?: (data: { friendName: string; loanType: LoanType; amount: string; splitOption: SplitOption | null }) => void;
}) {
  const [activeTab, setActiveTab] = useState('home');
  const [friendName, setFriendName] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('cash loan');
  const [amount, setAmount] = useState('');
  const [showLoanDropdown, setShowLoanDropdown] = useState(false);
  const [selectedSplitOption, setSelectedSplitOption] = useState<SplitOption | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleDone = () => {
    splitMoney({ amount: parseFloat(amount || '0'), users: [friendName] });
    onDone?.({ friendName, loanType, amount, splitOption: selectedSplitOption });
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
          <Text style={styles.headerTitle}>Split Money</Text>
          <Text style={styles.headerSubtitle}>Settle up with your house</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.accentBar} />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AddBillCard
          friendName={friendName} setFriendName={setFriendName}
          loanType={loanType} setLoanType={setLoanType}
          amount={amount} setAmount={setAmount}
          showLoanDropdown={showLoanDropdown} setShowLoanDropdown={setShowLoanDropdown}
          focusedField={focusedField} setFocusedField={setFocusedField}
        />

        <SplitOptionsCard
          friendName={friendName} amount={amount}
          selectedOption={selectedSplitOption}
          onSelectOption={setSelectedSplitOption}
        />

        {/* Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.85}>
          <Text style={styles.doneButtonText}>Confirm & Save</Text>
          <Text style={styles.doneButtonArrow}>✓</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

// --- Colors ---
const COLORS = {
  bg: '#FDFDFF',
  cardBg: '#D1DAE6', 
  primary: '#0A2239',
  secondary: '#176087',
  accent: '#0A2239',
  textDark: '#132E32',
  textMuted: '#98AAC5',
  border: '#3590F3',
  borderFocus: '#ADB6C4',
  stepInactive: '#ADB6C4',
  white: '#FFFFFF',

};


// --- Styles ---
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
    paddingTop: 20,
  },

  // Card
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#2C3A22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(103, 141, 88, 0.1)',
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 14,
  },

  // Input
  inputContainer: {
    backgroundColor: '#FAFAF7',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  inputContainerDropdown: {
    marginBottom: 0,
  },
  inputContainerFocused: {
    borderColor: COLORS.borderFocus,
    backgroundColor: '#F2FAF0',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
    paddingVertical: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySign: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
  },

  // Two col
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  twoColLeft: { flex: 1.2 },
  twoColRight: { flex: 1 },

  // Dropdown
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  dropdownArrow: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  dropdownArrowOpen: {
    color: COLORS.primary,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#2C3A22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  dropdownOption: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownOptionActive: {
    backgroundColor: `${COLORS.primary}12`,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  dropdownOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Summary
  summaryBubble: {
    backgroundColor: `${COLORS.secondary}30`,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}60`,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryName: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryAmount: {
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Add Date
  addDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  addDateText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Split Options
  splitOptionsGrid: {
    gap: 10,
  },
  splitOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF7',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  splitOptionCardActive: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },
  splitOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitOptionIconActive: {
    backgroundColor: COLORS.primary,
  },
  splitOptionIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  splitOptionIconTextActive: {
    color: COLORS.white,
  },
  splitOptionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  splitOptionLabelActive: {
    color: COLORS.primary,
  },
  splitOptionDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  splitOptionDescActive: {
    color: COLORS.primary,
  },

  // Done button
  doneButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 4,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  doneButtonArrow: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
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