import React from "react";
import {StyleSheet, Text, View, TouchableOpacity, ViewStyle} from "react-native";

interface BankSelectorCardProps {
  bankName?: string;
  accountEnding?: string;
  accountType?: string;
  onChangePress?: () => void;
  style?: ViewStyle;
}

export const BankSelectorCard: React.FC<BankSelectorCardProps> = React.memo(({
  bankName = "HDFC Bank",
  accountEnding = "8821",
  accountType = "SAVINGS",
  onChangePress,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.bankIconBox}>
        <Text style={styles.bankIcon}>🏛️</Text>
      </View>

      <View style={styles.infoCol}>
        <Text style={styles.bankNameText}>{bankName}</Text>
        <Text style={styles.accountText}>
          •••• {accountEnding} • {accountType}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.changeBtn}
        onPress={onChangePress}
        activeOpacity={0.7}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      >
        <Text style={styles.changeBtnText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 14,
  },
  bankIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bankIcon: {
    fontSize: 20,
  },
  infoCol: {
    flex: 1,
  },
  bankNameText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  accountText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  changeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
});
