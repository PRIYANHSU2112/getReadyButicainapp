import React, {useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation, useRoute, RouteProp} from "@react-navigation/native";
import {RootStackParamList} from "../../navigation/types";
import {ScreenContainer, Header} from "../../components/common";

export const WithdrawalSuccessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, "WithdrawalSuccess">>();
  const insets = useSafeAreaInsets();

  const amount = route.params?.amount || 450;
  const bankName = route.params?.bankName || "HDFC Bank";
  const accountEnding = route.params?.accountEnding || "8821";
  const transactionId = route.params?.transactionId || "#WT-9283-XM02";

  const handleCopyTxId = useCallback(() => {
    Alert.alert("Copied", `Transaction ID ${transactionId} copied to clipboard.`);
  }, [transactionId]);

  const handleViewStatus = useCallback(() => {
    navigation.navigate("EarningsHistory", {initialTab: "withdrawal"});
  }, [navigation]);

  const handleBackToHome = useCallback(() => {
    navigation.navigate("MainTabs", {screen: "DashboardTab"});
  }, [navigation]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Withdraw Money"
        showBack
        onBackPress={() => navigation.navigate("MainTabs", {screen: "WalletTab"})}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 40, 60)},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* SUCCESS BADGE */}
        <View style={styles.successOuterCircle}>
          <View style={styles.successInnerCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        </View>

        {/* HEADINGS */}
        <Text style={styles.titleText}>Withdrawal Requested</Text>
        <Text style={styles.subtitleText}>
          Usually credited in 1–2 business days
        </Text>

        {/* NOTICE PILL */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            Withdrawals are processed within 1–3 business days. No withdrawal fee.
          </Text>
        </View>

        {/* RECEIPT DETAILS CARD */}
        <View style={styles.receiptCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.captionText}>AMOUNT REQUESTED</Text>
              <Text style={styles.amountText}>
                ₹{amount.toLocaleString("en-IN", {minimumFractionDigits: 2})}
              </Text>
            </View>
            <View style={styles.processingBadge}>
              <Text style={styles.processingText}>Processing</Text>
            </View>
          </View>

          <View style={styles.twoColRow}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Destination Bank</Text>
              <View style={styles.bankNameRow}>
                <Text style={styles.bankIcon}>🏛️</Text>
                <Text style={styles.colValue}>{bankName}</Text>
              </View>
            </View>

            <View style={styles.col}>
              <Text style={styles.colLabel}>Account ending in</Text>
              <Text style={styles.colValue}>•••• {accountEnding}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.txIdRow}>
            <View>
              <Text style={styles.colLabel}>Transaction ID</Text>
              <Text style={styles.txIdText}>{transactionId}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyTxId}
              style={styles.copyBtn}
              activeOpacity={0.7}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            >
              <Text style={styles.copyIcon}>📋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* VIEW STATUS IN HISTORY BUTTON */}
        <TouchableOpacity
          style={styles.historyBtn}
          activeOpacity={0.8}
          onPress={handleViewStatus}
        >
          <Text style={styles.historyBtnText}>View Status in History</Text>
        </TouchableOpacity>

        {/* BACK TO HOME BUTTON */}
        <TouchableOpacity
          style={styles.backHomeBtn}
          activeOpacity={0.8}
          onPress={handleBackToHome}
        >
          <Text style={styles.backHomeBtnText}>Back To Home</Text>
        </TouchableOpacity>

        {/* NOTIFICATION NOTE */}
        <Text style={styles.notificationNote}>
          You'll receive a notification once the funds reach your account.
        </Text>
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
  successOuterCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  noticeBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 18,
    width: "100%",
  },
  noticeText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
  },
  receiptCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  captionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#114B3E",
    letterSpacing: -0.5,
  },
  processingBadge: {
    backgroundColor: "#F0FDF4",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  processingText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  twoColRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  colLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },
  bankNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bankIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  colValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 14,
  },
  txIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txIdText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  copyBtn: {
    padding: 6,
  },
  copyIcon: {
    fontSize: 18,
  },
  historyBtn: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  historyBtnText: {
    color: "#114B3E",
    fontSize: 15,
    fontWeight: "800",
  },
  backHomeBtn: {
    width: "100%",
    backgroundColor: "#114B3E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backHomeBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  notificationNote: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
