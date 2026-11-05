import React, {useState, useEffect, useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {DetailedServiceItem} from "../../types";
import {dialEmergency} from "../../utils/emergency";
import {IMAGES} from "../../constants/images";
import {EmergencySosModal, toast} from "../../components/common";
import {useBookingDetail} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceCheckIn">;

const END_SERVICE_HOLD_MS = 800;

export const ServiceCheckInScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {bookingId, extraItems} = route.params;
  const {data: booking} = useBookingDetail(bookingId);

  // Elapsed time is derived from the server start time, so it survives app restarts.
  const startedAtMs = useMemo(
    () => (booking?.startedAt ? Date.parse(booking.startedAt) : Date.now()),
    [booking?.startedAt],
  );
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showSosModal, setShowSosModal] = useState(false);

  useEffect(() => {
    const tick = () => setSecondsElapsed(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startedAtMs]);

  const startedLabel = new Date(startedAtMs).toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"});

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndService = () => {
    navigation.navigate("ServiceCheckOut", {bookingId});
  };

  const handleAddExtraService = () => {
    navigation.navigate("AddExtraService", {bookingId});
  };

  const hasExtraItems = extraItems && extraItems.length > 0;

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Home.png & Resume.png */}
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
          Service Check In
        </Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 90, 110)},
        ]}>
        {/* Giant Timer Card matching Home.png & Resume.png */}
        <View style={styles.timerCard}>
          <Text style={styles.elapsedTimeHeader}>ELAPSED TIME</Text>
          <Text style={styles.timerDigits}>{formatTime(secondsElapsed)}</Text>
          <View style={styles.timerStartedRow}>
            <Text style={styles.timerClockIcon}>⏱</Text>
            <Text style={styles.timerStartedText}>Started at {startedLabel}</Text>
          </View>
        </View>

        {/* Booked Items Section matching Home.png */}
        <View style={styles.itemsSection}>
          <Text maxFontSizeMultiplier={1.3} style={styles.sectionHeading}>
            Booked Items
          </Text>

          {(booking?.items ?? []).map(item => (
            <View key={item.serviceId} style={styles.bookedItemCard}>
              <Image
                source={IMAGES.SERVICE_HERO_BRIDAL}
                style={styles.itemThumb}
                resizeMode="cover"
              />
              <View style={styles.itemMetaColumn}>
                <Text maxFontSizeMultiplier={1.3} style={styles.itemTitle}>
                  {item.serviceTitle}
                </Text>
                <Text style={styles.itemDuration}>⏱ {item.duration} min{item.completed ? " • Done ✓" : ""}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price.toLocaleString("en-IN")}</Text>
            </View>
          ))}
        </View>

        {/* Requested Extra Items Section matching Resume.png if present */}
        {hasExtraItems && (
          <View style={styles.itemsSection}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionHeading}>
              Requested Items
            </Text>

            {(extraItems as DetailedServiceItem[]).map((item, index) => (
              <View key={`extra-${item.id ?? index}`} style={styles.bookedItemCard}>
                <Image
                  source={item.thumbnailUrl ? {uri: item.thumbnailUrl} : IMAGES.SERVICE_FACIAL}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />
                <View style={styles.itemMetaColumn}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.itemTitle}>
                    {item.title}
                  </Text>
                  <View style={styles.tagsMiniRow}>
                    {!!item.category && (
                      <View style={styles.pillTag}>
                        <Text style={styles.pillTagText}>{item.category}</Text>
                      </View>
                    )}
                    {!!item.duration && <Text style={styles.itemDuration}>⏱ {item.duration}</Text>}
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPriceSmall}>₹{item.discountPrice.toFixed(2)}</Text>
                    {item.originalPrice > item.discountPrice && (
                      <Text style={styles.strikethroughPrice}>₹{item.originalPrice.toFixed(2)}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.addedBadge}>
                  <Text style={styles.addedBadgeText}>Added</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Button: Add Service / Package matching Home.png & Resume.png */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddExtraService}
          style={styles.addExtraServiceBtn}>
          <View style={styles.addPlusCircle}>
            <Text style={styles.addPlusText}>+</Text>
          </View>
          <Text style={styles.addExtraServiceBtnText}>
            + Add Service / Package
          </Text>
        </TouchableOpacity>

        {/* Action Button: End Service matching Home.png */}
        <View style={styles.endServiceBlock}>
          {/* Ending a live service finalises billing, so it needs a deliberate press-and-hold. */}
          <TouchableOpacity
            activeOpacity={0.88}
            delayLongPress={END_SERVICE_HOLD_MS}
            onPress={() => toast.info("Press and hold to end the service")}
            onLongPress={handleEndService}
            accessibilityRole="button"
            accessibilityHint="Press and hold to end the service"
            style={styles.endServiceBtn}>
            <View style={styles.endServiceSquareDot} />
            <Text style={styles.endServiceBtnText}>
              Tap and Hold to End Service
            </Text>
          </TouchableOpacity>
          <Text style={styles.endServiceFootnote}>
            This will finalize the billing and notify the client.
          </Text>
        </View>

        {/* Emergency SOS Banner matching Home.png */}
        <View style={styles.sosBannerBlock}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setShowSosModal(true)}
            style={styles.sosBannerBtn}>
            <Text style={styles.sosIcon}>🚨</Text>
            <Text style={styles.sosBannerText}>EMERGENCY SOS</Text>
          </TouchableOpacity>
          <Text style={styles.sosFootnote}>
            Your safety is our priority. Tap for immediate assistance.
          </Text>
        </View>
      </ScrollView>

      {/* Emergency SOS Modal */}
      <EmergencySosModal
        visible={showSosModal}
        onCancel={() => setShowSosModal(false)}
        onConfirmSos={() => {
          setShowSosModal(false);
          dialEmergency();
        }}
      />
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
    backgroundColor: "#FAEDF1",
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#B02B58",
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  timerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  elapsedTimeHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 1,
    marginBottom: 6,
  },
  timerDigits: {
    fontSize: 44,
    fontWeight: "900",
    color: "#114B3E", // Deep emerald digital timer
    letterSpacing: -1,
    marginBottom: 8,
  },
  timerStartedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerClockIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  timerStartedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  itemsSection: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  bookedItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemThumb: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  itemMetaColumn: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  itemDuration: {
    fontSize: 11.5,
    color: "#6B7280",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#114B3E",
  },
  tagsMiniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 2,
  },
  pillTag: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pillTagText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#059669",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemPriceSmall: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  strikethroughPrice: {
    fontSize: 11,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  addedBadge: {
    borderWidth: 1.2,
    borderColor: "#0D9488",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  addedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
  addExtraServiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 16,
  },
  addPlusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#114B3E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  addPlusText: {
    fontSize: 14,
    lineHeight: 15,
    color: "#114B3E",
    fontWeight: "700",
  },
  addExtraServiceBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#114B3E",
  },
  endServiceBlock: {
    alignItems: "center",
    marginBottom: 24,
  },
  endServiceBtn: {
    width: "100%",
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
    marginBottom: 8,
  },
  endServiceSquareDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginRight: 10,
  },
  endServiceBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  endServiceFootnote: {
    fontSize: 11.5,
    color: "#6B7280",
    textAlign: "center",
  },
  sosBannerBlock: {
    alignItems: "center",
    marginTop: 8,
  },
  sosBannerBtn: {
    width: "100%",
    backgroundColor: "#B91C1C", // Red banner matching Home.png
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  sosIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  sosBannerText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  sosFootnote: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
});
