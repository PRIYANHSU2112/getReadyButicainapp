import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";
import {useBookingDetail} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "AwaitingApproval">;

export const AwaitingApprovalScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {bookingId, requestedItems} = route.params;
  const customerName = useBookingDetail(bookingId).data?.customerName ?? "the customer";

  const [isResent, setIsResent] = useState(false);

  // No mid-service add-on endpoint yet: approval is confirmed in person by the customer.
  const handleResend = () => {
    setIsResent(true);
    Alert.alert("Ask the Customer", `Please ask ${customerName} to confirm the added services in person.`);
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this addition request?",
      [
        {text: "No", style: "cancel"},
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleManualApprove = () => {
    navigation.navigate("ServiceAddedSuccess", {
      bookingId,
      addedItems: requestedItems,
    });
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Home-1.png */}
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
        {/* Awaiting Approval Box matching Home-1.png */}
        <View style={styles.awaitingCard}>
          <View style={styles.syncCircle}>
            <Text style={styles.syncIcon}>🔄</Text>
          </View>
          <Text maxFontSizeMultiplier={1.3} style={styles.awaitingTitle}>
            Awaiting Approval...
          </Text>
        </View>

        {/* Requested Items Section matching Home-1.png */}
        <View style={styles.itemsSection}>
          <Text maxFontSizeMultiplier={1.3} style={styles.sectionHeading}>
            Requested Items
          </Text>

          {/* Requested item cards */}
          {(requestedItems.length > 0
            ? requestedItems
            : [
                {
                  id: "req-1",
                  title: "Classic Manicure",
                  category: "Nails",
                  duration: "45 min",
                  discountPrice: 245,
                  originalPrice: 445,
                },
                {
                  id: "req-2",
                  title: "Classic Manicure",
                  category: "Nails",
                  duration: "45 min",
                  discountPrice: 245,
                  originalPrice: 445,
                },
              ]
          ).map((item, index) => (
            <View key={`req-item-${index}`} style={styles.itemCard}>
              <Image
                source={IMAGES.SERVICE_PEDICURE}
                style={styles.itemThumb}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text maxFontSizeMultiplier={1.3} style={styles.itemTitle}>
                  {item.title}
                </Text>
                <View style={styles.tagsRow}>
                  <View style={styles.pillTag}>
                    <Text style={styles.pillTagText}>{item.category || "Nails"}</Text>
                  </View>
                  <Text style={styles.durationText}>⏱ {item.duration || "45 min"}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.discountPrice}>₹{item.discountPrice || 245}.00</Text>
                  <Text style={styles.originalPrice}>₹{item.originalPrice || 445}.00</Text>
                </View>
              </View>
              <View style={styles.addedBadge}>
                <Text style={styles.addedBadgeText}>Added</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Add Extra Service Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddExtraService", {bookingId})}
          style={styles.addExtraBtn}>
          <Text style={styles.addExtraPlus}>+ Add Extra Service / Package</Text>
        </TouchableOpacity>

        {/* Customer Status Card matching Home-1.png */}
        <View style={styles.customerStatusCard}>
          <Image
            source={IMAGES.CLIENT_AVATAR}
            style={styles.customerAvatar}
            resizeMode="cover"
          />
          <View style={styles.customerTexts}>
            <Text maxFontSizeMultiplier={1.3} style={styles.customerName}>
              {customerName}
            </Text>
            <Text style={styles.customerSentTime}>
              {isResent ? "Request sent just now" : "Request sent 2 mins ago"}
            </Text>
          </View>
          <View style={styles.sentBadge}>
            <Text style={styles.sentBadgeText}>SENT</Text>
          </View>
        </View>

        {/* Lock Pill Badge */}
        <View style={styles.lockBadgePill}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockText}>Service cannot start until verified</Text>
        </View>

        {/* Resend Request Link matching Home-1.png */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleResend}
          style={styles.resendBtn}>
          <Text style={styles.resendBtnText}>Resend Request</Text>
        </TouchableOpacity>

        {/* Cancel Request Button matching Home-1.png */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCancel}
          style={styles.cancelRequestBtn}>
          <Text style={styles.cancelRequestBtnText}>Cancel Request</Text>
        </TouchableOpacity>

        <Text style={styles.footnoteText}>
          The service will be unlocked automatically once the customer approves the charges.
        </Text>

        {/* Quick Demo Instant-Approve Shortcut */}
        <TouchableOpacity
          onPress={handleManualApprove}
          style={styles.demoShortcutBtn}>
          <Text style={styles.demoShortcutText}>⚡ Simulate Client Approval Now</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  awaitingCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 18,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  syncCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#114B3E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  syncIcon: {
    fontSize: 22,
    color: "#FFFFFF",
  },
  awaitingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#114B3E",
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
  itemCard: {
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
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
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
  durationText: {
    fontSize: 11,
    color: "#6B7280",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  discountPrice: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#111827",
  },
  originalPrice: {
    fontSize: 11.5,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  addedBadge: {
    borderWidth: 1.2,
    borderColor: "#0D9488",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  addedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
  addExtraBtn: {
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },
  addExtraPlus: {
    fontSize: 14,
    fontWeight: "700",
    color: "#114B3E",
  },
  customerStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 14,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  customerTexts: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  customerSentTime: {
    fontSize: 11.5,
    color: "#6B7280",
  },
  sentBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sentBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4B5563",
  },
  lockBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  lockText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  resendBtn: {
    alignItems: "center",
    marginBottom: 14,
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#114B3E",
  },
  cancelRequestBtn: {
    backgroundColor: "#114B3E",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cancelRequestBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footnoteText: {
    fontSize: 11.5,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 16,
    marginBottom: 16,
  },
  demoShortcutBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  demoShortcutText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#065F46",
  },
});
