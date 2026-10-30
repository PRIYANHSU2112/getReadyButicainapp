import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {BillBreakdownCard, PaymentStatusCard} from "../../components/common";
import {IMAGES} from "../../constants/images";
import {useBookingDetail} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "ItemsDetails">;

const inr = (n?: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

export const ItemsDetailsScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const bookingId = route.params?.bookingId ?? "";
  const {data: booking} = useBookingDetail(bookingId || undefined);
  const items = booking?.items ?? [];
  const serviceTotal = booking?.subtotal ?? booking?.totalAmount ?? 0;
  const grandTotal = booking?.payable ?? booking?.totalAmount ?? 0;
  const isPaid = booking?.paymentStatus === "PAID" || booking?.paymentStatus === "SUCCESS";
  const mins = items.reduce((s, i) => s + i.duration, 0);

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Items Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Booked Items */}
        <Text style={styles.sectionHeader}>Booked Items</Text>

        {items.map(item => (
          <View key={item.serviceId} style={styles.itemCard}>
            <Image source={IMAGES.SERVICE_FACIAL} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.serviceTitle}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>⏱</Text>
                <Text style={styles.metaText}>{item.duration} min</Text>
              </View>
              <Text style={styles.baseServiceLabel}>{item.completed ? "Completed ✓" : "Base Service"}</Text>
            </View>
            <Text style={styles.itemPrice}>{inr(item.price)}</Text>
          </View>
        ))}

        {/* SECTION 3: Bill Calculation Breakdown */}
        <BillBreakdownCard
          serviceTotal={serviceTotal}
          taxesAndFees={Math.max(0, grandTotal - serviceTotal)}
          grandTotal={grandTotal}
        />

        {/* SECTION 4: Payment Status Card */}
        <PaymentStatusCard
          balanceAmount={isPaid ? 0 : grandTotal}
          advanceAmount={isPaid ? grandTotal : 0}
          paymentMode={isPaid ? "Prepaid (Online)" : "Cash / UPI"}
        />

        {/* Bottom space to avoid overlap with fixed action footer */}
        <View style={{height: 120}} />
      </ScrollView>

      {/* Sticky Bottom Action Bar (matching Home-8.png) */}
      <View
        style={[
          styles.bottomActionBar,
          {paddingBottom: Math.max(insets.bottom, 14) + 8},
        ]}
      >
        <View style={styles.summaryBarRow}>
          <View style={styles.summaryDurationRow}>
            <Text style={styles.summaryClockIcon}>⏱</Text>
            <Text style={styles.summaryDurationText}>
              Duration: {mins >= 60 ? `${Math.floor(mins / 60)} hr ` : ""}{mins % 60} min
            </Text>
          </View>
          <View style={styles.summaryChargeColumn}>
            <Text style={styles.summaryChargeLabel}>Total Charge</Text>
            <Text style={styles.summaryChargeAmount}>{inr(grandTotal)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.enterOtpBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("EndOtp", {bookingId})}
        >
          <Text style={styles.enterOtpBtnText}>Enter OTP</Text>
        </TouchableOpacity>

        <View style={styles.bottomFootnoteRow}>
          <Text style={styles.bottomFootnoteIcon}>ⓘ</Text>
          <Text style={styles.bottomFootnoteText}>
            Customer can find the completion OTP in their booking screen
          </Text>
        </View>
      </View>
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
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSpacer: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "500",
  },
  baseServiceLabel: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#114B3E",
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  categoryChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  priceWithDiscountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  struckOutPrice: {
    fontSize: 12.5,
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  addedBadge: {
    borderWidth: 1.5,
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  addedBadgeText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#059669",
  },
  requestedPackageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  packageAccentBar: {
    width: 4,
    backgroundColor: "#114B3E",
  },
  packageInner: {
    flex: 1,
    padding: 14,
  },
  packageHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  packageTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#114B3E",
  },
  midServicePill: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F7F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  midServiceText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#114B3E",
    letterSpacing: 0.4,
  },
  clientReqRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  clientReqIcon: {
    fontSize: 12,
    color: "#64748B",
    marginRight: 6,
  },
  clientReqText: {
    fontSize: 12,
    color: "#64748B",
  },
  billBreakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 6,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  breakdownValue: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#0F172A",
  },
  breakdownDivider: {
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
  paymentStatusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  paymentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  paymentStatusTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  collectBalanceText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#114B3E",
    marginTop: 2,
  },
  balanceAmountText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  paymentModeSubtext: {
    fontSize: 12,
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
  advanceCheckIcon: {
    fontSize: 14,
    fontWeight: "900",
    color: "#059669",
    marginRight: 8,
  },
  advancePaidText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#334155",
    flex: 1,
  },
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: 18,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  summaryBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryDurationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryClockIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  summaryDurationText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  summaryChargeColumn: {
    alignItems: "flex-end",
  },
  summaryChargeLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  summaryChargeAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: "#114B3E",
  },
  enterOtpBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#114B3E",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  enterOtpBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#114B3E",
  },
  bottomFootnoteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  bottomFootnoteIcon: {
    fontSize: 11,
    color: "#94A3B8",
    marginRight: 5,
  },
  bottomFootnoteText: {
    fontSize: 11.5,
    color: "#64748B",
    textAlign: "center",
  },
});
