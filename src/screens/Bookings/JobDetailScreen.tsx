import React, {useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";
import {useAssignmentCards, useBookingDetail} from "../../hooks/queries";
import {GOOGLE_MAP_ID} from "../../config/maps";
import {hasCoords} from "../../utils/geo";

type Props = NativeStackScreenProps<RootStackParamList, "JobDetail">;

const inr = (n?: number) => `₹${Math.round(n ?? 0).toLocaleString("en-IN")}`;

export const JobDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {bookingId} = route.params;
  const {data: booking, isLoading} = useBookingDetail(bookingId);
  const {cards} = useAssignmentCards();

  // Repeat-client count from the cached assignments (no extra request).
  const visitsWithClient = useMemo(
    () => (booking ? cards.filter(c => c.customerName === booking.customerName).length : 0),
    [cards, booking],
  );

  const when = useMemo(() => {
    if (!booking?.scheduledStart) return {label: "Scheduled", time: booking?.scheduledAt ?? "", urgency: ""};
    const start = new Date(booking.scheduledStart);
    const now = new Date();
    const isToday = start.toDateString() === now.toDateString();
    const mins = Math.round((start.getTime() - now.getTime()) / 60000);
    const urgency =
      mins < 0 ? "Started" : mins < 60 ? `Start in ${mins} min` : mins < 24 * 60 ? `Start in ${Math.round(mins / 60)} Hours` : "";
    return {
      label: isToday ? "Today" : start.toLocaleDateString("en-IN", {day: "2-digit", month: "short"}),
      time: start.toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"}),
      urgency,
    };
  }, [booking]);

  const coords = booking && hasCoords(booking.address) ? booking.address : null;
  const isPrepaid = booking?.paymentStatus === "PAID" || booking?.paymentStatus === "SUCCESS";

  const handleCallClient = () => {
    if (booking?.customerPhone) Linking.openURL(`tel:${booking.customerPhone}`).catch(() => undefined);
  };

  const handleOpenMaps = () => {
    if (!booking) return;
    const q = coords ? `${coords.latitude},${coords.longitude}` : encodeURIComponent(booking.address.fullAddress);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => undefined);
  };

  if (isLoading || !booking) {
    return (
      <View style={[styles.screenContainer, {justifyContent: "center"}]}>
        <ActivityIndicator color="#114B3E" />
      </View>
    );
  }

  const handleStartJourney = () => {
    navigation.navigate("EnRoute", {bookingId});
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching bookings.png */}
      <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top, 14)}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backCircleBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>

        <Text maxFontSizeMultiplier={1.3} style={styles.headerTitle}>
          Bookings Details
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("CancelBooking", {bookingId})}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={styles.cancelHeaderLink}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 90, 110)},
        ]}>
        {/* Client Profile Card matching bookings.png */}
        <View style={styles.clientCard}>
          <Image
            source={IMAGES.CLIENT_AVATAR}
            style={styles.clientAvatar}
            resizeMode="cover"
          />
          <View style={styles.clientInfoColumn}>
            <Text maxFontSizeMultiplier={1.3} style={styles.clientName}>
              {booking.customerName}
            </Text>
            {!!booking.bookingNumber && <Text style={styles.clientBadge}>#{booking.bookingNumber}</Text>}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("PreviousBookings", {clientName: booking.customerName})}
              hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
            >
              <Text style={styles.clientHistoryLink}>
                • {visitsWithClient} booking{visitsWithClient === 1 ? "" : "s"} with you ›
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCallClient}
            accessibilityRole="button"
            accessibilityLabel="Call Customer"
            style={styles.callCircleBtn}>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* Time and Urgency Badges Row matching bookings.png */}
        <View style={styles.timeUrgencyRow}>
          {/* Today Slot Card */}
          <View style={styles.timeCardEmerald}>
            <View style={styles.timeHeaderRow}>
              <Text style={styles.timeCalendarIcon}>📅</Text>
              <Text style={styles.timeHeaderLabel}>{when.label}</Text>
            </View>
            <Text style={styles.timeValueText}>{when.time}</Text>
          </View>

          {/* Urgency Card — only shown when the slot starts within 24h */}
          {!!when.urgency && (
            <View style={styles.urgentCardDark}>
              <View style={styles.urgentBadgePill}>
                <Text style={styles.urgentBadgeText}>URGENT</Text>
              </View>
              <Text style={styles.urgentSubtitle}>{when.urgency}</Text>
            </View>
          )}
        </View>

        {/* Address and Map Card matching bookings.png */}
        <View style={styles.addressCard}>
          <View style={styles.mapBannerWrapper}>
            {coords ? (
              <MapView
                provider={PROVIDER_GOOGLE}
                {...(GOOGLE_MAP_ID ? {googleMapId: GOOGLE_MAP_ID} : {})}
                style={StyleSheet.absoluteFill}
                initialRegion={{latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01}}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                toolbarEnabled={false}
                onPress={handleOpenMaps}>
                <Marker coordinate={coords} pinColor="#114B3E" />
              </MapView>
            ) : (
              <View style={styles.simulatedMapBg}>
                <View style={styles.mapPinBubble}>
                  <Text style={styles.mapPinText}>📍</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.addressInfoBlock}>
            <Text style={styles.addressHeaderCaps}>ADDRESS</Text>
            <Text maxFontSizeMultiplier={1.3} style={styles.addressFullText}>
              {booking.address.fullAddress || "Address unavailable"}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenMaps}
              style={styles.openMapsBtn}>
              <Text style={styles.openMapsIcon}>🧭</Text>
              <Text style={styles.openMapsText}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Requested matching bookings.png */}
        <View style={styles.servicesSection}>
          <View style={styles.servicesHeaderRow}>
            <Text style={styles.servicesSparkleIcon}>✦</Text>
            <Text maxFontSizeMultiplier={1.3} style={styles.servicesSectionTitle}>
              Services Requested
            </Text>
          </View>

          {booking.items.map(item => (
            <View key={item.serviceId} style={styles.serviceItemRow}>
              <View style={styles.serviceItemTexts}>
                <Text maxFontSizeMultiplier={1.3} style={styles.serviceTitle}>
                  {item.serviceTitle}
                </Text>
                <Text style={styles.serviceSubtitle}>
                  {item.duration} min{item.completed ? " • Completed ✓" : ""}
                </Text>
              </View>
              <Text style={styles.servicePrice}>{inr(item.price)}</Text>
            </View>
          ))}

          {/* Client Notes Card matching bookings.png */}
          {!!booking.notes && (
            <View style={styles.clientNotesCard}>
              <View style={styles.notesBarAccent} />
              <View style={styles.notesContentColumn}>
                <View style={styles.notesTitleRow}>
                  <Text style={styles.notesIcon}>📝</Text>
                  <Text style={styles.notesTitleText}>CLIENT NOTES</Text>
                </View>
                <Text style={styles.notesQuoteText}>"{booking.notes}"</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bill Summary matching bookings.png */}
        <View style={styles.billSummarySection}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>{inr(booking.subtotal ?? booking.totalAmount)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes</Text>
            <Text style={styles.billValue}>{booking.tax ? inr(booking.tax) : "₹0 (Inc.)"}</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <View>
              <Text style={styles.totalAmountLabel}>Total Amount</Text>
              <Text style={styles.totalAmountValue}>{inr(booking.payable ?? booking.totalAmount)}</Text>
            </View>
            {isPrepaid && (
              <View style={styles.prepaidBadgePill}>
                <Text style={styles.prepaidCheck}>✓</Text>
                <Text style={styles.prepaidBadgeText}>PREPAID (ONLINE)</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Start Journey Navigation Button matching bookings.png */}
      <View
        style={[
          styles.bottomActionBar,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleStartJourney}
          style={styles.startJourneyBtn}>
          <Text style={styles.startJourneyArrow}>▲</Text>
          <Text style={styles.startJourneyText}>
            Start Journey / Navigate to Location
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#E11D48",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  cancelHeaderLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clientAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  clientInfoColumn: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  clientBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  clientHistoryLink: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#114B3E",
    marginTop: 2,
  },
  callCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  callIcon: {
    fontSize: 18,
  },
  timeUrgencyRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  timeCardEmerald: {
    flex: 1,
    backgroundColor: "#114B3E",
    borderRadius: 14,
    padding: 14,
  },
  timeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timeCalendarIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  timeHeaderLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  timeValueText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  urgentCardDark: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 14,
    padding: 14,
    justifyContent: "center",
  },
  urgentBadgePill: {
    alignSelf: "flex-start",
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  urgentBadgeText: {
    fontSize: 9.5,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  urgentSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  mapBannerWrapper: {
    width: "100%",
    height: 130,
    backgroundColor: "#E0F2FE",
  },
  simulatedMapBg: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E2E8F0",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  mapRoad1: {
    position: "absolute",
    width: "100%",
    height: 12,
    backgroundColor: "#CBD5E1",
    top: 40,
    transform: [{rotate: "-8deg"}],
  },
  mapRoad2: {
    position: "absolute",
    width: 14,
    height: "100%",
    backgroundColor: "#CBD5E1",
    left: 120,
    transform: [{rotate: "15deg"}],
  },
  mapPinBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#114B3E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPinText: {
    fontSize: 16,
  },
  addressInfoBlock: {
    padding: 14,
  },
  addressHeaderCaps: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  addressFullText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 19,
    marginBottom: 10,
  },
  openMapsBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  openMapsIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  openMapsText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0D9488",
  },
  servicesSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  servicesHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  servicesSparkleIcon: {
    fontSize: 14,
    color: "#0D9488",
    marginRight: 6,
  },
  servicesSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  serviceItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  serviceItemTexts: {
    flex: 1,
    paddingRight: 12,
  },
  serviceTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  serviceSubtitle: {
    fontSize: 11.5,
    color: "#6B7280",
  },
  servicePrice: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#111827",
  },
  clientNotesCard: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  notesBarAccent: {
    width: 4,
    backgroundColor: "#114B3E",
  },
  notesContentColumn: {
    flex: 1,
    padding: 12,
  },
  notesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  notesIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  notesTitleText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#114B3E",
    letterSpacing: 0.5,
  },
  notesQuoteText: {
    fontSize: 12,
    lineHeight: 17,
    fontStyle: "italic",
    color: "#374151",
  },
  billSummarySection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 12.5,
    color: "#6B7280",
  },
  billValue: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#111827",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 6,
  },
  totalAmountLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  totalAmountValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  prepaidBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  prepaidCheck: {
    fontSize: 11,
    color: "#15803D",
    fontWeight: "900",
    marginRight: 4,
  },
  prepaidBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#15803D",
    letterSpacing: 0.4,
  },
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  startJourneyBtn: {
    backgroundColor: "#114B3E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  startJourneyArrow: {
    fontSize: 11,
    color: "#FFFFFF",
    marginRight: 8,
  },
  startJourneyText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
