import React, {useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, AppIcon} from "../../components/common";
import {useBankDetails} from "../../hooks/queries";

export const BankDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const b = useBankDetails().data;
  const verified = String(b?.status ?? b?.verificationStatus ?? "").toUpperCase() === "VERIFIED";

  const handleRequestChange = useCallback(() => {
    navigation.navigate("EditBankDetails");
  }, [navigation]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Profile Creation"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 40, 60)},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* PAYOUT TIMING NOTICE */}
        <View style={styles.noticeBox}>
          <View style={styles.noticeIconBox}>
            <AppIcon name="info" size={16} color="#64748B" />
          </View>
          <Text style={styles.noticeText}>
            Payouts are processed automatically every Monday. Please note that any
            changes to bank details require admin approval (24-48 hours).
          </Text>
        </View>

        {/* PRIMARY SETTLEMENT BANK TITLE */}
        <Text style={styles.sectionTitle}>Primary Settlement Bank</Text>
        <Text style={styles.sectionSubtitle}>
          Verified account for service revenue payouts.
        </Text>

        {/* BANK CARD */}
        <View style={styles.bankCard}>
          <View style={styles.bankHeaderRow}>
            <View style={styles.bankIconBox}>
              <AppIcon name="bank" size={20} color="#114B3E" />
            </View>
            <View style={styles.bankInfoCol}>
              <Text style={styles.bankName}>{b?.bankName || (b ? "Bank Account" : "No bank linked")}</Text>
              <Text style={styles.accountType}>{b?.branchName || "Savings Account"}</Text>
            </View>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedText}>{verified ? "VERIFIED" : b ? "PENDING" : "—"}</Text>
            </View>
          </View>

          <Text style={styles.holderLabel}>ACCOUNT HOLDER</Text>
          <Text style={styles.holderName}>{b?.accountHolderName ?? "—"}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>ACCOUNT NUMBER</Text>
              <Text style={styles.detailValue}>{b?.accountNumber ? `•••• ${String(b.accountNumber).slice(-4)}` : "—"}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>IFSC CODE</Text>
              <Text style={styles.detailValue}>{b?.ifscCode ?? "—"}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.depositRow}>
            <AppIcon name="privacy" size={15} color="#10B981" />
            <Text style={styles.depositText}>Direct deposit enabled</Text>
          </View>
        </View>

        {/* PASSBOOK IMAGE PREVIEW */}
        <View style={styles.passbookPreviewBox}>
          <AppIcon name="documents" size={24} color="#64748B" />
          <Text style={styles.passbookLabel}>Bank Passbook / Cheque</Text>
          <Text style={styles.passbookSub}>Verified copy on file</Text>
        </View>

        {/* OPTIONAL DIVIDER */}
        <View style={styles.optionalDividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.optionalText}>OPTIONAL</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* UPI ID SECTION */}
        <Text style={styles.upiSectionTitle}>UPI ID</Text>
        <View style={styles.upiCard}>
          <View style={styles.upiIconBox}>
            <AppIcon name="wallet" size={20} color="#114B3E" />
          </View>
          <View style={styles.upiInfoCol}>
            <Text style={styles.upiIdText}>{b?.upiId || "Not added"}</Text>
            <Text style={styles.upiSub}>Primary UPI for instant transfers</Text>
          </View>
          <TouchableOpacity
            onPress={handleRequestChange}
            activeOpacity={0.7}
          >
            <Text style={styles.upiEditBtn}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* SECURITY ENCRYPTION NOTE */}
        <View style={styles.securityRow}>
          <AppIcon name="privacy" size={14} color="#64748B" />
          <Text style={styles.securityText}>
            Your financial data is encrypted and stored securely according to PCI-DSS standards.
          </Text>
        </View>

        {/* REQUEST ACCOUNT CHANGE BUTTON */}
        <TouchableOpacity
          style={styles.requestChangeBtn}
          activeOpacity={0.8}
          onPress={handleRequestChange}
        >
          <Text style={styles.requestChangeBtnText}>Request Account Change</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  noticeBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  noticeIconBox: {
    marginRight: 10,
    marginTop: 2,
  },
  noticeText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 14,
  },
  bankCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 16,
  },
  bankHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bankIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bankIcon: {
    fontSize: 20,
  },
  bankInfoCol: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  accountType: {
    fontSize: 12,
    color: "#64748B",
  },
  verifiedPill: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.4,
  },
  holderLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  holderName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  depositRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  depositIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  depositText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#114B3E",
  },
  passbookPreviewBox: {
    height: 150,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginBottom: 16,
  },
  passbookIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  passbookLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0369A1",
    marginBottom: 2,
  },
  passbookSub: {
    fontSize: 11,
    color: "#0284C7",
  },
  optionalDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  optionalText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginHorizontal: 12,
    letterSpacing: 0.8,
  },
  upiSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  upiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
  },
  upiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  upiIcon: {
    fontSize: 18,
  },
  upiInfoCol: {
    flex: 1,
  },
  upiIdText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  upiSub: {
    fontSize: 11.5,
    color: "#64748B",
  },
  upiEditBtn: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E11D48",
    padding: 4,
  },
  securityRow: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  lockIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  securityText: {
    fontSize: 11.5,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 16,
  },
  requestChangeBtn: {
    backgroundColor: "#114B3E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  requestChangeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
