import React, {useState, useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, toast} from "../../components/common";
import {useAddCertificate} from "../../hooks/queries";
import {mediaService} from "../../services/mediaService";
import {dmyToIso} from "../../utils/date";

export const AddCertificateScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const addCert = useAddCertificate();

  const [certName, setCertName] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [fileUri, setFileUri] = useState<string | null>(null);

  const handleUploadOrReplace = useCallback(() => {
    Alert.alert(
      "Certificate Document",
      "Choose certificate image from camera / gallery.",
      [
        {text: "Camera", onPress: async () => { const m = await mediaService.openCamera({cropping: false}); if (m?.path) setFileUri(m.path); }},
        {text: "Gallery", onPress: async () => { const m = await mediaService.openGallery({cropping: false}); if (m?.path) setFileUri(m.path); }},
        {text: "Cancel", style: "cancel"},
      ]
    );
  }, []);

  const handleSave = useCallback(() => {
    if (addCert.isPending) return;
    const iso = dmyToIso(issueDate);
    if (!certName.trim() || !academyName.trim() || !iso) {
      Alert.alert("Missing details", "Please enter certificate name, academy and a valid issue date (DD/MM/YYYY).");
      return;
    }
    addCert.mutate(
      {title: certName.trim(), issuingOrganization: academyName.trim(), issueDate: iso, fileUri: fileUri ?? undefined},
      {onSuccess: () => { toast.success("Certificate added"); navigation.goBack(); }},
    );
  }, [addCert, certName, academyName, issueDate, fileUri, navigation]);

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
        {/* CERTIFICATE NAME */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Certificate Name</Text>
          <TextInput
            style={styles.textInput}
            value={certName}
            onChangeText={setCertName}
            placeholder="e.g. Master Bridal Certification"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* ACADEMY NAME */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Issuing Academy / Institute</Text>
          <TextInput
            style={styles.textInput}
            value={academyName}
            onChangeText={setAcademyName}
            placeholder="e.g. Beauty Academy"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* DATE & UPLOAD BUTTON ROW */}
        <View style={styles.twoColRow}>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Issue Date</Text>
            <TextInput
              style={styles.textInput}
              value={issueDate}
              onChangeText={setIssueDate}
              placeholder="mm/dd/yyyy"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Document File</Text>
            <TouchableOpacity
              style={styles.uploadTrigger}
              activeOpacity={0.7}
              onPress={handleUploadOrReplace}
            >
              <Text style={styles.uploadIcon}>☁️</Text>
              <Text style={styles.uploadTriggerText}>Upload File</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PREVIEW CONTAINER */}
        <View style={styles.previewContainer}>
          <View style={styles.previewPlaceholder}>
            <Text style={styles.certIcon}>📜</Text>
            <Text style={styles.previewTitle}>{certName}</Text>
            <Text style={styles.previewSub}>{academyName}</Text>
          </View>

          <TouchableOpacity
            style={styles.replaceBtn}
            activeOpacity={0.7}
            onPress={handleUploadOrReplace}
          >
            <Text style={styles.replaceBtnText}>Replace Document</Text>
          </TouchableOpacity>
        </View>

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
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: "#0F172A",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  uploadTrigger: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFBFB",
    gap: 6,
  },
  uploadIcon: {
    fontSize: 16,
  },
  uploadTriggerText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
  },
  previewContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 24,
  },
  previewPlaceholder: {
    height: 160,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  certIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  previewSub: {
    fontSize: 12,
    color: "#64748B",
  },
  replaceBtn: {
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  replaceBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
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
