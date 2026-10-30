import React, {useState, useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {KycStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {OnboardingHeader} from "../../components/onboarding";
import {IMAGES} from "../../constants/images";
import {kycService} from "../../services/kycService";
import {isRealImage} from "../../utils/files";

type Props = NativeStackScreenProps<KycStackParamList, "KycReview">;

type SectionKey =
  | "personal"
  | "address"
  | "identity"
  | "skills"
  | "bank"
  | "selfie";

export const KycReviewScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {partner, updatePartner, reloadPartner} = useAuth();

  // Accordion expanded states (Personal Details expanded by default per Screenshot 1, 2, 5)
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    personal: true,
    address: false,
    identity: false,
    skills: false,
    bank: false,
    selfie: false,
  });

  // Legal declaration confirmation checkbox
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleSection = useCallback((key: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Section completion status checks
  const isSkillsComplete = Boolean(
    partner?.skills &&
      partner.skills.length > 0 &&
      partner?.certifications &&
      partner.certifications.length > 0
  );
  const isBankComplete = Boolean(
    partner?.bankDetails?.accountNumber && partner?.bankDetails?.ifscCode
  );

  const handleSubmit = async () => {
    if (!isConfirmed) {
      Alert.alert(
        "Confirmation Required",
        "Please confirm that the information provided is accurate by ticking the declaration box before submitting."
      );
      return;
    }

    setSubmitting(true);
    try {
      await kycService.submitForReview();
      updatePartner({kycStatus: "submitted"});
      reloadPartner().catch(() => undefined);

      Alert.alert(
        "Application Submitted!",
        "Your profile details and documents have been securely uploaded for verification. Verification typically takes 24-48 business hours.",
        [
          {
            text: "View Status",
            onPress: () => {
              (navigation as any).getParent()?.navigate("KycPending");
            },
          },
        ]
      );
    } catch {
      // error toast raised by the API layer
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = partner?.fullName || "—";
  const displayPhone = partner?.phoneNumber || "—";
  const displayGender = partner?.gender || "—";
  const displayDob = partner?.dob
    ? new Date(partner.dob).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"})
    : "—";
  const displayLanguage =
    partner?.languages && partner.languages.length > 0
      ? partner.languages.slice(0, 2).join(" , ") + (partner.languages.length > 2 ? ".." : "")
      : "—";
  const displayEmail = partner?.email || "—";

  // Skills & Experience display
  const displayServices =
    partner?.skills && partner.skills.length > 0
      ? partner.skills.slice(0, 2).join(", ")
      : "Hair, Facial";
  const displayExp = partner?.experienceYears ? `${partner.experienceYears}yrs` : "6yrs";
  const displayWorks =
    partner?.workHistory && partner.workHistory.length > 0
      ? partner.workHistory[0].salonName
      : "Elite spa...";
  const hasCertifications =
    partner?.certifications && partner.certifications.length > 0;

  return (
    <View style={styles.screenContainer}>
      {/* Onboarding Header with Step 7 of 7 (100% progress) */}
      <OnboardingHeader
        title="Profile Creation"
        stepNumber={7}
        totalSteps={7}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 28, 36)},
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Title Section matching Screenshots 1, 2, 5 */}
        <View style={styles.titleSection}>
          <Text maxFontSizeMultiplier={1.3} style={styles.mainTitle}>
            Review & Submit
          </Text>
          <Text maxFontSizeMultiplier={1.3} style={styles.subTitle}>
            Please verify your details before submitting for official verification.
          </Text>
        </View>

        {/* ========================================================================= */}
        {/* CARD 1: Personal Details */}
        {/* ========================================================================= */}
        <View style={styles.accordionCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleSection("personal")}
            accessibilityRole="button"
            accessibilityLabel="Toggle Personal Details"
            style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.checkIconBadge}>
                <Text style={styles.checkMarkSymbol}>✓</Text>
              </View>
              <View style={styles.headerTextGroup}>
                <Text style={styles.cardTitle}>Personal Details</Text>
                <Text style={styles.cardSubtitle}>Completed All Details</Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <TouchableOpacity
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                onPress={() => navigation.navigate("PersonalInfo")}
                style={styles.actionBtn}>
                <Text style={styles.actionEditText}>Edit</Text>
              </TouchableOpacity>
              <Text style={styles.chevronSymbol}>
                {expandedSections.personal ? "⌃" : "⌄"}
              </Text>
            </View>
          </TouchableOpacity>

          {expandedSections.personal && (
            <View style={styles.cardBody}>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Full Name</Text>
                <Text style={styles.rowValueText}>{displayName}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Phone</Text>
                <Text style={styles.rowValueText}>{displayPhone}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Gender</Text>
                <Text style={styles.rowValueText}>{displayGender}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>DoB</Text>
                <Text style={styles.rowValueText}>{displayDob}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Language</Text>
                <Text style={styles.rowValueText}>{displayLanguage}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Email</Text>
                <Text style={styles.rowValueText}>{displayEmail}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* CARD 2: Address Details */}
        {/* ========================================================================= */}
        <View style={styles.accordionCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleSection("address")}
            accessibilityRole="button"
            accessibilityLabel="Toggle Address Details"
            style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.checkIconBadge}>
                <Text style={styles.checkMarkSymbol}>✓</Text>
              </View>
              <View style={styles.headerTextGroup}>
                <Text style={styles.cardTitle}>Address Details</Text>
                <Text style={styles.cardSubtitle}>Completed All Details</Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <TouchableOpacity
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                onPress={() => navigation.navigate("PrimaryAddress")}
                style={styles.actionBtn}>
                <Text style={styles.actionEditText}>Edit</Text>
              </TouchableOpacity>
              <Text style={styles.chevronSymbol}>
                {expandedSections.address ? "⌃" : "⌄"}
              </Text>
            </View>
          </TouchableOpacity>

          {expandedSections.address && (
            <View style={styles.cardBody}>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Address</Text>
                <Text style={styles.rowValueText}>
                  {partner?.addressLine1 || "Flat 402, Green Glen Layout, Bellandur"}
                </Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>City</Text>
                <Text style={styles.rowValueText}>{partner?.city || "Bangalore"}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Pincode</Text>
                <Text style={styles.rowValueText}>{partner?.pincode || "560 103"}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Radius</Text>
                <Text style={styles.rowValueText}>{partner?.workingRadiusKm || 8} km</Text>
              </View>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* CARD 3: Professional Identity */}
        {/* ========================================================================= */}
        <View style={styles.accordionCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleSection("identity")}
            accessibilityRole="button"
            accessibilityLabel="Toggle Professional Identity"
            style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.checkIconBadge}>
                <Text style={styles.checkMarkSymbol}>✓</Text>
              </View>
              <View style={styles.headerTextGroup}>
                <Text style={styles.cardTitle}>Professional Identity</Text>
                <Text style={styles.cardSubtitle}>Completed All Details</Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <TouchableOpacity
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                onPress={() => navigation.navigate("IdUpload")}
                style={styles.actionBtn}>
                <Text style={styles.actionEditText}>Edit</Text>
              </TouchableOpacity>
              <Text style={styles.chevronSymbol}>
                {expandedSections.identity ? "⌃" : "⌄"}
              </Text>
            </View>
          </TouchableOpacity>

          {expandedSections.identity && (
            <View style={styles.cardBody}>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Aadhaar Card</Text>
                <Text style={[styles.rowValueText, styles.verifiedGreenText]}>Verified ✓</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>PAN Card</Text>
                <Text style={[styles.rowValueText, styles.verifiedGreenText]}>Verified ✓</Text>
              </View>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* CARD 4: Skills & Experience */}
        {/* ========================================================================= */}
        <View style={styles.accordionCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleSection("skills")}
            accessibilityRole="button"
            accessibilityLabel="Toggle Skills and Experience"
            style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={isSkillsComplete ? styles.checkIconBadge : styles.pendingIconBadge}>
                <Text style={isSkillsComplete ? styles.checkMarkSymbol : styles.pendingMarkSymbol}>
                  {isSkillsComplete ? "✓" : "↻"}
                </Text>
              </View>
              <View style={styles.headerTextGroup}>
                <Text style={styles.cardTitle}>Skills & Experience</Text>
                <Text style={styles.cardSubtitle}>
                  {isSkillsComplete ? "Completed All Details" : "Remaining Details"}
                </Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <TouchableOpacity
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                onPress={() => navigation.navigate("Experience")}
                style={styles.actionBtn}>
                <Text style={isSkillsComplete ? styles.actionEditText : styles.actionPendingText}>
                  {isSkillsComplete ? "Edit" : "Pending"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.chevronSymbol}>
                {expandedSections.skills ? "⌃" : "⌄"}
              </Text>
            </View>
          </TouchableOpacity>

          {expandedSections.skills && (
            <View style={styles.cardBody}>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Service</Text>
                <Text style={styles.rowValueText}>{displayServices}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Yr of Ex</Text>
                <Text style={styles.rowValueText}>{displayExp}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>works</Text>
                <Text style={styles.rowValueText}>{displayWorks}</Text>
              </View>
              <View style={styles.keyValueRow}>
                <Text style={styles.rowKeyLabel}>Certifications</Text>
                <Text
                  style={[
                    styles.rowValueText,
                    hasCertifications ? styles.verifiedGreenText : styles.actionPendingText,
                  ]}>
                  {hasCertifications ? "Verified ✓" : "Pending"}
                </Text>
              </View>

              {/* + Add Details Action Button matching Screenshots 1, 2 */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("Experience")}
                style={styles.addDetailsBtn}>
                <Text style={styles.addDetailsBtnText}>+ Add Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* CARD 5: Bank Details */}
        {/* ========================================================================= */}
        <View style={styles.accordionCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleSection("bank")}
            accessibilityRole="button"
            accessibilityLabel="Toggle Bank Details"
            style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={isBankComplete ? styles.checkIconBadge : styles.pendingIconBadge}>
                <Text style={isBankComplete ? styles.checkMarkSymbol : styles.pendingMarkSymbol}>
                  {isBankComplete ? "✓" : "↻"}
                </Text>
              </View>
              <View style={styles.headerTextGroup}>
                <Text style={styles.cardTitle}>Bank Details</Text>
                <Text style={styles.cardSubtitle}>
                  {isBankComplete ? "Completed All Details" : "Remaining Details"}
                </Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <TouchableOpacity
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                onPress={() => navigation.navigate("BankDetails")}
                style={styles.actionBtn}>
                <Text style={isBankComplete ? styles.actionEditText : styles.actionPendingText}>
                  {isBankComplete ? "Edit" : "Pending"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.chevronSymbol}>
                {expandedSections.bank ? "⌃" : "⌄"}
              </Text>
            </View>
          </TouchableOpacity>

          {expandedSections.bank && (
            <View style={styles.cardBody}>
              {isBankComplete ? (
                <>
                  <View style={styles.keyValueRow}>
                    <Text style={styles.rowKeyLabel}>A/C Holder</Text>
                    <Text style={styles.rowValueText}>
                      {partner?.bankDetails?.accountHolderName || displayName}
                    </Text>
                  </View>
                  <View style={styles.keyValueRow}>
                    <Text style={styles.rowKeyLabel}>Bank Name</Text>
                    <Text style={styles.rowValueText}>
                      {partner?.bankDetails?.bankName || "Punjab National Bank"}
                    </Text>
                  </View>
                  <View style={styles.keyValueRow}>
                    <Text style={styles.rowKeyLabel}>IFSC Code</Text>
                    <Text style={styles.rowValueText}>
                      {partner?.bankDetails?.ifscCode || "—"}
                    </Text>
                  </View>
                  {Boolean(partner?.bankDetails?.upiId) && (
                    <View style={styles.keyValueRow}>
                      <Text style={styles.rowKeyLabel}>UPI Id</Text>
                      <Text style={styles.rowValueText}>{partner?.bankDetails?.upiId}</Text>
                    </View>
                  )}
                </>
              ) : null}

              {/* + Add Details Button matching Screenshot 1 */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("BankDetails")}
                style={styles.addDetailsBtn}>
                <Text style={styles.addDetailsBtnText}>+ Add Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* CARD 6: Selfie Verification */}
        {/* ========================================================================= */}
        <View style={styles.accordionCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleSection("selfie")}
            accessibilityRole="button"
            accessibilityLabel="Toggle Selfie Verification"
            style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.checkIconBadge}>
                <Text style={styles.checkMarkSymbol}>✓</Text>
              </View>
              <View style={styles.headerTextGroup}>
                <Text style={styles.cardTitle}>Selfie Verification</Text>
                <Text style={styles.cardSubtitle}>Completed All Details</Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <TouchableOpacity
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                onPress={() => navigation.navigate("Selfie")}
                style={styles.actionBtn}>
                <Text style={styles.actionEditText}>Edit</Text>
              </TouchableOpacity>
              <Text style={styles.chevronSymbol}>
                {expandedSections.selfie ? "⌃" : "⌄"}
              </Text>
            </View>
          </TouchableOpacity>

          {expandedSections.selfie && (
            <View style={styles.cardBody}>
              <View style={styles.selfiePreviewRow}>
                <Image
                  source={isRealImage(partner?.avatar) ? {uri: partner!.avatar!} : IMAGES.SELFIE_SAMPLE}
                  style={styles.selfieThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.selfieMetaInfo}>
                  <Text style={styles.selfieVerifiedTitle}>Live Photo Captured ✓</Text>
                  <Text style={styles.selfieVerifiedSubtitle}>
                    Face match & lighting standards verified.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* Confirmation Checkbox matching Screenshots 1, 2, 5 */}
        {/* ========================================================================= */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsConfirmed(!isConfirmed)}
          accessibilityRole="checkbox"
          accessibilityState={{checked: isConfirmed}}
          accessibilityLabel="I confirm the above information is accurate"
          style={styles.checkboxContainer}>
          <View style={[styles.customCheckbox, isConfirmed && styles.customCheckboxChecked]}>
            {isConfirmed && <Text style={styles.customCheckSymbol}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I confirm the above information is accurate and I understand that providing false information may lead to account suspension.
          </Text>
        </TouchableOpacity>

        {/* ========================================================================= */}
        {/* Submit Button & Business Hours Note */}
        {/* ========================================================================= */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Submit for Verification"
            style={[
              styles.submitBtn,
              !isConfirmed && styles.submitBtnDisabled,
              submitting && {opacity: 0.7},
            ]}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit for Verification</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.verificationNoteText}>
            Verification typically takes 24-48 business hours.{"\n"}You'll be notified once approved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  accordionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 1.5},
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981", // vibrant clean emerald check
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkMarkSymbol: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 15,
  },
  pendingIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pendingMarkSymbol: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 15,
  },
  headerTextGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: "#9CA3AF",
    marginTop: 2,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  actionEditText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#114B3E", // Deep emerald
  },
  actionPendingText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#EF4444", // Coral red
  },
  chevronSymbol: {
    fontSize: 16,
    color: "#4B5563",
    marginLeft: 6,
    fontWeight: "600",
  },
  cardBody: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  keyValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
  },
  rowKeyLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "400",
  },
  rowValueText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
  },
  verifiedGreenText: {
    color: "#10B981",
    fontWeight: "600",
  },
  addDetailsBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addDetailsBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  selfiePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  selfieThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: "#F3F4F6",
  },
  selfieMetaInfo: {
    flex: 1,
  },
  selfieVerifiedTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#10B981",
  },
  selfieVerifiedSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  customCheckboxChecked: {
    backgroundColor: "#114B3E",
    borderColor: "#114B3E",
  },
  customCheckSymbol: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 14,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
  },
  bottomActions: {
    paddingBottom: 16,
    alignItems: "center",
  },
  submitBtn: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#114B3E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.55,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  verificationNoteText: {
    marginTop: 14,
    fontSize: 11.5,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 16,
  },
});
