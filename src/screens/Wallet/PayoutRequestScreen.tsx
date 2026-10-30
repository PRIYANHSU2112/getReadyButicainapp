import React, {useState, useCallback, useEffect} from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {useBankDetails, usePayoutConfig, useRequestPayout, useWalletDashboard} from "../../hooks/queries";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {
  ScreenContainer,
  Header,
  BankSelectorCard,
  SecurityBadgeCard,
} from "../../components/common";

export const PayoutRequestScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const wallet = useWalletDashboard();
  const config = usePayoutConfig();
  const bank = useBankDetails();
  const payout = useRequestPayout();

  const availableBalance: number = wallet.data?.availableBalance ?? wallet.data?.balance ?? 0;
  const minAmount = config.data?.minWithdrawalAmount ?? 100;
  const maxAmount = config.data?.maxWithdrawalAmount ?? 50000;
  const b = bank.data;
  const bankName: string = b?.bankName || "Bank account";
  const accountEnding: string = String(b?.accountNumber ?? "").slice(-4);

  const [amount, setAmount] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");

  // Prefill UPI from saved bank details once loaded.
  useEffect(() => { if (b?.upiId) setUpiId(prev => prev || b.upiId); }, [b?.upiId]);

  const parsedAmount = parseFloat(amount) || 0;
  const isAmountValid = parsedAmount >= minAmount && parsedAmount <= Math.min(availableBalance, maxAmount);

  const handleWithdrawAll = useCallback(() => {
    setAmount(Math.floor(Math.min(availableBalance, maxAmount)).toString());
  }, [availableBalance, maxAmount]);

  const handleChangeBank = useCallback(() => {
    navigation.navigate("EditBankDetails");
  }, [navigation]);

  const handleConfirmWithdraw = useCallback(() => {
    if (payout.isPending) return;
    if (!isAmountValid) {
      if (parsedAmount < minAmount) {
        Alert.alert("Invalid Amount", `Minimum withdrawal amount is ₹${minAmount}.`);
      } else if (parsedAmount > maxAmount) {
        Alert.alert("Limit Exceeded", `Maximum withdrawal per request is ₹${maxAmount.toLocaleString("en-IN")}.`);
      } else {
        Alert.alert("Insufficient Balance", "Withdrawal amount cannot exceed available balance.");
      }
      return;
    }
    const useUpi = upiId.trim().includes("@");
    if (!useUpi && !b?.accountNumber) {
      Alert.alert("Add Payout Method", "Please add a bank account or enter a UPI ID to withdraw.", [
        {text: "Cancel", style: "cancel"},
        {text: "Add Bank", onPress: handleChangeBank},
      ]);
      return;
    }

    payout.mutate(
      useUpi
        ? {amount: parsedAmount, payoutType: "UPI", upiId: upiId.trim()}
        : {
            amount: parsedAmount,
            payoutType: "BANK_ACCOUNT",
            bankName: b.bankName,
            accountNumber: b.accountNumber,
            ifscCode: b.ifscCode,
            accountHolderName: b.accountHolderName,
          },
      {
        onSuccess: res => {
          navigation.navigate("WithdrawalSuccess", {
            amount: parsedAmount,
            bankName: useUpi ? upiId.trim() : bankName,
            accountEnding: useUpi ? "UPI" : accountEnding,
            transactionId: res?.payoutNumber ?? res?.transactionId ?? "",
          });
        },
      },
    );
  }, [payout, isAmountValid, parsedAmount, minAmount, maxAmount, upiId, b, bankName, accountEnding, navigation, handleChangeBank]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Withdraw Money"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 40, 60)},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* AVAILABLE TO WITHDRAW CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceCaption}>Available to withdraw</Text>
          <Text style={styles.balanceAmount}>
            ₹{availableBalance.toLocaleString("en-IN", {minimumFractionDigits: 2})}
          </Text>
          <View style={styles.securePill}>
            <Text style={styles.shieldIcon}>🛡️</Text>
            <Text style={styles.securePillText}>Secure Balance</Text>
          </View>
        </View>

        {/* INPUT FORM CONTAINER */}
        <View style={styles.formCard}>
          {/* WITHDRAW AMOUNT INPUT */}
          <Text style={styles.inputLabel}>WITHDRAW AMOUNT (MIN ₹{minAmount})</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Amount"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* MIN & WITHDRAW ALL ROW */}
          <View style={styles.inputHelperRow}>
            <Text style={styles.helperText}>Min: ₹{minAmount}</Text>
            <TouchableOpacity
              onPress={handleWithdrawAll}
              activeOpacity={0.7}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            >
              <Text style={styles.withdrawAllText}>Withdraw All</Text>
            </TouchableOpacity>
          </View>

          {/* BANK ACCOUNT / UPI ID */}
          <Text style={[styles.inputLabel, {marginTop: 18}]}>
            BANK ACCOUNT / UPI ID
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="name@upi (optional — uses bank account if empty)"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>

          {/* INFO NOTICE */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              Funds typically arrive in 1-3 business days. Fast transfer options available on next screen.
            </Text>
          </View>
        </View>

        {/* LINKED BANK CARD */}
        <BankSelectorCard
          bankName={b?.accountNumber ? bankName : "No bank linked — tap Change"}
          accountEnding={accountEnding || "----"}
          accountType="SAVINGS"
          onChangePress={handleChangeBank}
        />

        {/* BANK-LEVEL SECURITY CARD */}
        <SecurityBadgeCard
          variant="card"
          title="Bank-Level Security"
          description="Your transaction is encrypted with 256-bit SSL protocols to ensure safety."
        />

        {/* DYNAMIC WITHDRAW BUTTON */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isAmountValid ? styles.primaryButtonActive : styles.primaryButtonDisabled,
          ]}
          activeOpacity={isAmountValid ? 0.8 : 1}
          onPress={handleConfirmWithdraw}
          disabled={!isAmountValid}
        >
          <Text
            style={[
              styles.primaryButtonText,
              isAmountValid ? styles.primaryButtonTextActive : styles.primaryButtonTextDisabled,
            ]}
          >
            {payout.isPending
              ? "Processing…"
              : isAmountValid ? `Withdraw ₹${parsedAmount.toLocaleString("en-IN")}` : "Withdraw ₹0"}
          </Text>
        </TouchableOpacity>

        {/* DISCLAIMER / TERMS */}
        <View style={styles.disclaimerRow}>
          <Text style={styles.disclaimerText}>
            By clicking confirm, you agree to our{" "}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Transfer Terms",
                "Withdrawals are processed directly to your linked bank account via RBI IMPS/NEFT rails. No hidden processing charges."
              )
            }
          >
            <Text style={styles.termsLink}>Transfer Terms</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 16,
  },
  balanceCaption: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  securePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  shieldIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  securePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#114B3E",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 48,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    paddingVertical: 0,
  },
  inputHelperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#64748B",
  },
  withdrawAllText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  noticeBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  noticeText: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  primaryButtonActive: {
    backgroundColor: "#114B3E",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
  },
  primaryButtonTextActive: {
    color: "#FFFFFF",
  },
  primaryButtonTextDisabled: {
    color: "#FFFFFF",
  },
  disclaimerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#64748B",
  },
  termsLink: {
    fontSize: 12,
    color: "#114B3E",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
