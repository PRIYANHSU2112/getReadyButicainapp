import React from "react";
import {StyleSheet, Text, View, ViewStyle} from "react-native";

interface BillBreakdownCardProps {
  serviceTotal?: number;
  taxesAndFees?: number;
  grandTotal?: number;
  style?: ViewStyle;
}

export const BillBreakdownCard: React.FC<BillBreakdownCardProps> = React.memo(({
  serviceTotal = 2299,
  taxesAndFees = 80,
  grandTotal = 2379,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <Text style={styles.label}>Service Total</Text>
        <Text style={styles.value}>₹{serviceTotal.toLocaleString("en-IN")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Taxes & Fees</Text>
        <Text style={styles.value}>₹{taxesAndFees.toLocaleString("en-IN")}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.grandTotalRow}>
        <Text style={styles.grandTotalLabel}>Grand Total</Text>
        <Text style={styles.grandTotalValue}>₹{grandTotal.toLocaleString("en-IN")}</Text>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#64748B",
  },
  value: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#0F172A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 2,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#114B3E",
  },
});
