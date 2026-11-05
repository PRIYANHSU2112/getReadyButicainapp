import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {SERVICE_OTP_MAX_LENGTH, SERVICE_OTP_MIN_LENGTH} from "../../constants/otp";
import {useBooking} from "../../context/BookingContext";
import {useAddOnCashCollected, useBookingDetail} from "../../hooks/queries";

const formatDuration = (fromIso?: string) => {
  if (!fromIso) return "—";
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(fromIso)) / 60000));
  const h = Math.floor(minutes / 60);
  return h > 0 ? `${h} hr ${minutes % 60} min` : `${minutes} min`;
};

type Props = NativeStackScreenProps<RootStackParamList, "EndOtp">;

export const EndOtpScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {bookingId} = route.params;
  const {verifyEndOtp} = useBooking();
  // Polls so the payment card clears as soon as the customer pays online or from their wallet.
  const {data: booking, refetch} = useBookingDetail(bookingId, 5000);
  const cashCollected = useAddOnCashCollected();
  const amountDue = booking?.addOnAmountDue ?? 0;
  const totalCharge = booking?.totalAmount ?? 0;

  const handleCashCollected = () => {
    Alert.alert(
      "Cash collected?",
      `Confirm you received ₹${amountDue.toLocaleString("en-IN")} in cash for the added services.`,
      [
        {text: "Not yet", style: "cancel"},
        {
          text: "Yes, collected",
          onPress: () =>
            cashCollected.mutateAsync(bookingId).then(
              () => refetch(),
              (error: unknown) =>
                Alert.alert("Not recorded", error instanceof Error ? error.message : "Please try again."),
            ),
        },
      ],
    );
  };

  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const isOtpComplete = otp.length >= SERVICE_OTP_MIN_LENGTH;

  const handleKeyPress = (digit: string) => {
    if (otp.length < SERVICE_OTP_MAX_LENGTH) {
      setOtp(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setOtp(prev => prev.slice(0, -1));
  };

  const handleFinalize = async () => {
    if (otp.length < SERVICE_OTP_MIN_LENGTH || otp.length > SERVICE_OTP_MAX_LENGTH) {
      Alert.alert("Incomplete OTP", "Please collect the completion OTP from the customer.");
      return;
    }

    if (loading || amountDue > 0) return;
    setLoading(true);
    const ok = await verifyEndOtp(bookingId, otp);
    setLoading(false);
    if (!ok) {
      setOtp("");
      const fresh = await refetch();
      Alert.alert(
        "Couldn't finish the service",
        (fresh.data?.addOnAmountDue ?? 0) > 0
          ? "The customer still has to pay for the added services."
          : "Check the OTP with the customer and make sure every service is marked done.",
      );
      return;
    }
    navigation.replace("JobCompleted", {
      bookingId,
      earnings: booking?.payable ?? booking?.totalAmount ?? 0,
    });
  };

  // No resend endpoint: the completion OTP is always visible in the customer's booking screen.
  const handleResend = () => {
    setResending(false);
    setResendStatus("Ask the customer to open their booking in the app — the completion OTP is shown there.");
    setTimeout(() => setResendStatus(null), 5000);
  };

  const digits = Array.from({length: SERVICE_OTP_MAX_LENGTH}, (_, i) => otp[i] || "");

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Check In</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 16) + 24},
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Card: SERVICE SESSION ENDED */}
        <View style={styles.sessionEndedCard}>
          <View style={styles.sessionEndedAccent} />
          <View style={styles.sessionEndedInner}>
            <View style={styles.sessionTopRow}>
              <View style={styles.sessionTitleGroup}>
                <Text style={styles.sessionSubtext}>SERVICE SESSION ENDED</Text>
                <View style={styles.servicesLine}>
                  <Text style={styles.servicesCount}>
                    {booking?.items.length ?? 0} selected service{booking?.items.length === 1 ? "" : "s"}{" "}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("ItemsDetails", {bookingId})}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                  >
                    <Text style={styles.detailsLink}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.checkCircleBadge}>
                <Text style={styles.checkBadgeIcon}>✓</Text>
              </View>
            </View>

            <View style={styles.sessionDivider} />

            <View style={styles.sessionBottomRow}>
              <View style={styles.durationRow}>
                <Text style={styles.clockIcon}>⏱</Text>
                <Text style={styles.durationText}>Duration: {formatDuration(booking?.startedAt)}</Text>
              </View>
              <View style={styles.chargeColumn}>
                <Text style={styles.chargeLabel}>Total Charge</Text>
                <Text style={styles.chargeAmount}>₹{totalCharge.toLocaleString("en-IN")}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment gate: added services must be paid before the End OTP is accepted */}
        {amountDue > 0 && (
          <View style={styles.paymentDueCard}>
            <Text style={styles.paymentDueTitle}>
              Customer must pay ₹{amountDue.toLocaleString("en-IN")} for added services
            </Text>
            <Text style={styles.paymentDueText}>
              They can pay by UPI, card or Glow Wallet in their app. Took cash instead? Confirm it below.
            </Text>
            <TouchableOpacity
              style={styles.cashBtn}
              onPress={handleCashCollected}
              disabled={cashCollected.isPending}
              activeOpacity={0.85}>
              {cashCollected.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.cashBtnText}>Cash Collected ₹{amountDue.toLocaleString("en-IN")}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Shield Icon Badge */}
        <View style={styles.shieldWrapper}>
          <View style={styles.shieldCircle}>
            <Text style={styles.shieldIcon}>🛡️</Text>
          </View>
        </View>

        {/* Headline & Instructions */}
        <Text style={styles.mainTitle}>Enter Completion OTP</Text>
        <Text style={styles.mainSubtitle}>
          Collect the completion OTP from the customer to finalize the appointment and initiate the payment transfer.
        </Text>

        {/* OTP Input Field Box Area */}
        <View style={styles.otpSection}>
          <Text style={styles.enterOtpLabel}>Enter OTP</Text>
          <View style={styles.otpBoxesRow}>
            {digits.map((digit, index) => {
              const isFilled = digit !== "";
              const isCurrent = otp.length === index;
              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    isCurrent && styles.otpBoxActive,
                    isFilled && styles.otpBoxFilled,
                  ]}
                >
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Status Alert if Resent */}
        {resendStatus && (
          <View style={styles.resendStatusBanner}>
            <Text style={styles.resendStatusText}>✓ {resendStatus}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Finalize Button */}
          <TouchableOpacity
            style={[
              styles.finalizeBtn,
              isOtpComplete && amountDue === 0 ? styles.finalizeBtnActive : styles.finalizeBtnDisabled,
            ]}
            onPress={handleFinalize}
            activeOpacity={isOtpComplete ? 0.85 : 1}
            disabled={loading || amountDue > 0}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnContentRow}>
                <Text
                  style={[
                    styles.finalizeBtnText,
                    isOtpComplete ? styles.finalizeBtnTextActive : styles.finalizeBtnTextDisabled,
                  ]}
                >
                  Finalize Service
                </Text>
                <Text style={styles.finalizeBtnArrow}> ▷</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Resend OTP Button */}
          <TouchableOpacity
            style={styles.resendBtn}
            onPress={handleResend}
            activeOpacity={0.7}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator color="#114B3E" size="small" />
            ) : (
              <Text style={styles.resendBtnText}>Resend OTP to Customer</Text>
            )}
          </TouchableOpacity>

          {/* Customer Notification Footnote */}
          <View style={styles.footnoteRow}>
            <Text style={styles.infoIcon}>ⓘ</Text>
            <Text style={styles.footnoteText}>
              Customer receives OTP via SMS and App Notification
            </Text>
          </View>
        </View>

        {/* Quick Numeric Keypad for fast on-screen entry */}
        <View style={styles.keypadWrapper}>
          <View style={styles.keypadRow}>
            {["1", "2", "3"].map(k => (
              <TouchableOpacity
                key={k}
                style={styles.keypadBtn}
                onPress={() => handleKeyPress(k)}
                activeOpacity={0.6}
              >
                <Text style={styles.keypadNum}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {["4", "5", "6"].map(k => (
              <TouchableOpacity
                key={k}
                style={styles.keypadBtn}
                onPress={() => handleKeyPress(k)}
                activeOpacity={0.6}
              >
                <Text style={styles.keypadNum}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {["7", "8", "9"].map(k => (
              <TouchableOpacity
                key={k}
                style={styles.keypadBtn}
                onPress={() => handleKeyPress(k)}
                activeOpacity={0.6}
              >
                <Text style={styles.keypadNum}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            <TouchableOpacity
              style={[styles.keypadBtn, styles.keypadSpecialBtn]}
              onPress={() => setOtp("")}
              activeOpacity={0.6}
            >
              <Text style={styles.keypadSpecialText}>C</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.keypadBtn}
              onPress={() => handleKeyPress("0")}
              activeOpacity={0.6}
            >
              <Text style={styles.keypadNum}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.keypadBtn, styles.keypadSpecialBtn]}
              onPress={handleBackspace}
              activeOpacity={0.6}
            >
              <Text style={styles.keypadSpecialText}>⌫</Text>
            </TouchableOpacity>
          </View>
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
  sessionEndedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  sessionEndedAccent: {
    width: 5,
    backgroundColor: "#114B3E",
  },
  sessionEndedInner: {
    flex: 1,
    padding: 16,
  },
  sessionTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  sessionTitleGroup: {
    flex: 1,
  },
  sessionSubtext: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  servicesLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  servicesCount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  detailsLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0284C7",
    textDecorationLine: "underline",
  },
  checkCircleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E6F4EA",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  checkBadgeIcon: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0A7C4E",
  },
  sessionDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  sessionBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  durationText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  chargeColumn: {
    alignItems: "flex-end",
  },
  chargeLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  chargeAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: "#114B3E",
    marginTop: 1,
  },
  paymentDueCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FDBA74",
    padding: 14,
    marginBottom: 16,
  },
  paymentDueTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#9A3412",
  },
  paymentDueText: {
    fontSize: 12.5,
    color: "#7C2D12",
    marginTop: 4,
    lineHeight: 18,
  },
  cashBtn: {
    marginTop: 12,
    backgroundColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cashBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  shieldWrapper: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  shieldCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E6F7F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1F0E0",
  },
  shieldIcon: {
    fontSize: 30,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginTop: 14,
  },
  mainSubtitle: {
    fontSize: 13.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  otpSection: {
    alignItems: "center",
    marginTop: 24,
  },
  enterOtpLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  otpBoxesRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "center",
    gap: 8,
  },
  // Boxes share the row, so six fit even on a narrow phone; maxWidth keeps them tidy on wide ones.
  otpBox: {
    flex: 1,
    maxWidth: 46,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  otpBoxActive: {
    borderColor: "#114B3E",
    backgroundColor: "#F0FAF5",
  },
  otpBoxFilled: {
    borderColor: "#114B3E",
  },
  otpDigit: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  resendStatusBanner: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 14,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  resendStatusText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#065F46",
    textAlign: "center",
  },
  actionsContainer: {
    marginTop: 26,
  },
  finalizeBtn: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  finalizeBtnDisabled: {
    backgroundColor: "#8BA69D", // Muted state matching Home-6.png
  },
  finalizeBtnActive: {
    backgroundColor: "#114B3E", // Active state matching Home-7.png
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  finalizeBtnText: {
    fontSize: 15.5,
    fontWeight: "700",
  },
  finalizeBtnTextDisabled: {
    color: "#E2E8F0",
  },
  finalizeBtnTextActive: {
    color: "#FFFFFF",
  },
  finalizeBtnArrow: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resendBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#114B3E",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  resendBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  footnoteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 10,
  },
  infoIcon: {
    fontSize: 12,
    color: "#94A3B8",
    marginRight: 6,
  },
  footnoteText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  keypadWrapper: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  keypadBtn: {
    flex: 1,
    height: 48,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  keypadSpecialBtn: {
    backgroundColor: "#F1F5F9",
  },
  keypadNum: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  keypadSpecialText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#475569",
  },
});
