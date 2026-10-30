import React, {useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, AppIcon} from "../../components/common";
import {useAuth} from "../../context/AuthContext";
import {useCertificates, useDeleteCertificate, useDeleteWorkHistory, useWorkHistory} from "../../hooks/queries";

const KYC_LABEL: Record<string, string> = {approved: "✔ Verified", submitted: "⏳ Under review", rejected: "✖ Rejected", pending: "Pending"};

export const DocumentsCertificatesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {partner} = useAuth();

  const deleteWork = useDeleteWorkHistory();
  const deleteCert = useDeleteCertificate();
  const workHistory = (useWorkHistory().data ?? []).map(w => ({id: w.id, company: w.salonName, role: w.role, tenure: w.years ?? ""}));
  const certifications = (useCertificates().data ?? []).map(c => ({id: c.id, title: c.title, academy: c.issuer, issueDate: c.issueDate ?? ""}));

  const handleDeleteWork = useCallback((id: string) => {
    Alert.alert("Remove Work Experience", "Are you sure you want to remove this record?", [
      {text: "Cancel", style: "cancel"},
      {text: "Remove", style: "destructive", onPress: () => deleteWork.mutate(id)},
    ]);
  }, [deleteWork]);

  const handleDeleteCert = useCallback((id: string) => {
    Alert.alert("Remove Certification", "Are you sure you want to remove this certificate?", [
      {text: "Cancel", style: "cancel"},
      {text: "Remove", style: "destructive", onPress: () => deleteCert.mutate(id)},
    ]);
  }, [deleteCert]);

  // Every add/delete is already saved server-side; this just closes the screen.
  const handleSave = useCallback(() => navigation.goBack(), [navigation]);

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
        {/* DOCUMENTS SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <TouchableOpacity
            style={styles.addBtnRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("VerificationCenter")}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* AADHAAR CARD */}
        <View style={styles.docCard}>
          <View style={styles.docLeftAccent} />
          <View style={styles.docThumbBox}>
            <AppIcon name="documents" size={20} color="#114B3E" />
          </View>
          <View style={styles.docInfoCol}>
            <Text style={styles.docTitle}>Aadhar Card</Text>
            <Text style={styles.docSub}>Front , Back</Text>
          </View>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>{KYC_LABEL[partner?.kycStatus ?? "pending"]}</Text>
          </View>
        </View>

        {/* WORK HISTORY SECTION */}
        <View style={[styles.sectionHeaderRow, {marginTop: 18}]}>
          <Text style={styles.sectionTitle}>Work History</Text>
          <TouchableOpacity
            style={styles.addBtnRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("AddWorkExperience")}
          >
            <Text style={styles.addBtnText}>+ Add Work</Text>
          </TouchableOpacity>
        </View>

        {workHistory.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemLeftAccent} />
            <View style={styles.itemInfoCol}>
              <Text style={styles.itemTitle}>{item.company}</Text>
              <Text style={styles.itemRole}>{item.role}</Text>
              <Text style={styles.itemTenure}>{item.tenure}</Text>
            </View>
            <TouchableOpacity
              style={styles.trashBtn}
              activeOpacity={0.7}
              onPress={() => handleDeleteWork(item.id)}
            >
              <AppIcon name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* CERTIFICATIONS SECTION */}
        <View style={[styles.sectionHeaderRow, {marginTop: 18}]}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <TouchableOpacity
            style={styles.addBtnRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("AddCertificate")}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {certifications.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemLeftAccent} />
            <View style={styles.certThumbBox}>
              <AppIcon name="documents" size={20} color="#114B3E" />
            </View>
            <View style={styles.itemInfoCol}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemRole}>{item.academy}</Text>
              <Text style={styles.itemTenure}>{item.issueDate}</Text>
            </View>
            <TouchableOpacity
              style={styles.trashBtn}
              activeOpacity={0.7}
              onPress={() => handleDeleteCert(item.id)}
            >
              <AppIcon name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* CANCEL & SAVE BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  addBtnRow: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  docCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
    overflow: "hidden",
    marginBottom: 10,
  },
  docLeftAccent: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3.5,
    backgroundColor: "#114B3E",
    borderRadius: 2,
  },
  docThumbBox: {
    width: 50,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    marginRight: 12,
  },
  docThumbIcon: {
    fontSize: 24,
  },
  docInfoCol: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  docSub: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 1,
  },
  docDate: {
    fontSize: 11,
    color: "#94A3B8",
  },
  verifiedTag: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
    overflow: "hidden",
    marginBottom: 10,
  },
  itemLeftAccent: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3.5,
    backgroundColor: "#114B3E",
    borderRadius: 2,
  },
  certThumbBox: {
    width: 44,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    marginRight: 10,
  },
  certThumbIcon: {
    fontSize: 22,
  },
  itemInfoCol: {
    flex: 1,
    marginLeft: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  itemRole: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 1,
  },
  itemTenure: {
    fontSize: 11,
    color: "#94A3B8",
  },
  trashBtn: {
    padding: 8,
  },
  trashIcon: {
    fontSize: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#114B3E",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#114B3E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
