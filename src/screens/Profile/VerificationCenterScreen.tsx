import React, {useCallback, useState} from "react";
import {
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {RootStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {IMAGES} from "../../constants/images";

type Props = NativeStackScreenProps<RootStackParamList, "VerificationCenter">;

type VerificationStatus = "under_review" | "approved" | "rejected";

export const VerificationCenterScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {partner, reloadPartner} = useAuth();

  // The view is driven only by the server's verdict. It is never set from the UI,
  // otherwise a partner could mark themselves verified.
  const currentStatus: VerificationStatus =
    partner?.kycStatus === "approved"
      ? "approved"
      : partner?.kycStatus === "rejected"
      ? "rejected"
      : "under_review";

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadPartner();
    } catch {
      // Keep showing the last known status; pulling again retries.
    } finally {
      setRefreshing(false);
    }
  }, [reloadPartner]);

  // This button is only rendered when the server has approved the profile, at which
  // point the navigator already exposes MainTabs.
  const handleGoToDashboard = () => {
    navigation.navigate("MainTabs", {screen: "DashboardTab"});
  };

  const handleFixAndResubmit = () => {
    // Navigate into KYC stack to re-upload documents
    (navigation as any).navigate("KycStack", {screen: "IdUpload"});
  };

  const handleContactSupport = () => {
    navigation.navigate("HelpSupport");
  };

  return (
    <View style={styles.screenContainer}>
      {/* Top Navigation Row */}
      <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top, 12)}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text maxFontSizeMultiplier={1.3} style={styles.mainTitle}>
            Verification Center
          </Text>
          <Text maxFontSizeMultiplier={1.3} style={styles.subTitle}>
            Manage your professional credentials and identity status.
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#114B3E" colors={["#114B3E"]} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 24, 36)},
        ]}
        keyboardShouldPersistTaps="handled">
        {/* ========================================================================= */}
        {/* STATE 1: UNDER REVIEW VIEW (Image 1) */}
        {/* ========================================================================= */}
        {currentStatus === "under_review" && (
          <View style={styles.viewSection}>
            <View style={styles.statusRow}>
              <Text style={styles.statusSectionHeading}>Current Status</Text>
              <View style={styles.badgeUnderReview}>
                <Text style={styles.badgeUnderReviewIcon}>↻</Text>
                <Text style={styles.badgeUnderReviewText}>Under Review</Text>
              </View>
            </View>

            {/* Main Review Card matching Image 1 */}
            <View style={styles.reviewCard}>
              {/* Stylist Image in Salon */}
              <View style={styles.stylistImageContainer}>
                <Image
                  source={IMAGES.VERIFICATION_STYLIST}
                  style={styles.stylistImage}
                  resizeMode="cover"
                />
              </View>

              {/* Title & Description */}
              <Text maxFontSizeMultiplier={1.3} style={styles.reviewTitle}>
                Hang tight, we're checking things over!
              </Text>
              <Text maxFontSizeMultiplier={1.3} style={styles.reviewDescription}>
                Our team is currently reviewing your uploaded documents and professional certifications to ensure everyone on Get Ready meets our luxury service standards.
              </Text>

              {/* Estimated Time Pill */}
              <View style={styles.estimatePill}>
                <Text style={styles.estimateClockIcon}>🕒</Text>
                <Text style={styles.estimateText}>Usually takes 24-48 hours</Text>
              </View>

              {/* Divider */}
              <View style={styles.cardDivider} />

              {/* Checklist Items Row */}
              <View style={styles.checklistContainer}>
                <View style={styles.checkItemRow}>
                  <View style={styles.checkSmallCircle}>
                    <Text style={styles.checkSmallMark}>✓</Text>
                  </View>
                  <Text style={styles.checkItemLabel}>ID Verification</Text>
                </View>

                <View style={styles.checkItemRow}>
                  <View style={styles.checkSmallCircle}>
                    <Text style={styles.checkSmallMark}>✓</Text>
                  </View>
                  <Text style={styles.checkItemLabel}>Professional License</Text>
                </View>
              </View>

              <View style={[styles.checklistContainer, {marginTop: 10}]}>
                <View style={styles.checkItemRow}>
                  <View style={styles.checkSmallCircle}>
                    <Text style={styles.checkSmallMark}>✓</Text>
                  </View>
                  <Text style={styles.checkItemLabel}>Insurance Docs</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* STATE 2: VERIFIED VIEW (Image 2) */}
        {/* ========================================================================= */}
        {currentStatus === "approved" && (
          <View style={styles.viewSection}>
            <View style={styles.statusRow}>
              <Text style={styles.statusSectionHeading}>Verified View</Text>
              <View style={styles.badgeApproved}>
                <Text style={styles.badgeApprovedIcon}>✓</Text>
                <Text style={styles.badgeApprovedText}>Approved</Text>
              </View>
            </View>

            {/* Verified Card matching Image 2 */}
            <View style={styles.verifiedCard}>
              <View style={styles.verifiedAccentBar} />
              <View style={styles.verifiedCardContent}>
                <View style={styles.verifiedIconCircle}>
                  <Text style={styles.verifiedCheckMark}>✓</Text>
                </View>
                <View style={styles.verifiedTextGroup}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.verifiedTitle}>
                    You're Verified
                  </Text>
                  <Text maxFontSizeMultiplier={1.3} style={styles.verifiedSubtitle}>
                    Your profile is now visible to clients with the verified badge.
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleGoToDashboard}
              accessibilityRole="button"
              accessibilityLabel="Go To Dashboard"
              style={styles.primaryDarkBtn}>
              <Text style={styles.primaryDarkBtnText}>Go To Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* STATE 3: REJECTION / NEEDS ATTENTION VIEW (Image 3) */}
        {/* ========================================================================= */}
        {currentStatus === "rejected" && (
          <View style={styles.viewSection}>
            <View style={styles.statusRow}>
              <Text style={styles.statusSectionHeading}>Rejection View</Text>
              <View style={styles.badgeRejected}>
                <Text style={styles.badgeRejectedIcon}>!</Text>
                <Text style={styles.badgeRejectedText}>Needs Attention</Text>
              </View>
            </View>

            {/* Rejection Card matching Image 3 */}
            <View style={styles.rejectionCard}>
              <Text maxFontSizeMultiplier={1.3} style={styles.rejectionTitle}>
                Verification Failed
              </Text>
              <Text maxFontSizeMultiplier={1.3} style={styles.rejectionSubtitle}>
                Some of your documents didn't meet our guidelines. Please review the issues below and resubmit.
              </Text>

              {/* Issue 1: Professional License */}
              <View style={styles.issueItemBox}>
                <View style={styles.issueIconCircle}>
                  <Text style={styles.issueIconSymbol}>⚠️</Text>
                </View>
                <View style={styles.issueContentGroup}>
                  <Text style={styles.issueItemTitle}>Professional License</Text>
                  <Text style={styles.issueItemDescription}>
                    Document expired. Please upload a valid, current license issued in the last 12 months.
                  </Text>
                </View>
              </View>

              {/* Issue 2: ID Proof (Back Side) */}
              <View style={styles.issueItemBox}>
                <View style={styles.issueIconCircle}>
                  <Text style={styles.issueIconSymbol}>⚠️</Text>
                </View>
                <View style={styles.issueContentGroup}>
                  <Text style={styles.issueItemTitle}>ID Proof (Back Side)</Text>
                  <Text style={styles.issueItemDescription}>
                    Blurry Image. The text on the back of your ID is illegible. Please use better lighting.
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleFixAndResubmit}
                accessibilityRole="button"
                accessibilityLabel="Fix and Resubmit"
                style={styles.primaryDarkBtn}>
                <Text style={styles.primaryDarkBtnText}>Fix & Resubmit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleContactSupport}
                accessibilityRole="button"
                accessibilityLabel="Contact Support"
                style={styles.outlinedSupportBtn}>
                <Text style={styles.outlinedSupportBtnText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    marginBottom: 4,
  },
  backChevron: {
    fontSize: 26,
    lineHeight: 26,
    color: "#114B3E", // Deep emerald
    fontWeight: "600",
  },
  headerTitleGroup: {
    marginTop: 2,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.4,
  },
  subTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  viewSection: {
    width: "100%",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusSectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  badgeUnderReview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeUnderReviewIcon: {
    fontSize: 12,
    color: "#D97706",
    marginRight: 5,
    fontWeight: "800",
  },
  badgeUnderReviewText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
  },
  badgeApproved: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeApprovedIcon: {
    fontSize: 12,
    color: "#16A34A",
    marginRight: 5,
    fontWeight: "800",
  },
  badgeApprovedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },
  badgeRejected: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeRejectedIcon: {
    fontSize: 12,
    color: "#EF4444",
    marginRight: 5,
    fontWeight: "800",
  },
  badgeRejectedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stylistImageContainer: {
    width: "100%",
    height: 310,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  stylistImage: {
    width: "100%",
    height: "100%",
  },
  reviewTitle: {
    fontSize: 18.5,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginTop: 18,
    lineHeight: 24,
  },
  reviewDescription: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  estimatePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  estimateClockIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  estimateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },
  checklistContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  checkItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkSmallCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  checkSmallMark: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "800",
    lineHeight: 12,
  },
  checkItemLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
  },
  verifiedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  verifiedAccentBar: {
    width: 5,
    height: "100%",
    backgroundColor: "#16A34A",
  },
  verifiedCardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  verifiedIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  verifiedCheckMark: {
    fontSize: 26,
    color: "#16A34A",
    fontWeight: "800",
    lineHeight: 30,
  },
  verifiedTextGroup: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  verifiedSubtitle: {
    fontSize: 12.5,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 17,
  },
  rejectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  rejectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  rejectionSubtitle: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 18,
  },
  issueItemBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  issueIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  issueIconSymbol: {
    fontSize: 16,
  },
  issueContentGroup: {
    flex: 1,
  },
  issueItemTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
  },
  issueItemDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 16,
  },
  primaryDarkBtn: {
    backgroundColor: "#114B3E",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryDarkBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  outlinedSupportBtn: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#114B3E",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  outlinedSupportBtnText: {
    color: "#114B3E",
    fontSize: 14,
    fontWeight: "600",
  },
});
