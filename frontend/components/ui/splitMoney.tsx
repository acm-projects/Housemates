import * as React from "react";
import { useState } from "react";
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

// --- Types ---
type SplitOption = 'you_owe' | 'they_owe' | 'split';
type LoanType = 'cash loan' | 'venmo' | 'zelle';

// --- Components ---

function AddBillCard({
  friendName,
  setFriendName,
  loanType,
  setLoanType,
  amount,
  setAmount,
  showLoanDropdown,
  setShowLoanDropdown,
}: {
  friendName: string;
  setFriendName: (v: string) => void;
  loanType: LoanType;
  setLoanType: (v: LoanType) => void;
  amount: string;
  setAmount: (v: string) => void;
  showLoanDropdown: boolean;
  setShowLoanDropdown: (v: boolean) => void;
}) {
  const loanOptions: LoanType[] = ['cash loan', 'venmo', 'zelle'];

  return (
    <View style={styles.addBillCard}>
      <Text style={styles.addBillTitle}>Add a bill:</Text>

      {/* With you and ___ */}
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>with you and </Text>
        <TextInput
          style={styles.friendInput}
          value={friendName}
          onChangeText={setFriendName}
          placeholder="_ _ _ _ _"
          placeholderTextColor="#6B6B8D"
          underlineColorAndroid="transparent"
        />
      </View>

      {/* Loan type + amount */}
      <View style={styles.fieldRow}>
        <TouchableOpacity
          style={styles.loanDropdown}
          onPress={() => setShowLoanDropdown(!showLoanDropdown)}
        >
          <Text style={styles.loanDropdownText}>{loanType}</Text>
          <Text style={styles.dropdownArrow}>{'∨'}</Text>
        </TouchableOpacity>
        <View style={styles.amountBubble}>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="00.00"
            placeholderTextColor="#6B6B8D"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Dropdown menu */}
      {showLoanDropdown && (
        <View style={styles.dropdownMenu}>
          {loanOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownOption}
              onPress={() => {
                setLoanType(option);
                setShowLoanDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  option === loanType && styles.dropdownOptionActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Summary line */}
      <View style={styles.summaryBubble}>
        <Text style={styles.summaryText}>
          {friendName || 'blake'} owes you ${amount || '5.00'}
        </Text>
      </View>

      {/* Add date */}
      <TouchableOpacity style={styles.addDateButton}>
        <Text style={styles.addDateText}>Add date</Text>
      </TouchableOpacity>
    </View>
  );
}

function SplitOptionsCard({
  friendName,
  amount,
  selectedOption,
  onSelectOption,
}: {
  friendName: string;
  amount: string;
  selectedOption: SplitOption | null;
  onSelectOption: (option: SplitOption) => void;
}) {
  const displayName = friendName || 'blake';
  const displayAmount = amount || '5.00';

  const options: { key: SplitOption; label: string }[] = [
    { key: 'you_owe', label: `you owe ${displayName} $${displayAmount}` },
    { key: 'they_owe', label: `${displayName} owes you $${displayAmount}` },
    { key: 'split', label: 'split the bill' },
  ];

  return (
    <View style={styles.splitOptionsCard}>
      <Text style={styles.splitOptionsTitle}>choose how to split the bill:</Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.splitOptionButton,
            selectedOption === option.key && styles.splitOptionButtonActive,
          ]}
          onPress={() => onSelectOption(option.key)}
        >
          <Text
            style={[
              styles.splitOptionText,
              selectedOption === option.key && styles.splitOptionTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --- Tab Bar (reused) ---
type TabItem = {
  id: string;
  icon: string;
};

const tabs: TabItem[] = [
  { id: 'list', icon: '☰' },
  { id: 'wallet', icon: '👜' },
  { id: 'home', icon: '🏠' },
  { id: 'calendar', icon: '📅' },
  { id: 'flag', icon: '🚩' },
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
          style={styles.tabItem}
          onPress={() => onTabPress(tab.id)}
        >
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
  onDone?: (data: {
    friendName: string;
    loanType: LoanType;
    amount: string;
    splitOption: SplitOption | null;
  }) => void;
}) {
  const [activeTab, setActiveTab] = useState('home');
  const [friendName, setFriendName] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('cash loan');
  const [amount, setAmount] = useState('');
  const [showLoanDropdown, setShowLoanDropdown] = useState(false);
  const [selectedSplitOption, setSelectedSplitOption] = useState<SplitOption | null>(null);

  const handleDone = () => {
    onDone?.({
      friendName,
      loanType,
      amount,
      splitOption: selectedSplitOption,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{'◀︎-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Split Money</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AddBillCard
          friendName={friendName}
          setFriendName={setFriendName}
          loanType={loanType}
          setLoanType={setLoanType}
          amount={amount}
          setAmount={setAmount}
          showLoanDropdown={showLoanDropdown}
          setShowLoanDropdown={setShowLoanDropdown}
        />

        <SplitOptionsCard
          friendName={friendName}
          amount={amount}
          selectedOption={selectedSplitOption}
          onSelectOption={setSelectedSplitOption}
        />

        {/* Done Button */}
        <View style={styles.doneContainer}>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

// --- Styles ---
const COLORS = {
  bg: '#E8E8F0',
  cardBg: '#CBCBE6',
  optionBg: '#B8B8D8',
  primary: '#6B6B9E',
  textDark: '#2D2D4E',
  textMuted: '#6B6B8D',
  white: '#FFFFFF',
  pink: '#F2C4C4',
  summaryBg: '#A0A0CC',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  // Add Bill Card
  addBillCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  addBillTitle: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 16,
    textDecorationLine: 'underline',
    fontFamily: 'serif',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 20,
  },
  fieldLabel: {
    fontSize: 15,
    color: COLORS.textDark,
    textDecorationLine: 'underline',
    fontFamily: 'serif',
  },
  friendInput: {
    fontSize: 15,
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textDark,
    paddingVertical: 2,
    paddingHorizontal: 4,
    minWidth: 80,
    fontFamily: 'serif',
  },
  loanDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  loanDropdownText: {
    fontSize: 15,
    color: COLORS.textDark,
    textDecorationLine: 'underline',
    fontFamily: 'serif',
  },
  dropdownArrow: {
    fontSize: 14,
    color: COLORS.textDark,
    marginLeft: 4,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 12,
    marginLeft: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  dropdownOptionActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  amountBubble: {
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  amountInput: {
    fontSize: 14,
    color: COLORS.textDark,
    minWidth: 50,
    textAlign: 'center',
    padding: 0,
  },

  // Summary
  summaryBubble: {
    backgroundColor: COLORS.summaryBg,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontFamily: 'serif',
  },

  // Add Date
  addDateButton: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  addDateText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: 'serif',
  },

  // Split Options Card
  splitOptionsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  splitOptionsTitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 14,
    fontFamily: 'serif',
  },
  splitOptionButton: {
    backgroundColor: COLORS.optionBg,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  splitOptionButtonActive: {
    backgroundColor: COLORS.primary,
  },
  splitOptionText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  splitOptionTextActive: {
    color: COLORS.white,
  },

  // Done Button
  doneContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  doneButton: {
    backgroundColor: COLORS.pink,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 50,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },

  // Bottom Tab Bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#C5C5D8',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: {
    padding: 8,
  },
  tabIcon: {
    fontSize: 22,
  },
});
