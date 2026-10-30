import React, {useState, useMemo, useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import {useTransactions, useWalletDashboard} from "../../hooks/queries";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation, useRoute, RouteProp} from "@react-navigation/native";
import {RootStackParamList} from "../../navigation/types";
import {
  ScreenContainer,
  Header,
  TransactionRow,
  TransactionItem,
} from "../../components/common";

type TabType = "all" | "service" | "withdrawal";

const TAB_FILTER: Record<TabType, "all" | "credit" | "debit"> = {all: "all", service: "credit", withdrawal: "debit"};
const inr = (n?: number) => `₹${(n ?? 0).toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

export const EarningsHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, "EarningsHistory">>();
  const insets = useSafeAreaInsets();

  const initialTab = (route.params?.initialTab as TabType) || "all";
  const [selectedTab, setSelectedTab] = useState<TabType>(initialTab);

  // Each tab is its own cached query — switching back is instant.
  const txQuery = useTransactions(TAB_FILTER[selectedTab]);
  const wallet = useWalletDashboard();
  const filteredTransactions: TransactionItem[] = txQuery.data ?? [];
  const w = wallet.data;

  const summaryMeta = useMemo(() => {
    switch (selectedTab) {
      case "service":
        return {title: "Total Earnings (This Month)", amount: inr(w?.monthlyEarnings), trend: "Service earnings credited"};
      case "withdrawal":
        return {title: "Total Withdrawal", amount: inr(w?.totalWithdrawal), trend: `Pending: ${inr(w?.pendingWithdrawal)}`};
      case "all":
      default:
        return {title: "Available Balance", amount: inr(w?.availableBalance ?? w?.balance), trend: `This month: ${inr(w?.monthlyEarnings)}`};
    }
  }, [selectedTab, w]);

  const {hasNextPage, isFetchingNextPage, fetchNextPage} = txQuery;
  const onScroll = useCallback(({nativeEvent: e}: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (hasNextPage && !isFetchingNextPage && e.layoutMeasurement.height + e.contentOffset.y >= e.contentSize.height - 200) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        title="Earnings History"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={250}
        refreshControl={
          <RefreshControl
            refreshing={txQuery.isRefetching && !isFetchingNextPage}
            onRefresh={() => { txQuery.refetch(); wallet.refetch(); }}
            colors={["#114B3E"]}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 40, 60)},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* FILTER PILLS */}
        <View style={styles.tabPillRow}>
          <TouchableOpacity
            style={[
              styles.tabPill,
              selectedTab === "all" ? styles.tabPillActive : styles.tabPillInactive,
            ]}
            activeOpacity={0.7}
            onPress={() => setSelectedTab("all")}
          >
            <Text
              style={[
                styles.tabPillText,
                selectedTab === "all"
                  ? styles.tabPillTextActive
                  : styles.tabPillTextInactive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              selectedTab === "service"
                ? styles.tabPillActive
                : styles.tabPillInactive,
            ]}
            activeOpacity={0.7}
            onPress={() => setSelectedTab("service")}
          >
            <Text
              style={[
                styles.tabPillText,
                selectedTab === "service"
                  ? styles.tabPillTextActive
                  : styles.tabPillTextInactive,
              ]}
            >
              Service Earning
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              selectedTab === "withdrawal"
                ? styles.tabPillActive
                : styles.tabPillInactive,
            ]}
            activeOpacity={0.7}
            onPress={() => setSelectedTab("withdrawal")}
          >
            <Text
              style={[
                styles.tabPillText,
                selectedTab === "withdrawal"
                  ? styles.tabPillTextActive
                  : styles.tabPillTextInactive,
              ]}
            >
              Withdrawal
            </Text>
          </TouchableOpacity>
        </View>

        {/* MONTHLY SUMMARY CARD (Figma deep emerald card) */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCaption}>{summaryMeta.title}</Text>
          <Text style={styles.summaryAmount}>{summaryMeta.amount}</Text>
          <View style={styles.trendRow}>
            <Text style={styles.trendIcon}>📈</Text>
            <Text style={styles.trendText}>{summaryMeta.trend}</Text>
          </View>
        </View>

        {/* TRANSACTIONS CONTAINER */}
        <View style={styles.transactionsContainer}>
          {txQuery.isLoading && <ActivityIndicator style={styles.loader} color="#114B3E" />}
          {!txQuery.isLoading && filteredTransactions.length === 0 && (
            <Text style={styles.emptyText}>No transactions yet</Text>
          )}
          {filteredTransactions.map((tx, idx) => (
            <TransactionRow
              key={`${tx.id}-${idx}`}
              transaction={tx}
              onPress={() => handleTransactionPress(tx)}
              style={
                idx === filteredTransactions.length - 1
                  ? styles.lastRow
                  : undefined
              }
            />
          ))}
          {isFetchingNextPage && <ActivityIndicator style={styles.loader} color="#114B3E" />}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: {marginVertical: 16},
  emptyText: {textAlign: "center", marginVertical: 24, color: "#64748B", fontSize: 13},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabPillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 8,
  },
  tabPillActive: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  tabPillInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  tabPillTextActive: {
    color: "#114B3E",
  },
  tabPillTextInactive: {
    color: "#64748B",
  },
  summaryCard: {
    backgroundColor: "#114B3E",
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryCaption: {
    fontSize: 12,
    color: "#A7F3D0",
    fontWeight: "600",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  trendText: {
    fontSize: 12,
    color: "#A7F3D0",
    fontWeight: "600",
  },
  transactionsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
});
