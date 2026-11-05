import React, {useCallback, useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation, useRoute, RouteProp} from "@react-navigation/native";
import {RootStackParamList} from "../../navigation/types";
import {ScreenContainer, Header, TransactionItem} from "../../components/common";
import {useTransaction} from "../../hooks/queries";
import {useAuth} from "../../context/AuthContext";

const STATUS_VIEW: Record<NonNullable<TransactionItem["status"]>, {label: string; glyph: string; color: string}> = {
  completed: {label: "Completed", glyph: "✓", color: "#16A34A"},
  processing: {label: "Processing", glyph: "…", color: "#D97706"},
  failed: {label: "Failed", glyph: "!", color: "#DC2626"},
};

export const TransactionDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, "TransactionDetails">>();
  const insets = useSafeAreaInsets();

  // Use the row passed from the list; fetch by id only when opened directly (e.g. from a notification).
  const passed = route.params?.transaction as TransactionItem | undefined;
  const fetched = useTransaction(route.params?.transactionId, !passed);
  const txId = route.params?.transactionId ?? "";
  const tx: TransactionItem = useMemo(
    () =>
      passed ??
      fetched.data ?? {
        id: txId,
        title: fetched.isLoading ? "Loading…" : "Transaction",
        dateTime: "",
        referenceId: txId,
        amount: 0,
        type: "credit",
      },
    [passed, fetched.data, fetched.isLoading, txId],
  );

  const myName = useAuth().partner?.fullName || "Me";
  const isDebit = tx.type === "debit";
  const formattedAmount =`₹${Math.abs(tx.amount).toLocaleString("en-IN")}`;
  const initial = (tx.customerName || "P").charAt(0).toUpperCase();
  const status = STATUS_VIEW[tx.status ?? "completed"];

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Transaction Receipt\nAmount: ${formattedAmount}\nStatus: ${status.label}\nTransaction ID: ${tx.referenceId}\nPaid to: ${tx.type === "debit" ? tx.bankName || "Bank account" : myName}\nDate: ${tx.dateTime}`,
      });
    } catch {
      // Share sheet dismissed
    }
  }, [formattedAmount, tx, myName, status.label]);

  const handleHavingIssues = useCallback(() => {
    Alert.alert(
      "Need Help?",
      "Our 24/7 Partner Support team is here for you. We can investigate this transaction immediately.",
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Contact Support",
          onPress: () => navigation.navigate("HelpSupport"),
        },
      ]
    );
  }, [navigation]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Transaction Details"
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
        {/* TOP AVATAR INITIAL */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>

        {/* CUSTOMER NAME & AMOUNT */}
        <Text style={styles.customerName}>{tx.customerName || (isDebit ? "Withdrawal" : "Customer")}</Text>
        <Text style={styles.amountText}>{formattedAmount}</Text>
        <Text style={styles.paymentMethodText}>
          {tx.type === "credit" ? "Credited to your wallet" : "Transferred to Bank Account"}
        </Text>

        {/* STATUS BADGE: reflects the real transaction state, never assumed "Completed" */}
        <View style={styles.statusRow}>
          <View style={[styles.checkIconBox, {backgroundColor: status.color}]}>
            <Text style={styles.checkIcon}>{status.glyph}</Text>
          </View>
          <Text style={styles.statusText}>{status.label}</Text>
        </View>

        {!!tx.dateTime && <Text style={styles.dateTimestamp}>{tx.dateTime}</Text>}

        {/* WHITE DETAILS CARD */}
        <View style={styles.detailsCard}>
          {/* BANK ROW: only when the transaction actually involves a bank */}
          {!!tx.bankName && (
            <>
              <View style={styles.bankRow}>
                <View style={styles.bankLogoBox}>
                  <Text style={styles.bankLogoIcon}>🏛️</Text>
                </View>
                <Text style={styles.bankNameText}>{tx.bankName}</Text>
              </View>

              <View style={styles.cardDivider} />
            </>
          )}

          {/* TO */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>TO: {(isDebit ? tx.bankName || "Your bank account" : myName).toUpperCase()}</Text>
            {!!(isDebit ? tx.accountNumber || tx.upiId : null) && (
              <Text style={styles.fieldSubValue}>
                {tx.upiId ? `UPI ID • ${tx.upiId}` : `A/c • •••• ${String(tx.accountNumber).slice(-4)}`}
              </Text>
            )}
          </View>

          {/* FROM */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>
              FROM: {(isDebit ? "Wallet" : tx.customerName || "Customer").toUpperCase()}
            </Text>
            {!isDebit && !!tx.upiId && <Text style={styles.fieldSubValue}>UPI • {tx.upiId}</Text>}
          </View>

          {/* TRANSACTION ID */}
          <View style={[styles.fieldBlock, {marginBottom: 0}]}>
            <Text style={styles.fieldLabel}>TRANSACTION ID</Text>
            <Text style={styles.fieldValue}>{tx.referenceId || "—"}</Text>
          </View>
        </View>

        {/* BOTTOM ACTIONS: Having issues? & Share */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={handleHavingIssues}
          >
            <Text style={styles.actionIcon}>ⓘ</Text>
            <Text style={styles.actionBtnText}>Having issues?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={handleShare}
          >
            <Text style={styles.actionIcon}>➦</Text>
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  amountText: {
    fontSize: 40,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  paymentMethodText: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  checkIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  checkIcon: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  statusText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  dateTimestamp: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 20,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 20,
  },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  bankLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bankLogoIcon: {
    fontSize: 18,
  },
  bankNameText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 16,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  fieldSubValue: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#475569",
    borderRadius: 24,
    paddingVertical: 12,
    marginHorizontal: 6,
  },
  actionIcon: {
    fontSize: 14,
    color: "#475569",
    marginRight: 6,
    fontWeight: "800",
  },
  actionBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
  },
});
