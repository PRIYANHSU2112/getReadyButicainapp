import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {CancellationBanner} from "../../components/common";
import {useBookingDetail, useCancelBooking} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "CancelBooking">;

interface ReasonOption {
  id: string;
  label: string;
}

const REASON_OPTIONS: ReasonOption[] = [
  {id: "emergency", label: "Emergency / Unavoidable circumstance"},
  {id: "customer_late", label: "Customer running late / Unresponsive"},
  {id: "health", label: "Health issues / Unwell"},
  {id: "other", label: "Other"},
];

export const CancelBookingScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const bookingId = route.params?.bookingId ?? "";
  const {data: booking} = useBookingDetail(bookingId || undefined);
  const cancelBooking = useCancelBooking();
  const serviceTitle = route.params?.serviceTitle ?? booking?.items.map(i => i.serviceTitle).join(", ") ?? "";
  const clientName = route.params?.clientName ?? booking?.customerName ?? "";

  const [selectedReason, setSelectedReason] = useState<string>("emergency");
  const [statement, setStatement] = useState<string>("");
  const submitting = cancelBooking.isPending;

  const handleSubmit = () => {
    if (submitting || !bookingId) return;
    const reasonLabel = REASON_OPTIONS.find(r => r.id === selectedReason)?.label ?? "Other";
    if (selectedReason === "other" && !statement.trim()) {
      Alert.alert("Details required", "Please describe why you need to cancel this booking.");
      return;
    }
    const reason = statement.trim() ? `${reasonLabel}: ${statement.trim()}` : reasonLabel;
    cancelBooking.mutate(
      {id: bookingId, reason},
      {
        onSuccess: () =>
          navigation.replace("CancellationDetails", {
            bookingId,
            serviceTitle,
            clientName,
            cancelledBy: "beautician",
            reason: reasonLabel,
            statement: statement.trim() || reasonLabel,
          }),
      },
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching bookings-8.png: < Cancellation Details */}
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Reusable Component: Red Notice Banner matching bookings-8.png */}
        <CancellationBanner
          title="Appointment Cancel"
          subtitle="On 14 Jul at 01:15 PM (2 hours prior to start time)"
        />

        {/* Section: Booking Services */}
        <Text style={styles.sectionHeader}>Booking Services</Text>
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

        {/* Section: Reason for cancellation */}
        <Text style={styles.sectionHeader}>Reason for cancellation</Text>
        <View style={styles.reasonsList}>
          {REASON_OPTIONS.map(opt => {
            const isSelected = selectedReason === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.reasonCard,
                  isSelected && styles.reasonCardSelected,
                ]}
                onPress={() => setSelectedReason(opt.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInnerDot} />}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    isSelected && styles.reasonTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section: Write Statement */}
        <View style={styles.statementContainer}>
          <View style={styles.statementHeaderRow}>
            <Text style={styles.chatIcon}>💬</Text>
            <Text style={styles.statementTitle}>Write Statement</Text>
          </View>
          <TextInput
            style={styles.textInputArea}
            placeholder="Write here Your Reason.."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={statement}
            onChangeText={setStatement}
          />
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? "Processing..." : "Back to Dashboard"}
          </Text>
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
  sectionHeader: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
    marginTop: 6,
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
  reasonsList: {
    gap: 8,
    marginBottom: 16,
  },
  reasonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reasonCardSelected: {
    borderColor: "#114B3E",
    backgroundColor: "#F0FAF5",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: "#114B3E",
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#114B3E",
  },
  reasonText: {
    fontSize: 13.5,
    color: "#334155",
    fontWeight: "500",
    flex: 1,
  },
  reasonTextSelected: {
    color: "#114B3E",
    fontWeight: "700",
  },
  statementContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  statementHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  chatIcon: {
    fontSize: 15,
    color: "#114B3E",
    marginRight: 8,
  },
  statementTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#114B3E",
  },
  textInputArea: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: "#0F172A",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  submitBtn: {
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
  submitBtnText: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
