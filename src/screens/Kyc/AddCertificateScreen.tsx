import React, {useState} from "react";
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
import {IMAGES} from "../../constants/images";
import {mediaService} from "../../services/mediaService";
import {useAddCertificate} from "../../hooks/queries";
import {dmyToIso} from "../../utils/date";
import {isLocalFile} from "../../utils/files";
import {toast} from "../../components/common/Toast";

type Props = NativeStackScreenProps<KycStackParamList, "AddCertificate">;

export const AddCertificateScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const addCert = useAddCertificate();

  const [certTitle, setCertTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handlePickDocument = async () => {
    const media = await mediaService.pickImage({cropping: true, width: 800, height: 500});
    if (media?.path) {
      setImageUri(media.path);
    }
  };

  const handleAdd = () => {
    if (addCert.isPending) return;
    if (!certTitle.trim()) {
      Alert.alert("Title required", "Please enter certificate title.");
      return;
    }
    if (!issuer.trim()) {
      Alert.alert("Issuer required", "Please enter academy or issuing body name.");
      return;
    }

    const issueIso = dmyToIso(issueDate);
    if (!issueIso) {
      Alert.alert("Issue date required", "Please enter a valid issue date (DD/MM/YYYY).");
      return;
    }

    addCert.mutate(
      {
        title: certTitle.trim(),
        issuingOrganization: issuer.trim(),
        issueDate: issueIso,
        fileUri: isLocalFile(imageUri) ? imageUri! : undefined,
      },
      {onSuccess: () => { toast.success("Certificate added"); navigation.goBack(); }},
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        {/* Header matching Screenshots 3 & 4 */}
        <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top, 16)}]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backCircleBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Creation</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: Math.max(insets.bottom + 20, 36)},
          ]}
          keyboardShouldPersistTaps="handled">
          {/* Title & Subtitle */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Professional Certificates</Text>
            <Text style={styles.subTitle}>
              Tell us a bit about your Achievements and Certifications
            </Text>
          </View>

          {/* Certificate Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              value={certTitle}
              onChangeText={setCertTitle}
              placeholder="Eg. Master Bridal Certification"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
              autoCapitalize="words"
            />
          </View>

          {/* Issuing Organization */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              value={issuer}
              onChangeText={setIssuer}
              placeholder="Eg. Beauty Academy"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
              autoCapitalize="words"
            />
          </View>

          {/* Issue Date & Upload Row */}
          <View style={styles.dateAndUploadRow}>
            {/* Left: Issue Date */}
            <View style={styles.issueDateCol}>
              <Text style={styles.fieldLabel}>Issue Date</Text>
              <TextInput
                value={issueDate}
                onChangeText={setIssueDate}
                placeholder="mm/dd/yyyy"
                placeholderTextColor="#9CA3AF"
                style={styles.dateInput}
              />
            </View>

            {/* Right: Upload File button (when not yet uploaded) */}
            {!imageUri ? (
              <View style={styles.uploadCol}>
                <Text style={[styles.fieldLabel, {opacity: 0}]}>Upload</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handlePickDocument}
                  style={styles.uploadDashedBtn}>
                  <Text style={styles.uploadCloudIcon}>☁️</Text>
                  <Text style={styles.uploadDashedText}>Upload File</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Uploaded Certificate Preview matching Screenshot 3 */}
          {imageUri ? (
            <View style={styles.previewCard}>
              <View style={styles.previewImageContainer}>
                <Image
                  source={
                    imageUri === "demo_certificate"
                      ? IMAGES.CERTIFICATE_CARD
                      : {uri: imageUri}
                  }
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePickDocument}
                style={styles.replaceBtn}>
                <Text style={styles.replaceBtnText}>Replace Document</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Add Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleAdd}
            style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FAEDF1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  backArrow: {
    fontSize: 24,
    color: "#111827",
    lineHeight: 26,
    marginLeft: -2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
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
  dateAndUploadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  issueDateCol: {
    flex: 1,
    marginRight: 12,
  },
  dateInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  uploadCol: {
    flex: 1.1,
  },
  uploadDashedBtn: {
    height: 46,
    borderWidth: 1.2,
    borderColor: "#FCA5A5",
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadCloudIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  uploadDashedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
  },
  previewCard: {
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 28,
  },
  previewImageContainer: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  replaceBtn: {
    height: 42,
    borderWidth: 1,
    borderColor: "#114B3E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  replaceBtnText: {
    color: "#114B3E",
    fontSize: 13,
    fontWeight: "600",
  },
  addBtn: {
    backgroundColor: "#114B3E",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
