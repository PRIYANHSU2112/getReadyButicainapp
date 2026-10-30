import React, { useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTransactions, useWalletDashboard } from "../../hooks/queries";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ScreenContainer,
  Header,
  TransactionRow,
  TransactionItem,
  SecurityBadgeCard,
} from "../../components/common";

const RECENT_LIMIT = 5;
const inr = (n?: number) => Math.round(n ?? 0).toLocaleString("en-IN");

export const EarningsDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const wallet = useWalletDashboard();
  const txQuery = useTransactions();
  const recent = useMemo(() => (txQuery.data ?? []).slice(0, RECENT_LIMIT), [txQuery.data]);
  const w = wallet.data;

  const { refetch: refetchWallet } = wallet;
  const { refetch: refetchTx } = txQuery;
  const onRefresh = useCallback(() => {
    refetchWallet();
    refetchTx();
  }, [refetchWallet, refetchTx]);

  const handleWithdrawalPress = useCallback(() => {
    navigation.navigate("PayoutRequest");
  }, [navigation]);

  const handleHistoryPress = useCallback(() => {
    navigation.navigate("EarningsHistory", { initialTab: "all" });
  }, [navigation]);

  const handleViewAllPress = useCallback(() => {
    navigation.navigate("EarningsHistory", { initialTab: "all" });
  }, [navigation]);

  const handleClaimCashback = useCallback(() => {
    Alert.alert(
      "Cashback Offer",
      "Add ₹500 or more to your wallet balance via UPI to unlock flat 10% instant cashback credited to your wallet.",
      [{ text: "Got It" }]
    );
  }, []);

  const handleTransactionPress = useCallback(
    (item: TransactionItem) => {
      navigation.navigate("TransactionDetails", {
        transactionId: item.id,
        transaction: item,
      });
    },
    [navigation]
  );

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Wallet"
        showBack={navigation.canGoBack()}
        onBackPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate("DashboardTab");
          }
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={wallet.isRefetching} onRefresh={onRefresh} colors={["#114B3E"]} />}
      >
        {/* TOTAL BALANCE CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceCaption}>TOTAL BALANCE</Text>
          <Text style={styles.balanceAmount}>₹{inr(w?.availableBalance ?? w?.balance)}</Text>
          <Text style={styles.balanceSubtitle}>Available for bookings</Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>↖ MONTHLY EARNING</Text>
              <Text style={styles.statValue}>₹{inr(w?.monthlyEarnings)}</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>↗ TOTAL WITHDRAWAL</Text>
              <Text style={styles.statValue}>₹{inr(w?.totalWithdrawal)}</Text>
            </View>
          </View>
        </View>

        {/* ACTION BUTTONS: Withdrawal Fund & History */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.withdrawBtn}
            activeOpacity={0.8}
            onPress={handleWithdrawalPress}
          >
            <Text style={styles.withdrawBtnText}>Withdrawal Fund</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyBtn}
            activeOpacity={0.8}
            onPress={handleHistoryPress}
          >
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* 10% CASHBACK PROMO BANNER */}
        <View style={styles.promoCard}>
          <Text style={styles.promoIcon}>🎉</Text>
          <View style={styles.promoTextCol}>
            <Text style={styles.promoTitle}>10% Cashback on top-up!</Text>
            <Text style={styles.promoSub}>
              Add ₹500+ via UPI. Valid till 31 Jul.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.claimBtn}
            activeOpacity={0.8}
            onPress={handleClaimCashback}
          >
            <Text style={styles.claimBtnText}>Claim</Text>
          </TouchableOpacity>
        </View>

        {/* TRANSACTIONS HISTORY HEADER */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionTitle}>Transactions History</Text>
          </View>
          <TouchableOpacity
            onPress={handleViewAllPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        {/* TRANSACTIONS LIST CONTAINER */}
        <View style={styles.transactionsContainer}>
          {txQuery.isLoading && <ActivityIndicator style={{ marginVertical: 16 }} color="#114B3E" />}
          {!txQuery.isLoading && recent.length === 0 && (
            <Text style={[styles.viewAllText, { textAlign: "center", marginVertical: 16 }]}>No transactions yet</Text>
          )}
          {recent.map((tx, idx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              onPress={() => handleTransactionPress(tx)}
              style={
                idx === recent.length - 1
                  ? styles.lastRow
                  : undefined
              }
            />
          ))}
        </View>

        {/* 256-BIT ENCRYPTION FOOTNOTE */}
        <SecurityBadgeCard
          variant="banner"
          style={styles.securityBanner}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  balanceCaption: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: "900",
    color: "#114B3E",
    letterSpacing: -0.5,
  },
  balanceSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    width: "100%",
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statSeparator: {
    width: 1,
    height: 32,
    backgroundColor: "#F1F5F9",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  withdrawBtn: {
    flex: 1,
    backgroundColor: "#114B3E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#114B3E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  withdrawBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  historyBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    borderWidth: 1.5,
    borderColor: "#114B3E",
  },
  historyBtnText: {
    color: "#114B3E",
    fontSize: 14,
    fontWeight: "700",
  },
  promoCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  promoIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  promoTextCol: {
    flex: 1,
    marginRight: 10,
  },
  promoTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  promoSub: {
    fontSize: 11,
    color: "#64748B",
  },
  claimBtn: {
    backgroundColor: "#114B3E",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  claimBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionAccentBar: {
    width: 3.5,
    height: 18,
    backgroundColor: "#114B3E",
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  transactionsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  securityBanner: {
    marginTop: 6,
    marginBottom: 24,
  },
});
