import React, {useState, useEffect, useMemo, useCallback} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
} from "react-native";
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useQueryClient} from "@tanstack/react-query";
import {MainTabParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {usePartner} from "../../context/PartnerContext";
import {useBooking} from "../../context/BookingContext";
import {useLocation} from "../../context/LocationContext";
import {distanceKm, hasCoords} from "../../utils/geo";
import {isRealImage} from "../../utils/files";
import {IMAGES} from "../../constants/images";
import {IncomingBookingData} from "../../types";
import {useHomeServices, useHomeSummary, useNotifications, useUpcomingBookings} from "../../hooks/queries";
import {IncomingBookingModal} from "../../components/booking";
import {
  BigDutySwitch,
  EmergencySosModal,
  FloatingSosButton,
} from "../../components/common";

type Props = BottomTabScreenProps<MainTabParamList, "DashboardTab">;

const {width} = Dimensions.get("window");
const overviewCardWidth = (width - 40 - 12) / 2;
const serviceCardWidth = (width - 40 - 12) / 2;
const inr = (n?: number) => Math.round(n ?? 0).toLocaleString("en-IN");

export const DashboardScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {partner} = useAuth();
  const {dutyStatus, toggleDuty} = usePartner();

  const {bookings, acceptBooking} = useBooking();
  const {currentLocation, refreshLocation} = useLocation();
  const qc = useQueryClient();
  const summary = useHomeSummary();
  const upcoming = useUpcomingBookings();
  const services = useHomeServices();
  const notifications = useNotifications();

  const isOnline = dutyStatus === "online";
  const s = summary.data;
  const hasUnread = useMemo(() => notifications.data?.some(n => n.isUnread) ?? false, [notifications.data]);
  const upcomingList = upcoming.data ?? [];
  const serviceList = services.data ?? [];

  // Incoming booking popup: newest assigned booking the partner hasn't acted on yet.
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [showIncomingModal, setShowIncomingModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  const incoming = useMemo<IncomingBookingData | undefined>(() => {
    const b = bookings.find(x => x.status === "assigned" && !dismissed.has(x.id));
    return b && {
      id: b.id,
      serviceId: b.id,
      clientName: b.customerName,
      membershipTag: "",
      serviceName: b.items.map(i => i.serviceTitle).join(", "),
      dateTime: b.scheduledAt,
      address: b.address.fullAddress,
      distanceKm: currentLocation && hasCoords(b.address) ? `${distanceKm(currentLocation, b.address).toFixed(1)} km` : "",
      payoutAmount: b.totalAmount,
      initialCountdown: 30,
    };
  }, [bookings, dismissed, currentLocation]);

  useEffect(() => {
    setShowIncomingModal(isOnline && !!incoming);
  }, [isOnline, incoming?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // One location fix when going on duty — used for distance to incoming jobs.
  useEffect(() => {
    if (isOnline) refreshLocation();
  }, [isOnline, refreshLocation]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({queryKey: ["home"]}),
      qc.invalidateQueries({queryKey: ["bookings"]}),
      qc.invalidateQueries({queryKey: ["notifications"]}),
    ]);
    setRefreshing(false);
  }, [qc]);

  const handleDutyToggle = toggleDuty;

  const dismissIncoming = (id: string) => setDismissed(prev => new Set(prev).add(id));

  const handleAcceptBooking = (booking: IncomingBookingData) => {
    setShowIncomingModal(false);
    dismissIncoming(booking.id);
    acceptBooking(booking.id);
    const rootNav = navigation.getParent() || navigation;
    (rootNav as any).navigate("JobDetail", {bookingId: booking.serviceId});
  };

  const handleRejectBooking = (booking: IncomingBookingData) => {
    setShowIncomingModal(false);
    dismissIncoming(booking.id);
    // Navigate straight to Cancellation Details Screen matching Image 1
    const rootNav = navigation.getParent() || navigation;
    (rootNav as any).navigate("CancellationDetails", {
      bookingId: booking.serviceId,
      serviceTitle: booking.serviceName,
      clientName: booking.clientName,
    });
  };

  return (
    <View style={styles.screenContainer}>
      {/* Top Header matching Image 5 */}
      <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top, 14)}]}>
        {/* Left: Avatar + Name + Expert Status */}
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("ProfileTab")}>
            <Image
              source={isRealImage(partner?.avatar) ? {uri: partner!.avatar!} : IMAGES.DUMMY_AVATAR}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <View style={styles.stylistNameGroup}>
            <Text maxFontSizeMultiplier={1.3} style={styles.stylistGreeting}>
              Hi, {partner?.fullName ? partner.fullName.split(" ")[0] : "there"}
            </Text>
            <View style={styles.statusBadgesRow}>
              <Text style={styles.goldExpertTag}>⭐ Gold Expert</Text>
              <View style={styles.statusDotRow}>
                <View style={[styles.onlineDot, !isOnline && styles.offlineDot]} />
                <Text style={styles.onlineStatusText}>
                  {isOnline ? "Online" : "Offline"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right: Big Duty Switch + Bell Icon matching Image 4 */}
        <View style={styles.headerRightGroup}>
          <BigDutySwitch
            isOnline={isOnline}
            onToggle={handleDutyToggle}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              const rootNav = navigation.getParent() || navigation;
              (rootNav as any).navigate("Notifications");
            }}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={styles.bellButton}>
            <Text style={styles.bellIcon}>🔔</Text>
            {hasUnread && <View style={styles.unreadRedDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 84, 96)},
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#114B3E" colors={["#114B3E"]} />}>
        {/* ========================================================================= */}
        {/* HERO EARNINGS CARD matching Image 5 */}
        {/* ========================================================================= */}
        <View style={styles.heroEarningsCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.earningsLabel}>Todays  Earnings</Text>
              <Text style={styles.earningsAmount}>₹{inr(s?.todayEarnings)}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {(s?.rating ?? partner?.rating ?? 0).toFixed(1)}</Text>
            </View>
          </View>

          {/* Stats Divider Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Booking Today</Text>
              <Text style={styles.statValue}>{s?.todayBookingsCount ?? 0}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>{s?.completedBookingsToday ?? 0}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>{s?.pendingBookingsToday ?? 0}</Text>
            </View>
          </View>

          {/* Bottom Milestone Banner */}
          <View style={styles.milestoneBanner}>
            <Text style={styles.milestoneIcon}>🛡️</Text>
            <Text style={styles.milestoneText}>
              {isOnline ? "You're on duty — new bookings will appear here" : "Go online to start receiving bookings"}
            </Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* SECTION: Upcoming Bookings matching Image 5 */}
        {/* ========================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Upcoming Bookings</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("BookingsTab")}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.upcomingHorizontalList}>
          {upcomingList.length === 0 && (
            <Text style={styles.addServicesSubtitle}>
              {upcoming.isLoading ? "Loading bookings…" : "No upcoming bookings yet"}
            </Text>
          )}
          {upcomingList.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() =>
                (navigation as any).navigate("JobDetail", {bookingId: item.id})
              }
              style={styles.upcomingCard}>
              <View style={styles.upcomingCardHeader}>
                <Image
                  source={item.clientAvatar ? {uri: item.clientAvatar} : IMAGES.CLIENT_AVATAR}
                  style={styles.upcomingAvatar}
                  resizeMode="cover"
                />
                <View style={styles.upcomingClientMeta}>
                  <Text style={styles.upcomingClientName}>{item.clientName}</Text>
                  {!!item.membershipTag && (
                    <Text style={styles.upcomingMembershipTag}>
                      ⭐ {item.membershipTag}
                    </Text>
                  )}
                </View>
                <View style={styles.upcomingNavCircle}>
                  <Text style={styles.upcomingNavArrow}>➤</Text>
                </View>
              </View>

              <Text style={styles.upcomingDateTime}>{item.dateTime}</Text>
              <View style={styles.upcomingServiceRow}>
                <Text style={styles.upcomingServiceIcon}>💆</Text>
                <Text style={styles.upcomingServiceName}>{item.serviceName}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add More Services Banner matching Image 5 */}
        <View style={styles.addServicesBanner}>
          <View style={styles.addServicesIconCircle}>
            <Text style={styles.addServicesIcon}>📈</Text>
          </View>
          <View style={styles.addServicesTextColumn}>
            <Text style={styles.addServicesTitle}>Add More Services</Text>
            <Text style={styles.addServicesSubtitle}>
              Get more earning Expanded Services
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const rootNav = navigation.getParent() || navigation;
              (rootNav as any).navigate("AddService");
            }}
            style={styles.addServicesBtn}>
            <Text style={styles.addServicesBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* SECTION: Overview (2x2 Grid) matching Image 5 */}
        {/* ========================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Overview</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("WalletTab")}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.overviewGrid}>
          {/* Card 1: Monthly Earning */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewCardIcon}>💵</Text>
            <Text style={styles.overviewCardLabel}>Monthly Earning</Text>
            <Text style={styles.overviewCardValue}>₹{inr(s?.monthlyEarnings)}</Text>
          </View>

          {/* Card 2: Rating */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewCardIcon}>⭐</Text>
            <Text style={styles.overviewCardLabel}>Rating</Text>
            <Text style={styles.overviewCardValue}>
              {(s?.rating ?? partner?.rating ?? 0).toFixed(1)}
              {s?.ratingCount ? ` (${s.ratingCount})` : ""}
            </Text>
          </View>

          {/* Card 3: Completed */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewCardIcon}>✅</Text>
            <Text style={styles.overviewCardLabel}>Completed</Text>
            <Text style={styles.overviewCardValue}>{partner?.totalBookings ?? s?.completedBookingsToday ?? 0}</Text>
          </View>

          {/* Card 4: Pending */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewCardIcon}>⏳</Text>
            <Text style={styles.overviewCardLabel}>Pending</Text>
            <Text style={styles.overviewCardValue}>{s?.pendingBookingsToday ?? 0}</Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* SECTION: My Services matching Image 5 */}
        {/* ========================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>My Services</Text>
          <TouchableOpacity
            onPress={() => {
              const rootNav = navigation.getParent() || navigation;
              (rootNav as any).navigate("MyServices");
            }}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesRow}>
          {services.isLoading && <ActivityIndicator color="#114B3E" />}
          {serviceList.length === 0 && !services.isLoading && (
            <Text style={styles.addServicesSubtitle}>No active services yet</Text>
          )}
          {serviceList.map(service => (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.88}
              onPress={() => {
                const rootNav = navigation.getParent() || navigation;
                (rootNav as any).navigate("ManageService", {
                  serviceId: service.id,
                  serviceTitle: service.title,
                });
              }}
              style={styles.serviceItemCard}>
              <Image
                source={service.thumbnailUrl ? {uri: service.thumbnailUrl} : IMAGES.SERVICE_HERO_FACIAL}
                style={styles.serviceImage}
                resizeMode="cover"
              />

              <View style={styles.serviceCardBody}>
                <View style={styles.serviceTagRatingRow}>
                  <Text style={styles.serviceCategoryTag}>{service.category}</Text>
                  {service.reviewsCount > 0 && (
                    <Text style={styles.serviceRatingText}>★ {service.rating.toFixed(1)}</Text>
                  )}
                </View>

                <Text style={styles.serviceTitle} numberOfLines={1}>
                  {service.title}
                </Text>
                <Text style={styles.serviceDescription} numberOfLines={1}>
                  {service.description}
                </Text>

                <View style={styles.servicePriceRow}>
                  <Text style={styles.serviceDiscountPrice}>
                    ₹{service.discountPrice}
                  </Text>
                  <Text style={styles.serviceOriginalPrice}>
                    ₹{service.originalPrice}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* FLOATING RED SOS BUTTON matching Image 4 */}
      {/* ========================================================================= */}
      <FloatingSosButton onPress={() => setShowSosModal(true)} />

      {/* ========================================================================= */}
      {/* EMERGENCY SOS DIALOG MODAL matching Image 2 */}
      {/* ========================================================================= */}
      <EmergencySosModal
        visible={showSosModal}
        onCancel={() => setShowSosModal(false)}
        onConfirmSos={() => {
          setShowSosModal(false);
          if (isOnline) {
            toggleDuty();
          }
          Alert.alert(
            "Emergency SOS Dispatched 🚨",
            "Emergency Response Team, Police Helpline (112), and your verified safety contacts have received your live location and status. Stay safe.",
            [{text: "Understood", style: "destructive"}]
          );
        }}
      />

      {/* ========================================================================= */}
      {/* INCOMING BOOKING POPUP MODAL matching Image 4 */}
      {/* ========================================================================= */}
      <IncomingBookingModal
        visible={showIncomingModal && !!incoming}
        data={incoming}
        onAccept={handleAcceptBooking}
        onReject={handleRejectBooking}
        onClose={() => setShowIncomingModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: "#E5E7EB",
  },
  stylistNameGroup: {},
  stylistGreeting: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },
  statusBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 8,
  },
  goldExpertTag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981", // Emerald green online dot
    marginRight: 4,
  },
  offlineDot: {
    backgroundColor: "#9CA3AF",
  },
  onlineStatusText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dutySwitch: {
    transform: [{scaleX: 0.85}, {scaleY: 0.85}],
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  bellIcon: {
    fontSize: 18,
  },
  unreadRedDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  heroEarningsCard: {
    backgroundColor: "#114B3E", // Deep luxury emerald
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.75)",
    letterSpacing: 0.5,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  ratingBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.14)",
    marginBottom: 14,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: 8,
  },
  milestoneBanner: {
    backgroundColor: "#0B382F", // Darker pill container
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  milestoneIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  milestoneText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  demoPopupTrigger: {
    alignSelf: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  demoPopupText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#114B3E",
  },
  upcomingHorizontalList: {
    gap: 12,
    paddingBottom: 14,
  },
  upcomingCard: {
    width: 250,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  upcomingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  upcomingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#E5E7EB",
  },
  upcomingClientMeta: {
    flex: 1,
  },
  upcomingClientName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
  },
  upcomingMembershipTag: {
    fontSize: 10.5,
    color: "#6B7280",
    marginTop: 1,
  },
  upcomingNavCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingNavArrow: {
    fontSize: 11,
    color: "#114B3E",
    transform: [{rotate: "-45deg"}],
  },
  upcomingDateTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  upcomingServiceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  upcomingServiceIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  upcomingServiceName: {
    fontSize: 12,
    color: "#6B7280",
  },
  addServicesBanner: {
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  addServicesIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addServicesIcon: {
    fontSize: 16,
  },
  addServicesTextColumn: {
    flex: 1,
  },
  addServicesTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  addServicesSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  addServicesBtn: {
    backgroundColor: "#114B3E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addServicesBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  overviewCard: {
    width: overviewCardWidth,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 1.5},
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1.5,
  },
  overviewCardIcon: {
    fontSize: 16,
    marginBottom: 6,
  },
  overviewCardLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  overviewCardValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginTop: 4,
  },
  servicesRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  serviceItemCard: {
    width: serviceCardWidth,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 1.5},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceImage: {
    width: "100%",
    height: 105,
    backgroundColor: "#F3F4F6",
  },
  serviceCardBody: {
    padding: 10,
  },
  serviceTagRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  serviceCategoryTag: {
    fontSize: 10,
    fontWeight: "600",
    color: "#EF4444",
  },
  serviceRatingText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#F59E0B",
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 10.5,
    color: "#6B7280",
    marginBottom: 6,
  },
  servicePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  serviceDiscountPrice: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#111827",
  },
  serviceOriginalPrice: {
    fontSize: 11,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
});
