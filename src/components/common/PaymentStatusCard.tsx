import React from "react";
import {StyleSheet, Text, View, ViewStyle} from "react-native";

interface PaymentStatusCardProps {
  balanceAmount?: number;
  advanceAmount?: number;
  paymentMode?: string;
  style?: ViewStyle;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = React.memo(({
  balanceAmount = 879,
  advanceAmount = 1500,
  paymentMode = "Cash / UPI",
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.caption}>PAYMENT STATUS</Text>
          <Text style={styles.collectBalanceText}>Collect Balance</Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={styles.balanceAmount}>
            ₹{balanceAmount.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.paymentMode}>{paymentMode}</Text>
        </View>
      </View>

      <View style={styles.advancePaidBox}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
        <Text style={styles.advancePaidText}>
          Advance of ₹{advanceAmount.toLocaleString("en-IN")} was paid at booking.
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  caption: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  collectBalanceText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#114B3E",
    marginTop: 2,
  },
  amountCol: {
    alignItems: "flex-end",
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  paymentMode: {
    fontSize: 12.5,
    color: "#64748B",
    marginTop: 1,
  },
  advancePaidBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkIcon: {
    fontSize: 11,
    fontWeight: "900",
    color: "#059669",
  },
  advancePaidText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#334155",
    flex: 1,
  },
});
