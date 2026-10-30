import React, {useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";
import {useAssignmentCards, useBookingDetail, usePayoutConfig} from "../../hooks/queries";
import {hasCoords} from "../../utils/geo";

type Props = NativeStackScreenProps<RootStackParamList, "CompletedBookingDetail">;

const inr = (n?: number) => `₹${Math.round(n ?? 0).toLocaleString("en-IN")}`;

export const CompletedBookingDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const bookingId = route.params?.bookingId ?? "";
  const {data: booking} = useBookingDetail(bookingId || undefined);
  const {cards} = useAssignmentCards();
  const config = usePayoutConfig();

  const visits = useMemo(
    () => (booking ? cards.filter(c => c.customerName === booking.customerName).length : 0),
    [cards, booking],
  );
  const totalMins = (booking?.items ?? []).reduce((s, i) => s + i.duration, 0);
  const bill = booking?.payable ?? booking?.totalAmount ?? 0;
  const commissionPct = (config.data as any)?.defaultCommissionPercentage ?? 10;
  const earnings = Math.round((booking?.totalAmount ?? 0) * (1 - commissionPct / 100));
  const isPaid = booking?.paymentStatus === "PAID" || booking?.paymentStatus === "SUCCESS";

  const handleCall = () => {
    if (booking?.customerPhone) Linking.openURL(`tel:${booking.customerPhone}`).catch(() => {});
  };

  const handleOpenMaps = () => {
    if (!booking) return;
    const a = booking.address;
    const q = hasCoords(a) ? `${a.latitude},${a.longitude}` : encodeURIComponent(a.fullAddress);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching bookings-4.png */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 16) + 30},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Header Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerTopRow}>
            <Image source={IMAGES.CLIENT_AVATAR} style={styles.customerAvatar} />
            <View style={styles.customerInfoCol}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.customerName}>{booking?.customerName ?? "—"}</Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              </View>
              <Text style={styles.bookingIdSubtext}>ID : {booking?.bookingNumber ?? bookingId}</Text>
              <Text style={styles.bookingCountSubtext}>• {visits} booking{visits === 1 ? "" : "s"} with you</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Contact & Location Info */}
          <View style={styles.contactRow}>
            <View style={styles.iconSquare}>
              <Text style={styles.contactIcon}>📱</Text>
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactLabel}>Mobile</Text>
              <Text style={styles.contactValue}>{booking?.customerPhone || "—"}</Text>
            </View>
            <TouchableOpacity
              style={styles.callCircleBtn}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.contactRow, {marginTop: 10}]}>
            <View style={styles.iconSquare}>
              <Text style={styles.contactIcon}>📍</Text>
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>{booking?.address.fullAddress || "—"}</Text>
              <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.7}>
                <Text style={styles.mapsLink}>• Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section: Services Rendered */}
        <Text style={styles.sectionHeader}>Services Rendered</Text>

        {(booking?.items ?? []).map(item => (
          <View key={item.serviceId} style={styles.renderedServiceCard}>
            <Image source={IMAGES.SERVICE_FACIAL} style={styles.serviceThumb} />
            <View style={styles.serviceMetaCol}>
              <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
              <Text style={styles.serviceDuration}>Duration: {item.duration} mins</Text>
            </View>
            <Text style={styles.servicePrice}>{inr(item.price)}</Text>
          </View>
        ))}

        {/* Section: Service Details */}
        <Text style={styles.sectionHeader}>Service Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Booking Time</Text>
            <Text style={styles.detailsVal}>{booking?.scheduledAt ?? "—"}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Duration</Text>
            <Text style={styles.detailsVal}>
              {totalMins >= 60 ? `${Math.floor(totalMins / 60)} hr ` : ""}{totalMins % 60 ? `${totalMins % 60} min` : ""}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Bill Amount</Text>
            <Text style={styles.detailsVal}>{inr(bill)}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Payment Status</Text>
            <View style={styles.paidPill}>
              <Text style={styles.paidPillText}>
                {isPaid ? `PAID${booking?.paymentMethod ? ` (${booking.paymentMethod})` : ""}` : booking?.paymentStatus ?? "PENDING"}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Your Earnings</Text>
            <Text style={styles.earningsAmount}>+{inr(earnings)}</Text>
          </View>
        </View>

        {/* Section: Special Instructions */}
        {!!booking?.notes && (
          <>
            <Text style={styles.sectionHeader}>Special Instructions</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{booking.notes}</Text>
            </View>
          </>
        )}

        {/* Previous Bookings Entry Row */}
        <TouchableOpacity
          style={styles.previousBookingsRow}
          onPress={() => navigation.navigate("PreviousBookings", {clientName: booking?.customerName})}
          activeOpacity={0.7}
        >
          <Text style={styles.previousBookingsTitle}>Previous Bookings</Text>
          <View style={styles.previousRight}>
            <Text style={styles.previousCountText}>{visits} Total</Text>
            <Text style={styles.previousChevron}> ›</Text>
          </View>
        </TouchableOpacity>

        {/* Bottom Actions Row */}
        <View style={styles.bottomActionsRow}>
          <TouchableOpacity
            style={styles.receiptBtn}
            onPress={() => navigation.navigate("BookingReceipt", {bookingId})}
            activeOpacity={0.7}
          >
            <Text style={styles.receiptBtnIcon}>🧾 </Text>
            <Text style={styles.receiptBtnText}>View Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => navigation.navigate("HelpSupport")}
            activeOpacity={0.7}
          >
            <Text style={styles.helpBtnIcon}>🎧 </Text>
            <Text style={styles.helpBtnText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
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
  customerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  customerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E2E8F0",
  },
  customerInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  completedBadge: {
    backgroundColor: "#E6F7F0",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  bookingIdSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  bookingCountSubtext: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  contactIcon: {
    fontSize: 15,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  contactValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  mapsLink: {
    fontSize: 12,
    fontWeight: "600",
    color: "#114B3E",
    marginTop: 2,
  },
  callCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6F7F0",
    alignItems: "center",
    justifyContent: "center",
  },
  callIcon: {
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  renderedServiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  serviceThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  serviceMetaCol: {
    flex: 1,
    marginLeft: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  serviceDuration: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  extraServiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  extraAccentBar: {
    width: 4,
    backgroundColor: "#114B3E",
  },
  extraContent: {
    flex: 1,
    padding: 12,
  },
  extraTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  extraTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  extraPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#114B3E",
  },
  extraBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F7F0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  extraBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#114B3E",
  },
  extraNote: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailsLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  detailsVal: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#0F172A",
  },
  paidPill: {
    backgroundColor: "#E6F7F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  paidPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#114B3E",
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 2,
  },
  earningsLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#114B3E",
  },
  instructionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  starsText: {
    fontSize: 14,
    color: "#EAB308",
    marginRight: 6,
  },
  ratingNumber: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  reviewQuote: {
    fontSize: 13,
    color: "#334155",
    fontStyle: "italic",
    marginBottom: 10,
  },
  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  previousBookingsRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  previousBookingsTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  previousRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  previousCountText: {
    fontSize: 13,
    color: "#64748B",
  },
  previousChevron: {
    fontSize: 16,
    color: "#64748B",
  },
  bottomActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  receiptBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  receiptBtnIcon: {
    fontSize: 14,
  },
  receiptBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  helpBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  helpBtnIcon: {
    fontSize: 14,
  },
  helpBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
});
