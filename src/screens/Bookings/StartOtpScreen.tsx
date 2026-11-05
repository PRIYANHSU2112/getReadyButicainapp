import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {SERVICE_OTP_MAX_LENGTH, SERVICE_OTP_MIN_LENGTH} from "../../constants/otp";
import {useBooking} from "../../context/BookingContext";
import {toast} from "../../components/common/Toast";
import {useBookingDetail} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "StartOtp">;

export const StartOtpScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {bookingId} = route.params;
  const {verifyStartOtp} = useBooking();
  // Shows when the customer has tapped "I'M READY" in their app.
  const customerReady = useBookingDetail(bookingId, 10000).data?.customerReady ?? false;

  const [otp, setOtp] = useState<string>("");
  const [verifying, setVerifying] = useState(false);

  const handleKeyPress = (val: string) => {
    if (otp.length < SERVICE_OTP_MAX_LENGTH) {
      setOtp(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    setOtp(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setOtp("");
  };

  const handleVerify = async () => {
    if (verifying) return;
    if (otp.length < SERVICE_OTP_MIN_LENGTH || otp.length > SERVICE_OTP_MAX_LENGTH) {
      Alert.alert("Incomplete OTP", "Please enter the OTP shared by the customer.");
      return;
    }
    setVerifying(true);
    const ok = await verifyStartOtp(bookingId, otp);
    setVerifying(false);
    if (ok) {
      toast.success("Service started");
      navigation.navigate("ServiceCheckIn", {bookingId});
    } else {
      setOtp("");
      toast.error("Wrong OTP. Ask the customer to check the code in their app.");
    }
  };

  const digits = Array.from({length: SERVICE_OTP_MAX_LENGTH}, (_, i) => otp[i] || "");

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Home-9.png */}
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

      <View style={styles.contentContainer}>
        {/* Shield Icon Badge matching Home-9.png */}
        <View style={styles.shieldBadgeCircle}>
          <Text style={styles.shieldIcon}>🛡️</Text>
        </View>

        {/* Heading & Subtitle */}
        <Text maxFontSizeMultiplier={1.3} style={styles.screenHeading}>
          Enter Customer Start OTP
        </Text>
        <Text maxFontSizeMultiplier={1.3} style={styles.screenSubtitle}>
          Ask the customer for their OTP to begin the service.
        </Text>

        <View style={[styles.readyPill, customerReady ? styles.readyPillOn : styles.readyPillOff]}>
          <Text style={[styles.readyPillText, {color: customerReady ? "#065F46" : "#6B7280"}]}>
            {customerReady ? "✓ Customer is ready (workspace prepared)" : "Customer hasn't marked ready yet"}
          </Text>
        </View>

        {/* OTP Input Label */}
        <Text style={styles.enterOtpLabel}>Enter OTP</Text>

        {/* OTP boxes (count comes from constants/otp) */}
        <View style={styles.otpBoxesRow}>
          {digits.map((digit, idx) => (
            <View
              key={idx}
              style={[
                styles.otpBox,
                digit !== "" && styles.otpBoxFilled,
              ]}>
              <Text style={styles.otpDigitText}>{digit || "•"}</Text>
            </View>
          ))}
        </View>

        {/* Lock Pill Badge matching Home-9.png */}
        <View style={styles.lockBadgePill}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockText}>Service cannot start until verified</Text>
        </View>
      </View>

      {/* Custom Keypad Bottom Sheet matching Home-9.png */}
      <View
        style={[
          styles.keypadContainer,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <View style={styles.keypadGrabber} />

        <View style={styles.keypadGrid}>
          {/* Row 1 */}
          <View style={styles.keypadRow}>
            {["1", "2", "3"].map(num => (
              <TouchableOpacity
                key={num}
                activeOpacity={0.7}
                onPress={() => handleKeyPress(num)}
                style={styles.keypadBtn}>
                <Text style={styles.keypadNumberText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row 2 */}
          <View style={styles.keypadRow}>
            {["4", "5", "6"].map(num => (
              <TouchableOpacity
                key={num}
                activeOpacity={0.7}
                onPress={() => handleKeyPress(num)}
                style={styles.keypadBtn}>
                <Text style={styles.keypadNumberText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row 3 */}
          <View style={styles.keypadRow}>
            {["7", "8", "9"].map(num => (
              <TouchableOpacity
                key={num}
                activeOpacity={0.7}
                onPress={() => handleKeyPress(num)}
                style={styles.keypadBtn}>
                <Text style={styles.keypadNumberText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row 4: Clear, 0, Backspace */}
          <View style={styles.keypadRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClear}
              style={styles.keypadBtn}>
              <Text style={styles.keypadSpecialText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleKeyPress("0")}
              style={styles.keypadBtn}>
              <Text style={styles.keypadNumberText}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBackspace}
              style={styles.keypadBtn}>
              <Text style={styles.keypadIconText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verify Action Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleVerify}
          style={styles.verifyBtn}>
          <Text style={styles.verifyBtnText}>Verify & Start Service</Text>
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
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  shieldBadgeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  shieldIcon: {
    fontSize: 24,
  },
  screenHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  readyPill: {
    alignSelf: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
  },
  readyPillOn: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  readyPillOff: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  readyPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  enterOtpLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  otpBoxesRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  // Boxes share the row, so six fit even on a narrow phone; maxWidth keeps them tidy on wide ones.
  otpBox: {
    flex: 1,
    maxWidth: 46,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFilled: {
    borderColor: "#114B3E",
    backgroundColor: "#F0FDF4",
  },
  otpDigitText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  lockBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  keypadContainer: {
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  keypadGrabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9CA3AF",
    alignSelf: "center",
    marginBottom: 14,
  },
  keypadGrid: {
    gap: 8,
    marginBottom: 16,
  },
  keypadRow: {
    flexDirection: "row",
    gap: 8,
  },
  keypadBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  keypadNumberText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  keypadSpecialText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  keypadIconText: {
    fontSize: 16,
    color: "#0D9488",
    fontWeight: "700",
  },
  verifyBtn: {
    backgroundColor: "#114B3E",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  verifyBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
