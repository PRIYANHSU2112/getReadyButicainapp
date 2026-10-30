import React, {useState, useCallback, useEffect} from "react";
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
import {useBankDetails, useSaveBankDetails} from "../../hooks/queries";
import {mediaService} from "../../services/mediaService";
import {IFSC_PLACEHOLDER, ifscError, normalizeIfsc, useIfscLookup} from "../../utils/ifsc";

export const EditBankDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const bank = useBankDetails().data;
  const saveBank = useSaveBankDetails();

  const [holderName, setHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [ifscErr, setIfscErr] = useState("");
  const ifscLookup = useIfscLookup(ifscCode);
  const [upiId, setUpiId] = useState("");
  const [passbookUri, setPassbookUri] = useState<string | null>(null);
  const hasPassbook = !!passbookUri;

  // Prefill once the saved bank details arrive.
  useEffect(() => {
    if (!bank) return;
    setHolderName(bank.accountHolderName ?? "");
    setAccountNumber(bank.accountNumber ?? "");
    setIfscCode(normalizeIfsc(bank.ifscCode ?? ""));
    setUpiId(bank.upiId ?? "");
  }, [bank]);

  const handleUploadPassbook = useCallback(() => {
    Alert.alert(
      "Upload Bank Proof",
      "Attach cancelled cheque or front page of bank passbook:",
      [
        {text: "Take Photo", onPress: async () => { const m = await mediaService.openCamera({cropping: false}); if (m?.path) setPassbookUri(m.path); }},
        {text: "Choose Image", onPress: async () => { const m = await mediaService.openGallery({cropping: false}); if (m?.path) setPassbookUri(m.path); }},
        {text: "Cancel", style: "cancel"},
      ]
    );
  }, []);

  const handleSave = useCallback(() => {
    if (saveBank.isPending) return;
    const ifsc = ifscCode;
    const err = ifscError(ifsc) || (ifscLookup.data === null ? "This IFSC code doesn't match any bank branch" : "");
    if (err) {
      setIfscErr(err);
      return;
    }
    if (!holderName.trim() || accountNumber.trim().length < 8) {
      Alert.alert("Invalid details", "Enter account holder name and a valid account number.");
      return;
    }
    saveBank.mutate(
      {
        accountHolderName: holderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifsc,
        bankName: ifscLookup.data?.BANK,
        upiId: upiId.trim() || undefined,
        passbookUri: passbookUri ?? undefined,
      },
      {onSuccess: () => { toast.success("Bank details updated"); navigation.goBack(); }},
    );
  }, [saveBank, holderName, accountNumber, ifscCode, ifscLookup.data, upiId, passbookUri, navigation]);

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
        {/* ACCOUNT HOLDER NAME */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Account Holder Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={holderName}
              onChangeText={setHolderName}
              placeholder="As per bank Record"
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.inputEndIcon}>👤</Text>
          </View>
        </View>

        {/* ACCOUNT NUMBER */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Account Number</Text>
          <TextInput
            style={styles.textInputRegular}
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            placeholder="Eg. 098 765 45234 67"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* IFSC CODE */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>IFSC Code</Text>
          <TextInput
            style={styles.textInputRegular}
            value={ifscCode}
            onChangeText={t => { setIfscCode(normalizeIfsc(t)); setIfscErr(""); }}
            onBlur={() => ifscCode && setIfscErr(ifscError(ifscCode))}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={11}
            placeholder={IFSC_PLACEHOLDER}
            placeholderTextColor="#94A3B8"
          />
          {!!ifscErr && <Text style={styles.ifscError}>{ifscErr}</Text>}
          {!ifscErr && !!ifscLookup.data && (
            <Text style={styles.ifscOk}>✓ {ifscLookup.data.BANK} - {ifscLookup.data.BRANCH}</Text>
          )}
          {!ifscErr && ifscLookup.data === null && (
            <Text style={styles.ifscError}>This IFSC code doesn't match any bank branch</Text>
          )}
        </View>

        {/* BANK AUTO FETCH BANNER */}
        <View style={styles.autoFetchBox}>
          <Text style={styles.bankIcon}>🏛️</Text>
          <Text style={styles.autoFetchText}>
            Bank name will be fetched automatically
          </Text>
        </View>

        {/* UPLOAD PASSBOOK */}
        <View style={styles.uploadContainer}>
          <Text style={styles.cloudIcon}>☁️</Text>
          <Text style={styles.uploadTitle}>
            {hasPassbook ? "Passbook Uploaded ✓" : "Upload passbook"}
          </Text>
          <TouchableOpacity
            style={styles.uploadBtn}
            activeOpacity={0.7}
            onPress={handleUploadPassbook}
          >
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* OPTIONAL DIVIDER */}
        <View style={styles.optionalDividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.optionalText}>OPTIONAL</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* UPI ID */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>UPI Id</Text>
          <TextInput
            style={styles.textInputRegular}
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
            placeholder="example@oksbi"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* ACTION BUTTONS */}
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
  ifscError: {fontSize: 12, color: "#DC2626", marginTop: 6},
  ifscOk: {fontSize: 12, color: "#15803D", fontWeight: "600", marginTop: 6},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 0,
  },
  inputEndIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  textInputRegular: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: "#0F172A",
  },
  autoFetchBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bankIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  autoFetchText: {
    fontSize: 12,
    color: "#64748B",
  },
  uploadContainer: {
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFBFB",
    marginBottom: 16,
  },
  cloudIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7F1D1D",
    marginBottom: 12,
  },
  uploadBtn: {
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 28,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
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
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
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
