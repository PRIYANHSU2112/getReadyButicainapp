import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {CancellationBanner, SystemRuleCheckCard} from "../../components/common";

import {useQueryClient} from "@tanstack/react-query";
import {useBookingDetail} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "CancellationDetails">;

export const CancellationDetailsScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const params = route.params || {};
  const rawBooking = useBookingDetail(params.bookingId || undefined);
  const raw = useQueryClient().getQueryData<any>(["bookings", "detail", params.bookingId ?? ""]);
  const booking = rawBooking.data;
  const cancellation = raw?.cancellation;

  const bookingId = booking?.bookingNumber ?? params.bookingId ?? "";
  const serviceTitle = params.serviceTitle ?? booking?.items.map(i => i.serviceTitle).join(", ") ?? "";
  const clientName = params.clientName ?? booking?.customerName ?? "";
  const cancelledBy =
    params.cancelledBy ?? (String(cancellation?.cancelledBy ?? "").toLowerCase().includes("beautician") ? "beautician" : "customer");
  const isCustomerCancel = cancelledBy === "customer";

  const displayStatement = params.statement || cancellation?.reason || "No reason provided.";
  const cancelledAt = cancellation?.cancelledAt ? new Date(cancellation.cancelledAt) : null;
  const cancelledSubtitle = cancelledAt
    ? `On ${cancelledAt.toLocaleDateString("en-IN", {day: "2-digit", month: "short"})} at ${cancelledAt.toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"})}`
    : "Cancelled";

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />

      {/* Header: < Cancellation Details */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancellation Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 16) + 30},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Tag matching bookings-6 & 7: ⚑ Cancel by: Customer / Beautician */}
        <View style={styles.cancelByTag}>
          <Text style={styles.flagIcon}>⚑</Text>
          <Text style={styles.cancelByText}>
            Cancel by: {isCustomerCancel ? "Customer" : "Beautician"}
          </Text>
        </View>

        {/* Reusable Component: Red Notice Banner */}
        <CancellationBanner
          title="Appointment Cancelled"
          subtitle={cancelledSubtitle}
        />

        {/* Service Card */}
        <View style={styles.serviceCard}>
          <View style={styles.redAccentBar} />
          <View style={styles.serviceInner}>
            <View style={styles.serviceIdRow}>
              <Text style={styles.serviceIdText}>SERVICE ID: {bookingId}</Text>
              <View style={styles.cancelledBadge}>
                <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
              </View>
            </View>
            <Text style={styles.serviceTitle}>{serviceTitle}</Text>
            <View style={styles.clientRow}>
              <Text style={styles.clientIcon}>👤</Text>
              <Text style={styles.clientName}>{clientName}</Text>
            </View>
          </View>
        </View>

        {/* Statement Section */}
        <View style={styles.statementCard}>
          <View style={styles.statementHeaderRow}>
            <Text style={styles.chatIcon}>💬</Text>
            <Text style={styles.statementTitle}>
              {isCustomerCancel ? "Customer Statement" : "Beautician Statement"}
            </Text>
          </View>
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>"{displayStatement}"</Text>
          </View>
        </View>

        {/* Reusable Component: System Rule Check Card (matching bookings-6.png) */}
        {isCustomerCancel && (
          <SystemRuleCheckCard
            windowLabel="Late ( < 3 hours)"
            clauseExplanation="The late cancellation window clause was triggered because the request was made 2 hours prior to the appointment, falling below our standard 3-hour minimum notice policy."
            compensationAmount={250}
            walletReference="#4412"
          />
        )}

        {/* Primary Action Button: Back to Dashboard */}
        <TouchableOpacity
          style={styles.dashboardBtn}
          onPress={() => navigation.navigate("MainTabs", {screen: "DashboardTab"})}
          activeOpacity={0.85}
        >
          <Text style={styles.dashboardBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 26,
    fontWeight: "300",
    color: "#0F172A",
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 17.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSpacer: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cancelByTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 14,
  },
  flagIcon: {
    fontSize: 12,
    color: "#E11D48",
    marginRight: 6,
  },
  cancelByText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#BE123C",
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  redAccentBar: {
    width: 4.5,
    backgroundColor: "#EF4444",
  },
  serviceInner: {
    flex: 1,
    padding: 14,
  },
  serviceIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  serviceIdText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  cancelledBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cancelledBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#EF4444",
    letterSpacing: 0.5,
  },
  serviceTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clientIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  clientName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  statementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  statementHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  chatIcon: {
    fontSize: 16,
    color: "#114B3E",
    marginRight: 8,
  },
  statementTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#114B3E",
  },
  quoteBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  quoteText: {
    fontSize: 13,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 19,
  },
  dashboardBtn: {
    width: "100%",
    backgroundColor: "#114B3E",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  dashboardBtnText: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
