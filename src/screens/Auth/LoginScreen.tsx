import React, {useState, useCallback} from "react";
import {palette} from "../../theme";
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
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {RootStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {IMAGES} from "../../constants/images";

const {height: SCREEN_HEIGHT} = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export const LoginScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {phoneNumber, setPhoneNumber, loginWithPhone} = useAuth();

  const [phone, setPhone] = useState(phoneNumber || "");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Strictly sanitize input to digits only & max 10 characters
  const handleTextChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(cleaned);
    if (error) setError("");
  }, [error]);

  const handleGetOtp = useCallback(async () => {
    if (loading) return; // Prevent double taps

    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setError("");
    setLoading(true);

    try {
      setPhoneNumber(phone);
      await loginWithPhone(phone);
      setLoading(false);
      navigation.navigate("OTPVerification", {phoneNumber: phone});
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Failed to send OTP. Please check your network.");
    }
  }, [loading, phone, setPhoneNumber, loginWithPhone, navigation]);

  return (
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle="dark-content"
        {...({translucent: true, backgroundColor: "transparent"} as any)}
      />

      {/* Full Background Asset (loginOne.png with top beauticians, V-canopy, logo & bottom doodles) */}
      <Image
        source={IMAGES.LOGIN_ONE}
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
          {/* Spacer allowing the top photo and centered GET READY logo to be visible */}
          <View style={styles.heroSpacer} />

          {/* Form Content Area */}
          <View style={styles.formContent}>
            {/* Title */}
            <Text
              maxFontSizeMultiplier={1.3}
              style={styles.welcomeTitle}>
              Welcome, Beautician.
            </Text>

            {/* Subtitle */}
            <Text
              maxFontSizeMultiplier={1.3}
              style={styles.subtitleText}>
              Enter your registered mobile number to{"\n"}continue to your dashboard.
            </Text>

            {/* Phone Number Input Section */}
            <View style={styles.phoneSection}>
              <Text
                maxFontSizeMultiplier={1.3}
                style={styles.phoneLabel}>
                Phone Number
              </Text>

              <View style={styles.inputRow}>
                {/* Left +91 Country Code Box */}
                <View
                  style={[
                    styles.countryCodeBox,
                    isFocused && styles.inputFocusedBorder,
                  ]}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>

                {/* Right Phone Number Input Box */}
                <View
                  style={[
                    styles.phoneInputBox,
                    isFocused && styles.inputFocusedBorder,
                    Boolean(error) && styles.inputErrorBorder,
                  ]}>
                  <TextInput
                    value={phone}
                    onChangeText={handleTextChange}
                    placeholder="98765 43210"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    maxLength={10}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={styles.textInput}
                    accessible
                    accessibilityLabel="10-digit mobile number input"
                    accessibilityHint="Enter your 10 digit phone number to receive OTP"
                  />
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={styles.errorText}>
                  {error}
                </Text>
              ) : null}

              {/* Get OTP Button (Figma Deep Emerald Green) */}
              <TouchableOpacity
                onPress={handleGetOtp}
                activeOpacity={0.85}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Get OTP"
                style={[styles.getOtpButton, loading && styles.buttonDisabled]}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.getOtpButtonText}>Get OTP</Text>
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
    paddingTop: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.brand.green, // Figma: deep green bold title
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 13,
    lineHeight: 18.5,
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
  },
  phoneSection: {
    width: "100%",
  },
  phoneLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  countryCodeBox: {
    width: 60,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  phoneInputBox: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  inputFocusedBorder: {
    borderColor: palette.brand.green,
  },
  inputErrorBorder: {
    borderColor: "#EF4444",
  },
  textInput: {
    height: "100%",
    fontSize: 15,
    color: "#1F2937",
    letterSpacing: 1,
    padding: 0,
  },
  errorText: {
    marginTop: 6,
    marginLeft: 2,
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  getOtpButton: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    backgroundColor: palette.brand.green, // Deep emerald green matching Figma
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: palette.brand.green,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  getOtpButtonText: {
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
    color: palette.brand.green, // Deep emerald accent
    fontWeight: "600",
  },
});
