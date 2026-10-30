import React from "react";
import {StyleSheet, Text, View, ViewStyle} from "react-native";

interface SecurityBadgeCardProps {
  variant?: "banner" | "card";
  title?: string;
  description?: string;
  style?: ViewStyle;
}

export const SecurityBadgeCard: React.FC<SecurityBadgeCardProps> = React.memo(({
  variant = "card",
  title = "Bank-Level Security",
  description = "Your transaction is encrypted with 256-bit SSL protocols to ensure safety.",
  style,
}) => {
  if (variant === "banner") {
    return (
      <View style={[styles.bannerContainer, style]}>
        <Text style={styles.shieldIcon}>🛡️</Text>
        <Text style={styles.bannerText}>
          Your wallet is protected with 256-bit encryption. All transactions are secured.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.contentCol}>
        <View style={styles.headerRow}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <Text style={styles.descText}>{description}</Text>
      </View>

      <View style={styles.ringIndicator}>
        <View style={styles.innerRing} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  shieldIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  bannerText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    flex: 1,
  },
  cardContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  contentCol: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  lockIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  descText: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  ringIndicator: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: "#A7F3D0",
    borderTopColor: "#114B3E",
    alignItems: "center",
    justifyContent: "center",
  },
  innerRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#DCFCE7",
  },
});
