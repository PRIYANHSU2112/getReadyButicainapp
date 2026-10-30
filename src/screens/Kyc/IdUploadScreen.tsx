import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {kycService} from "../../services/kycService";
import {isLocalFile} from "../../utils/files";
import {toast} from "../../components/common/Toast";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {KycStackParamList} from "../../navigation/types";
import {
  OnboardingHeader,
  IdentityDocumentCard,
} from "../../components/onboarding";
import {DocStatus} from "../../components/onboarding/IdentityDocumentCard";

type Props = NativeStackScreenProps<KycStackParamList, "IdUpload">;

export const IdUploadScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();

  const [aadharFrontStatus, setAadharFrontStatus] = useState<DocStatus>("pending");
  const [aadharFrontUri, setAadharFrontUri] = useState<string | null>(null);

  // PAN has no backend field yet — kept on-device only.
  const [panStatus, setPanStatus] = useState<DocStatus>("pending");
  const [panUri, setPanUri] = useState<string | null>(null);

  const [aadharBackStatus, setAadharBackStatus] = useState<DocStatus>("pending");
  const [aadharBackUri, setAadharBackUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveAndContinue = async () => {
    if (saving) return;
    if (!isLocalFile(aadharFrontUri) || !isLocalFile(aadharBackUri)) {
      Alert.alert("Documents Required", "Please upload both the front and back of your Aadhaar card.");
      return;
    }
    setSaving(true);
    try {
      await kycService.ensureProfile();
      await kycService.uploadKycFiles({idCardFront: aadharFrontUri!, idCardBack: aadharBackUri!});
      toast.success("Identity documents uploaded");
      navigation.navigate("Experience");
    } catch {
      // error toast raised by the API layer
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        {/* Onboarding Header with Step 3 of 7 (43% progress) */}
        <OnboardingHeader
          title="Profile Creation"
          stepNumber={3}
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
          {/* Header Title Section */}
          <View style={styles.titleSection}>
            <Text
              maxFontSizeMultiplier={1.3}
              style={styles.mainTitle}>
              Identify Documents
            </Text>
            <Text
              maxFontSizeMultiplier={1.3}
              style={styles.subTitle}>
              Please upload clear photos of your original identity documents. This
              helps us ensure a safe environment for everyone.
            </Text>
          </View>

          {/* Document Card 1: Aadhar front */}
          <IdentityDocumentCard
            title="Aadhar front"
            filename="aadhaar_front_final.jpg"
            status={aadharFrontStatus}
            imageUri={aadharFrontUri}
            sideLabel="Upload Front Side"
            onStatusChange={(status, uri) => {
              setAadharFrontStatus(status);
              setAadharFrontUri(uri);
            }}
          />

          {/* Document Card 2: PAN Card (with blurry rejection example) */}
          <IdentityDocumentCard
            title="PAN Card"
            filename="pan_card_doc.jpg"
            errorMessage="Image is blurry"
            status={panStatus}
            imageUri={panUri}
            sideLabel="Upload PAN Card"
            onStatusChange={(status, uri) => {
              setPanStatus(status);
              setPanUri(uri);
            }}
          />

          {/* Document Card 3: Aadhar Back */}
          <IdentityDocumentCard
            title="Aadhar Back"
            status={aadharBackStatus}
            imageUri={aadharBackUri}
            sideLabel="Upload Back Side"
            onStatusChange={(status, uri) => {
              setAadharBackStatus(status);
              setAadharBackUri(uri);
            }}
          />

          {/* Action Buttons */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSaveAndContinue}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Save and Continue"
              style={styles.saveContinueBtn}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveContinueText}>Save and Continue →</Text>}
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
    marginBottom: 12,
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
  stateToggleBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  toggleBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  toggleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toggleChipActive: {
    backgroundColor: "#E6F4EA",
    borderColor: "#A3E1C1",
  },
  toggleChipText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  toggleChipTextActive: {
    color: "#114B3E",
    fontWeight: "700",
  },
  bottomActions: {
    marginTop: 16,
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
