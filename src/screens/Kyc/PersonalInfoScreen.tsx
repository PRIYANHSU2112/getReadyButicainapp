import React, {useState, useRef} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {KycStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {useUpdateMe} from "../../hooks/queries";
import {toApiGender} from "../../services/partnerService";
import {kycService} from "../../services/kycService";
import {dmyToIso} from "../../utils/date";
import {isLocalFile} from "../../utils/files";
import {toast} from "../../components/common/Toast";
import {
  OnboardingHeader,
  AvatarUploadPicker,
  DropdownSelect,
  CalendarDatePickerModal,
  LanguageChipGroup,
} from "../../components/onboarding";

type Props = NativeStackScreenProps<KycStackParamList, "PersonalInfo">;

export const PersonalInfoScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {partner, updatePartner} = useAuth();
  const updateMe = useUpdateMe();

  const isoToDmy = (v?: string) => {
    if (!v) return "";
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) return v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? "" : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  // Form State
  const [avatarUri, setAvatarUri] = useState<string | null>(partner?.avatar ?? null);
  const [fullName, setFullName] = useState(partner?.fullName ?? "");
  const [email, setEmail] = useState(partner?.email ?? "");
  const [gender, setGender] = useState(partner?.gender ? partner.gender.charAt(0).toUpperCase() + partner.gender.slice(1).toLowerCase() : "Female");
  const [dob, setDob] = useState(isoToDmy(partner?.dob));
  const [phone, setPhone] = useState(partner?.phoneNumber?.replace("+91 ", "") ?? "");
  const [isPhoneEditing, setIsPhoneEditing] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["1", "1", "1", "1"]);
  const [languages, setLanguages] = useState<string[]>(partner?.languages ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const otpInputs = useRef<Array<any>>([]);

  // Phone is the login identity; there is no change-number endpoint.
  const handlePhoneAction = () => {
    toast.info("Your mobile number is your login ID and can't be changed here. Contact support to update it.");
  };

  const handleOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);
    if (cleaned && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleSaveOtp = () => {
    setShowOtpSection(false);
    setIsPhoneEditing(false);
    Alert.alert("Phone Verified", "Your mobile number has been updated & verified successfully.");
  };

  const handleAddLanguage = (lang: string) => {
    if (!languages.includes(lang)) {
      setLanguages(prev => [...prev, lang]);
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(prev => prev.filter(l => l !== lang));
  };

  const handleSaveAndContinue = async () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Please enter your full legal name";
    if (!email.trim() || !email.includes("@")) newErrors.email = "Please enter a valid email address";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dobIso = dob.trim() ? dmyToIso(dob) : null;
    if (dob.trim() && !dobIso) newErrors.dob = "Please enter date of birth as DD/MM/YYYY";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (updateMe.isPending) return;

    setErrors({});
    try {
      await updateMe.mutateAsync({
        name: fullName.trim(),
        email: email.trim(),
        gender: toApiGender(gender),
        dob: dobIso ?? undefined,
        languages,
      });
      if (isLocalFile(avatarUri)) {
        await kycService.ensureProfile();
        await kycService.uploadKycFiles({profilePhoto: avatarUri!});
      }
      updatePartner({fullName, email, gender, dob: dobIso ?? undefined, languages, avatar: avatarUri ?? undefined});
      navigation.navigate("PrimaryAddress");
    } catch {
      // error toast raised by the API layer
    }
  };

  return (
    <View style={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        {/* Onboarding Header with Step 1 of 7 progress */}
        <OnboardingHeader
          title="Profile Creation"
          stepNumber={1}
          totalSteps={7}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: Math.max(insets.bottom + 20, 32)},
          ]}
          keyboardShouldPersistTaps="handled">
          {/* Title & Subtitle */}
          <View style={styles.titleSection}>
            <Text
              maxFontSizeMultiplier={1.3}
              style={styles.mainTitle}>
              Personal Details
            </Text>
            <Text
              maxFontSizeMultiplier={1.3}
              style={styles.subTitle}>
              Tell us a bit about yourself to complete your profile.
            </Text>
          </View>

          {/* Profile Photo Avatar Upload Picker */}
          <AvatarUploadPicker
            imageUri={avatarUri}
            onImageSelected={setAvatarUri}
          />

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={t => {
                  setFullName(t);
                  if (errors.fullName) setErrors(prev => ({...prev, fullName: ""}));
                }}
                placeholder="Eg. Aisha sheikh"
                placeholderTextColor="#9CA3AF"
                style={[
                  styles.textInput,
                  Boolean(errors.fullName) && styles.inputErrorBorder,
                ]}
              />
              {errors.fullName ? (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              ) : null}
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={t => {
                  setEmail(t);
                  if (errors.email) setErrors(prev => ({...prev, email: ""}));
                }}
                placeholder="Eg. Aisha sheikh"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.textInput,
                  Boolean(errors.email) && styles.inputErrorBorder,
                ]}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Gender Dropdown */}
            <DropdownSelect
              label="Gender"
              placeholder="Select Gender"
              value={gender}
              options={["Female", "Male", "Others"]}
              onSelect={setGender}
            />

            {/* Date Of Birth Calendar Picker */}
            <CalendarDatePickerModal
              label="Date Of Birth"
              value={dob}
              onChangeDate={setDob}
            />

            {/* Mobile Number Row */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>

                <View style={styles.phoneNumberBox}>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="98765 43210"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    editable={isPhoneEditing}
                    style={styles.phoneInput}
                  />
                  <TouchableOpacity
                    onPress={handlePhoneAction}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={styles.phoneActionText}>
                      {!isPhoneEditing && !showOtpSection
                        ? "CHANGE"
                        : isPhoneEditing && !showOtpSection
                        ? "VERIFY"
                        : "VERIFIED"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Inline Enter OTP Section (Screenshot 4) */}
            {showOtpSection ? (
              <View style={styles.otpInlineCard}>
                <View style={styles.otpHeaderRow}>
                  <Text style={styles.otpLabel}>Enter OTP</Text>
                  <TouchableOpacity onPress={handleSaveOtp}>
                    <Text style={styles.otpSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.otpBoxesRow}>
                  {[0, 1, 2, 3].map(idx => (
                    <TextInput
                      key={idx}
                      ref={ref => {
                        otpInputs.current[idx] = ref;
                      }}
                      value={otpDigits[idx]}
                      onChangeText={t => handleOtpChange(t, idx)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      style={styles.otpBox}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/* Language Known Chips */}
            <LanguageChipGroup
              languages={languages}
              onAddLanguage={handleAddLanguage}
              onRemoveLanguage={handleRemoveLanguage}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSaveAndContinue}
              accessibilityRole="button"
              accessibilityLabel="Save and Continue"
              style={styles.saveContinueBtn}>
              <Text style={styles.saveContinueText}>Save and Continue →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.2,
  },
  subTitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 4,
  },
  formSection: {
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1F2937",
  },
  inputErrorBorder: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
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
  phoneNumberBox: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#1F2937",
    padding: 0,
  },
  phoneActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#114B3E", // Deep emerald
    letterSpacing: 0.3,
  },
  otpInlineCard: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  otpHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  otpSaveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 240,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  bottomActions: {
    marginTop: 10,
    alignItems: "center",
  },
  saveContinueBtn: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#114B3E", // Deep emerald
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveContinueText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  backBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  backBtnText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#4B5563",
  },
});
