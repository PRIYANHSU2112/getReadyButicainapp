import React, {useState, useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {KycStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {OnboardingHeader} from "../../components/onboarding";
import {IMAGES} from "../../constants/images";
import {mediaService} from "../../services/mediaService";
import {kycService} from "../../services/kycService";
import {useSaveBankDetails} from "../../hooks/queries";
import {IFSC_PLACEHOLDER, ifscError, isValidIfsc, normalizeIfsc, useIfscLookup} from "../../utils/ifsc";
import {isLocalFile} from "../../utils/files";
import {toast} from "../../components/common/Toast";

type Props = NativeStackScreenProps<KycStackParamList, "BankDetails">;

export const BankDetailsScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {partner, updatePartner} = useAuth();
  const saveBank = useSaveBankDetails();

  const [accountHolderName, setAccountHolderName] = useState(
    partner?.bankDetails?.accountHolderName || partner?.fullName || ""
  );
  const [accountNumber, setAccountNumber] = useState(
    partner?.bankDetails?.accountNumber || ""
  );
  const [ifscCode, setIfscCode] = useState(normalizeIfsc(partner?.bankDetails?.ifscCode || ""));
  const [upiId, setUpiId] = useState(
    partner?.bankDetails?.upiId || ""
  );
  const [passbookUri, setPassbookUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Real bank/branch lookup once the IFSC is well-formed.
  const ifscLookup = useIfscLookup(ifscCode);
  const getFetchedBankName = useCallback(() => {
    if (!isValidIfsc(ifscCode)) return null;
    if (ifscLookup.isFetching) return "Looking up bank…";
    if (ifscLookup.data) return `${ifscLookup.data.BANK} - ${ifscLookup.data.BRANCH} ✓`;
    if (ifscLookup.data === null) return "IFSC not found — please double-check";
    return null;
  }, [ifscCode, ifscLookup.isFetching, ifscLookup.data]);

  const handlePickPassbook = () => {
    Alert.alert(
      "Upload Passbook / Cheque",
      "Select capture method for bank passbook or cancelled cheque:",
      [
        {
          text: "Take Photo (Camera)",
          onPress: async () => {
            const media = await mediaService.openCamera({
              width: 1200,
              height: 800,
              cropping: true,
            });
            if (media?.path) {
              setPassbookUri(media.path);
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const media = await mediaService.openGallery({
              width: 1200,
              height: 800,
              cropping: true,
            });
            if (media?.path) {
              setPassbookUri(media.path);
            }
          },
        },
        {text: "Cancel", style: "cancel"},
      ]
    );
  };

  const handleSaveAndContinue = async () => {
    if (saveBank.isPending) return;
    const newErrors: Record<string, string> = {};

    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }
    if (!accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (accountNumber.trim().length < 8) {
      newErrors.accountNumber = "Please enter a valid bank account number";
    }
    const ifscMsg = ifscError(ifscCode);
    if (ifscMsg) newErrors.ifscCode = ifscMsg;
    else if (ifscLookup.data === null) newErrors.ifscCode = "This IFSC code doesn't match any bank branch";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const bankDetails = {
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode,
      bankName: ifscLookup.data?.BANK ?? "",
      upiId: upiId.trim() || undefined,
    };
    try {
      await kycService.ensureProfile();
      await saveBank.mutateAsync({...bankDetails, passbookUri: isLocalFile(passbookUri) ? passbookUri! : undefined});
      updatePartner({bankDetails});
      toast.success("Bank details saved");
      navigation.navigate("Selfie");
    } catch {
      // error toast raised by the API layer
    }
  };

  const handleSkip = () => {
    // Allows proceeding in demo or optional mode
    navigation.navigate("Selfie");
  };

  const fetchedBank = getFetchedBankName();

  return (
    <View style={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        {/* Onboarding Header with Step 5 of 7 (71% progress) */}
        <OnboardingHeader
          title="Profile Creation"
          stepNumber={5}
          totalSteps={7}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: Math.max(insets.bottom + 24, 36)},
          ]}
          keyboardShouldPersistTaps="handled">
          {/* Header Title Section matching Screenshot 3 */}
          <View style={styles.titleSection}>
            <Text maxFontSizeMultiplier={1.3} style={styles.mainTitle}>
              Payout Details
            </Text>
            <Text maxFontSizeMultiplier={1.3} style={styles.subTitle}>
              Securely provide your bank information to receive earnings after every successful service.
            </Text>
          </View>

          {/* Field 1: Account Holder Name with User Silhouette Icon */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Account Holder Name</Text>
            <View
              style={[
                styles.inputWithIconBox,
                focusedField === "name" && styles.inputBoxFocused,
                Boolean(errors.accountHolderName) && styles.inputBoxError,
              ]}>
              <TextInput
                value={accountHolderName}
                onChangeText={text => {
                  setAccountHolderName(text);
                  if (errors.accountHolderName) {
                    setErrors(prev => ({...prev, accountHolderName: ""}));
                  }
                }}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                placeholder="As per bank Record"
                placeholderTextColor="#9CA3AF"
                style={styles.inputWithIconText}
                autoCapitalize="words"
                accessibilityLabel="Account Holder Name"
              />
              <Text style={styles.rightIconUser}>👤</Text>
            </View>
            {Boolean(errors.accountHolderName) && (
              <Text style={styles.errorText}>{errors.accountHolderName}</Text>
            )}
          </View>

          {/* Field 2: Account Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Account Number</Text>
            <TextInput
              value={accountNumber}
              onChangeText={text => {
                setAccountNumber(text.replace(/[^0-9]/g, ""));
                if (errors.accountNumber) {
                  setErrors(prev => ({...prev, accountNumber: ""}));
                }
              }}
              onFocus={() => setFocusedField("accountNumber")}
              onBlur={() => setFocusedField(null)}
              placeholder="Eg. 098 765 45234 67"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              style={[
                styles.textInput,
                focusedField === "accountNumber" && styles.inputBoxFocused,
                Boolean(errors.accountNumber) && styles.inputBoxError,
              ]}
              accessibilityLabel="Account Number"
            />
            {Boolean(errors.accountNumber) && (
              <Text style={styles.errorText}>{errors.accountNumber}</Text>
            )}
          </View>

          {/* Field 3: IFSC Code */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>IFSC Code</Text>
            <TextInput
              value={ifscCode}
              onChangeText={text => {
                setIfscCode(normalizeIfsc(text));
                if (errors.ifscCode) {
                  setErrors(prev => ({...prev, ifscCode: ""}));
                }
              }}
              onFocus={() => setFocusedField("ifsc")}
              onBlur={() => {
                setFocusedField(null);
                if (ifscCode) setErrors(prev => ({...prev, ifscCode: ifscError(ifscCode)}));
              }}
              autoCorrect={false}
              placeholder={IFSC_PLACEHOLDER}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={11}
              style={[
                styles.textInput,
                focusedField === "ifsc" && styles.inputBoxFocused,
                Boolean(errors.ifscCode) && styles.inputBoxError,
              ]}
              accessibilityLabel="IFSC Code"
            />
            {Boolean(errors.ifscCode) && (
              <Text style={styles.errorText}>{errors.ifscCode}</Text>
            )}

            {/* Auto-fetch bank note matching Screenshot 3 */}
            <View style={styles.autoFetchBox}>
              <Text style={styles.bankBuildingIcon}>🏛</Text>
              <Text
                style={[
                  styles.autoFetchText,
                  Boolean(fetchedBank) && styles.autoFetchFoundText,
                ]}>
                {fetchedBank || "Bank name will be fetched automatically"}
              </Text>
            </View>
          </View>

          {/* Field 4: Upload Passbook Card matching Screenshot 3 */}
          <View style={styles.passbookSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickPassbook}
              accessibilityRole="button"
              accessibilityLabel="Upload passbook card"
              style={[
                styles.uploadDashedCard,
                Boolean(passbookUri) && styles.uploadDashedCardFilled,
              ]}>
              {passbookUri ? (
                <View style={styles.passbookPreviewContainer}>
                  <Image
                    source={
                      passbookUri === "demo_passbook"
                        ? IMAGES.PASSBOOK_SAMPLE
                        : {uri: passbookUri}
                    }
                    style={styles.passbookPreviewImage}
                    resizeMode="cover"
                  />
                  <View style={styles.passbookVerifiedBadge}>
                    <Text style={styles.passbookVerifiedText}>✓ Attached</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.passbookEmptyPlaceholder}>
                  <Text style={styles.uploadCloudIcon}>☁↑</Text>
                  <Text style={styles.uploadPassbookLabel}>Upload passbook</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickPassbook}
              accessibilityRole="button"
              accessibilityLabel="Upload button"
              style={styles.uploadOutlineBtn}>
              <Text style={styles.uploadOutlineBtnText}>
                {passbookUri ? "Replace Passbook" : "Upload"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider: —— OPTIONAL —— */}
          <View style={styles.optionalDividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.optionalText}>OPTIONAL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Field 5: UPI Id with QR Code Icon */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>UPI Id</Text>
            <View
              style={[
                styles.inputWithIconBox,
                focusedField === "upi" && styles.inputBoxFocused,
              ]}>
              <TextInput
                value={upiId}
                onChangeText={setUpiId}
                onFocus={() => setFocusedField("upi")}
                onBlur={() => setFocusedField(null)}
                placeholder="example@oksbi"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                style={styles.inputWithIconText}
                accessibilityLabel="UPI Id"
              />
              <Text style={styles.rightIconQrcode}>⊞</Text>
            </View>
          </View>

          {/* Bottom Action Buttons matching Screenshot 3 */}
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
              onPress={handleSkip}
              accessibilityRole="button"
              accessibilityLabel="Skip"
              style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>Skip</Text>
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
    paddingTop: 12,
  },
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  inputWithIconBox: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  inputBoxFocused: {
    borderColor: "#114B3E",
    borderWidth: 1.5,
  },
  inputBoxError: {
    borderColor: "#EF4444",
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  rightIconUser: {
    fontSize: 17,
    color: "#9CA3AF",
    opacity: 0.6,
  },
  rightIconQrcode: {
    fontSize: 17,
    color: "#9CA3AF",
  },
  errorText: {
    fontSize: 11.5,
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 2,
  },
  autoFetchBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  bankBuildingIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  autoFetchText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  autoFetchFoundText: {
    color: "#114B3E",
    fontWeight: "600",
  },
  passbookSection: {
    marginTop: 6,
    marginBottom: 12,
  },
  uploadDashedCard: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#FCA5A5",
    borderRadius: 12,
    backgroundColor: "#FFF8F8",
    paddingVertical: 26,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  uploadDashedCardFilled: {
    paddingVertical: 0,
    borderStyle: "solid",
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  passbookEmptyPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadCloudIcon: {
    fontSize: 24,
    color: "#7F1D1D",
    fontWeight: "700",
  },
  uploadPassbookLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
    marginTop: 6,
  },
  passbookPreviewContainer: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  passbookPreviewImage: {
    width: "100%",
    height: "100%",
  },
  passbookVerifiedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  passbookVerifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#137333",
  },
  uploadOutlineBtn: {
    height: 42,
    borderWidth: 1,
    borderColor: "#114B3E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  uploadOutlineBtnText: {
    color: "#114B3E",
    fontSize: 13.5,
    fontWeight: "600",
  },
  optionalDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  optionalText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#9CA3AF",
    marginHorizontal: 12,
  },
  bottomActions: {
    marginTop: 14,
    paddingBottom: 16,
  },
  saveContinueBtn: {
    backgroundColor: "#114B3E",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveContinueText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  skipBtn: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtnText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
});
