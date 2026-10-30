import React from "react";
import {StyleSheet, Text, View, ViewStyle} from "react-native";

interface SystemRuleCheckCardProps {
  windowLabel?: string;
  clauseExplanation?: string;
  compensationAmount?: number;
  walletReference?: string;
  style?: ViewStyle;
}

export const SystemRuleCheckCard: React.FC<SystemRuleCheckCardProps> = React.memo(({
  windowLabel = "Late ( < 3 hours)",
  clauseExplanation = "The late cancellation window clause was triggered because the request was made 2 hours prior to the appointment, falling below our standard 3-hour minimum notice policy.",
  compensationAmount = 250,
  walletReference = "#4412",
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>⚏</Text>
        <Text style={styles.headerTitle}>System Rule Check</Text>
      </View>

      {/* Cancellation Window Line */}
      <View style={styles.windowRow}>
        <Text style={styles.windowLabel}>Cancellation Window</Text>
        <Text style={styles.windowValue}>{windowLabel}</Text>
      </View>

      {/* Policy Explanation Note */}
      <Text style={styles.clauseText}>{clauseExplanation}</Text>

      {/* Compensation Box */}
      <View style={styles.compensationBox}>
        <View style={styles.compLeft}>
          <Text style={styles.compLabel}>COMPENSATION</Text>
          <Text style={styles.compAmount}>
            +₹{compensationAmount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.compRight}>
          <View style={styles.payoutStatusRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.payoutStatusText}>Payout Credited</Text>
          </View>
          <Text style={styles.walletRefText}>to Wallet {walletReference}</Text>
        </View>
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  headerIcon: {
    fontSize: 16,
    color: "#114B3E",
    marginRight: 8,
    fontWeight: "900",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#114B3E",
  },
  windowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  windowLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  windowValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#EF4444",
  },
  clauseText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 14,
  },
  compensationBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  compLeft: {
    flex: 1,
  },
  compLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  compAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#114B3E",
    marginTop: 2,
  },
  compRight: {
    alignItems: "flex-end",
  },
  payoutStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  checkIcon: {
    fontSize: 10,
    fontWeight: "900",
    color: "#059669",
  },
  payoutStatusText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  walletRefText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
});
