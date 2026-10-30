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
import {PaymentStatusCard} from "../../components/common";
import {IMAGES} from "../../constants/images";
import {useBookingDetail, usePayoutConfig} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "BookingReceipt">;

const inr = (n?: number) => `₹${Math.round(n ?? 0).toLocaleString("en-IN")}`;

export const BookingReceiptScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const bookingId = route.params?.bookingId ?? "";
  const {data: booking} = useBookingDetail(bookingId || undefined);
  const config = usePayoutConfig();

  const subtotal = booking?.subtotal ?? booking?.totalAmount ?? 0;
  const commissionPct: number = (config.data as any)?.defaultCommissionPercentage ?? 10;
  const platformFee = Math.round((subtotal * commissionPct) / 100);
  const providerEarnings = subtotal - platformFee;
  const taxes = booking?.tax ?? 0;
  const grandTotal = booking?.payable ?? subtotal;
  const isPaid = booking?.paymentStatus === "PAID" || booking?.paymentStatus === "SUCCESS";

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
        <Text style={styles.headerTitle}>Invoice & Earnings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 16) + 30},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Header Row matching Status & Progress Stepper.png */}
        <View style={styles.customerHeaderRow}>
          <Image source={IMAGES.CLIENT_AVATAR} style={styles.avatar} />
          <View style={styles.customerTextCol}>
            <Text style={styles.customerName}>{booking?.customerName ?? "—"}</Text>
            <Text style={styles.bookingIdText}>Booking ID: {booking?.bookingNumber ?? bookingId}</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGridCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service</Text>
            <Text style={styles.infoValue}>{booking?.items.map(i => i.serviceTitle).join(", ") || "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{booking?.address.fullAddress || "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>{isPaid ? `💳 ${booking?.paymentMethod ?? "Online"}` : "Cash / UPI"}</Text>
          </View>
        </View>

        {/* Earnings Calculation Breakdown matching Status & Progress Stepper.png */}
        <View style={styles.breakdownCard}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Subtotal</Text>
            <Text style={styles.calcVal}>{inr(subtotal)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Platform Fee ({commissionPct}%)</Text>
            <Text style={styles.calcVal}>- {inr(platformFee)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Provider Earnings ({100 - commissionPct}%)</Text>
            <Text style={styles.calcValBold}>{inr(providerEarnings)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Taxes (collected from customer)</Text>
            <Text style={styles.calcVal}>{inr(taxes)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalPayoutRow}>
            <Text style={styles.totalPayoutLabel}>Total Payout</Text>
            <Text style={styles.totalPayoutAmount}>{inr(providerEarnings)}</Text>
          </View>
        </View>

        {/* Reusable Component: Payment Status Card */}
        <PaymentStatusCard
          balanceAmount={isPaid ? 0 : grandTotal}
          advanceAmount={isPaid ? grandTotal : 0}
          paymentMode={isPaid ? "Prepaid (Online)" : "Cash / UPI"}
        />

        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => navigation.navigate("MainTabs", {screen: "DashboardTab"})}
          activeOpacity={0.85}
        >
          <Text style={styles.backHomeBtnText}>BACK TO HOME →</Text>
        </TouchableOpacity>

        <Text style={styles.footnoteText}>
          Payouts are credited to your wallet after the booking is marked complete.
        </Text>
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
  customerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E2E8F0",
  },
  customerTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  bookingIdText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  starIcon: {
    fontSize: 12,
    color: "#0F766E",
    marginRight: 4,
  },
  memberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F766E",
  },
  infoGridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  calcLabel: {
    fontSize: 13.5,
    color: "#64748B",
  },
  calcVal: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  calcValBold: {
    fontSize: 14,
    color: "#114B3E",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  totalPayoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 2,
  },
  totalPayoutLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  totalPayoutAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#114B3E",
  },
  backHomeBtn: {
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
    marginTop: 6,
    marginBottom: 12,
  },
  backHomeBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  footnoteText: {
    fontSize: 11.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
