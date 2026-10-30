import React from "react";
import {StyleSheet, Text, View, ViewStyle} from "react-native";

interface EarningsCreditedBannerProps {
  amount?: number | string;
  label?: string;
  style?: ViewStyle;
}

export const EarningsCreditedBanner: React.FC<EarningsCreditedBannerProps> = React.memo(({
  amount = 1900,
  label = "Earnings Credited",
  style,
}) => {
  const formattedAmount =
    typeof amount === "number" ? `+₹${amount.toLocaleString("en-IN")}` : amount;

  return (
    <View style={[styles.bannerContainer, style]}>
      <View style={styles.leftContent}>
        <View style={styles.walletIconBox}>
          <Text style={styles.walletIcon}>💳</Text>
        </View>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.amountText}>{formattedAmount}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: "#114B3E", // Deep dark emerald matching Figma
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  walletIcon: {
    fontSize: 16,
  },
  labelText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  amountText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
