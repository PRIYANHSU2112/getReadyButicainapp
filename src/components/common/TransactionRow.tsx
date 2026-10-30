import React from "react";
import {StyleSheet, Text, View, TouchableOpacity, ViewStyle} from "react-native";

export interface TransactionItem {
  id: string;
  title: string;
  dateTime: string;
  referenceId: string;
  amount: number;
  type: "credit" | "debit";
  category?: "service" | "withdrawal" | "topup";
  status?: "completed" | "processing" | "failed";
  customerName?: string;
  bankName?: string;
  accountNumber?: string;
  upiId?: string;
}

interface TransactionRowProps {
  transaction: TransactionItem;
  onPress?: () => void;
  style?: ViewStyle;
}

export const TransactionRow: React.FC<TransactionRowProps> = React.memo(({
  transaction,
  onPress,
  style,
}) => {
  const isCredit = transaction.type === "credit";
  const formattedAmount = `${isCredit ? "+" : "-"}₹${Math.abs(transaction.amount).toLocaleString("en-IN")}`;
  const statusLabel = isCredit ? "Credited" : "Debited";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.leftCol}>
        <Text style={styles.titleText}>{transaction.title}</Text>
        <Text style={styles.dateText}>{transaction.dateTime}</Text>
        <Text style={styles.refText}>{transaction.referenceId}</Text>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.amountText, isCredit ? styles.amountCredit : styles.amountDebit]}>
          {formattedAmount}
        </Text>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  leftCol: {
    flex: 1,
    marginRight: 12,
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 1,
  },
  refText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  rightCol: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  amountCredit: {
    color: "#114B3E", // Deep emerald for credit
  },
  amountDebit: {
    color: "#0F172A", // Dark neutral for debit
  },
  statusText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
