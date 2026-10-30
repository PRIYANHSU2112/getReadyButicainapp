import React, {useState, useEffect, useRef, useCallback} from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Text,
  ActivityIndicator,
  NativeSyntheticEvent,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {RootStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {IMAGES} from "../../constants/images";
import {toast} from "../../components/common/Toast";

const {height: SCREEN_HEIGHT} = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "OTPVerification">;

const OTP_LENGTH = 6; // matches backend OTP_LENGTH
const LAST = OTP_LENGTH - 1;

export const OTPScreen: React.FC<Props> = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {verifyOtp, resendOtp} = useAuth();

  const rawPhone = route.params?.phoneNumber || "";
  // Format as: +91 987 654 3210
  const formattedPhone = `+91 ${rawPhone.slice(0, 3)} ${rawPhone.slice(3, 6)} ${rawPhone.slice(6)}`;

  const [otpDigits, setOtpDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);

  const inputs = useRef<Array<any>>([]);

  // Countdown timer for Resend code
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle single digit input or full-code clipboard paste
  const handleDigitChange = useCallback(
    (text: string, index: number) => {
      const cleaned = text.replace(/[^0-9]/g, "");

      // Handle full-code paste
      if (cleaned.length > 1) {
        const pasted = cleaned.slice(0, OTP_LENGTH).split("");
        const newDigits = [...otpDigits];
        pasted.forEach((d, i) => {
          newDigits[i] = d;
        });
        setOtpDigits(newDigits);
        const nextFocus = Math.min(pasted.length, LAST);
        inputs.current[nextFocus]?.focus();
        setFocusedIndex(nextFocus);
        return;
      }

      const newDigits = [...otpDigits];
      newDigits[index] = cleaned;
      setOtpDigits(newDigits);
      if (error) setError("");

      // Auto-advance to next box
      if (cleaned && index < LAST) {
        inputs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    },
    [otpDigits, error]
  );

  // Handle Backspace navigation across boxes
  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<any>, index: number) => {
      if (e.nativeEvent.key === "Backspace") {
        if (!otpDigits[index] && index > 0) {
          inputs.current[index - 1]?.focus();
          setFocusedIndex(index - 1);
          const newDigits = [...otpDigits];
          newDigits[index - 1] = "";
          setOtpDigits(newDigits);
        }
      }
    },
    [otpDigits]
  );

  const handleResend = useCallback(async () => {
    if (!canResend) return;
    setCountdown(30);
    setCanResend(false);
    setError("");
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    try {
      await resendOtp();
      toast.success("A new OTP has been sent");
    } catch (err: any) {
      setError(err?.message || "Could not resend OTP.");
    }
  }, [canResend, resendOtp]);

  const handleVerify = useCallback(async () => {
    if (loading) return;
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== OTP_LENGTH) {
      setError(`Please enter complete ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await verifyOtp(fullOtp);
      setLoading(false);
      // Auth state update triggers RootNavigator conditional screen rendering
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Invalid OTP code. Please try again.");
    }
  }, [loading, otpDigits, verifyOtp]);

  return (
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle="dark-content"
        {...({translucent: true, backgroundColor: "transparent"} as any)}
      />

      {/* Full Background Asset (loginTwo.png with couch scene, V-canopy, logo & bottom doodles) */}
      <Image
        source={IMAGES.LOGIN_TWO}
        style={styles.backgroundImage}
        resizeMode="cover"
        accessible={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: Math.max(insets.bottom + 16, 24)},
          ]}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          {/* Spacer allowing top couch scene and GET READY maroon badge to be visible */}
          <View style={styles.heroSpacer} />

          {/* Form Content Area */}
          <View style={styles.formContent}>
            {/* "We have sent OTP to your number" */}
            <Text
              maxFontSizeMultiplier={1.3}
              style={styles.sentLabel}>
              We have sent OTP to your number
            </Text>

            {/* "+91 987 654 3210 ✎ Via SMS" */}
            <View style={styles.phoneRow}>
              <Text style={styles.phoneNumberText}>{formattedPhone}</Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                accessibilityRole="button"
                accessibilityLabel="Edit phone number">
                <Text style={styles.editIcon}>✎</Text>
              </TouchableOpacity>
              <Text style={styles.viaSmsText}>Via SMS</Text>
            </View>

            {/* "Enter OTP" Heading */}
            <Text
              maxFontSizeMultiplier={1.3}
              style={styles.enterOtpHeading}>
              Enter OTP
            </Text>

            {/* 4 Square Rounded OTP Input Boxes */}
            <View style={styles.otpBoxesRow}>
              {otpDigits.map((_, index) => {
                const isFocused = focusedIndex === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      isFocused && styles.otpBoxFocused,
                      Boolean(error) && styles.otpBoxError,
                    ]}>
                    <TextInput
                      ref={ref => {
                        inputs.current[index] = ref;
                      }}
                      value={otpDigits[index]}
                      onChangeText={text => handleDigitChange(text, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      style={styles.otpInputText}
                      accessible
                      accessibilityLabel={`Digit ${index + 1}`}
                    />
                  </View>
                );
              })}
            </View>

            {/* Error Message */}
            {error ? (
              <Text
                maxFontSizeMultiplier={1.3}
                style={styles.errorText}>
                {error}
              </Text>
            ) : null}

            {/* "Code not Received Yet? Resend" Row */}
            <View style={styles.resendRow}>
              <Text style={styles.resendQuestion}>Code not Received Yet? </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend}
                accessibilityRole="button"
                accessibilityLabel={canResend ? "Resend OTP code" : `Resend in ${countdown} seconds`}>
                <Text
                  style={[
                    styles.resendAction,
                    !canResend && styles.resendDisabled,
                  ]}>
                  {canResend ? "Resend" : `Resend in ${countdown}s`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* "Get OTP" / Verify Action Button (Emerald Green per Figma) */}
            <TouchableOpacity
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Verify OTP"
              style={[styles.verifyButton, loading && styles.buttonDisabled]}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Get OTP</Text>
              )}
            </TouchableOpacity>

            {/* Terms and Conditions Footer */}
            <View style={styles.termsContainer}>
              <Text
                maxFontSizeMultiplier={1.2}
                style={styles.termsText}>
                By signing up you agree to our{" "}
                <Text style={styles.termsHighlight}>Terms and Conditions</Text>{" "}
                of Use.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const HERO_SPACER_HEIGHT = SCREEN_HEIGHT * 0.38;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSpacer: {
    width: "100%",
    height: HERO_SPACER_HEIGHT,
  },
  formContent: {
    paddingHorizontal: 28,
    alignItems: "center",
    paddingTop: 8,
  },
  sentLabel: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  phoneNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0E483A", // Dark emerald
    letterSpacing: 0.2,
  },
  editIcon: {
    fontSize: 14,
    color: "#0E483A",
    marginHorizontal: 5,
  },
  viaSmsText: {
    fontSize: 13,
    color: "#4B5563",
    marginLeft: 2,
  },
  enterOtpHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
    marginVertical: 4,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  otpBoxFocused: {
    borderColor: "#114B3E",
    borderWidth: 2,
  },
  otpBoxError: {
    borderColor: "#EF4444",
  },
  otpInputText: {
    width: "100%",
    height: "100%",
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    padding: 0,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 6,
  },
  resendQuestion: {
    fontSize: 12.5,
    color: "#6B7280",
  },
  resendAction: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#114B3E", // Dark emerald
  },
  resendDisabled: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
  verifyButton: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#114B3E", // Deep emerald green matching Figma
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  termsContainer: {
    marginTop: 18,
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  termsText: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
  termsHighlight: {
    color: "#114B3E",
    fontWeight: "600",
  },
});
