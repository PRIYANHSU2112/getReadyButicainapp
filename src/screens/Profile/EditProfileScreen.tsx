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
import {useAuth} from "../../context/AuthContext";
import {useUpdateMe} from "../../hooks/queries";
import {toApiGender} from "../../services/partnerService";
import {dmyToIso} from "../../utils/date";

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {partner, updatePartner, reloadPartner} = useAuth();
  const updateMe = useUpdateMe();

  const isoToDmy = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };
  const genderLabel = (g?: string) => (g ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase() : "");

  const [fullName, setFullName] = useState(partner?.fullName ?? "");
  const [email, setEmail] = useState(partner?.email ?? "");
  const [gender, setGender] = useState(genderLabel(partner?.gender));
  const [dob, setDob] = useState(isoToDmy(partner?.dob));
  const [phone, setPhone] = useState(partner?.phoneNumber ?? "");
  const [languages, setLanguages] = useState<string[]>(partner?.languages ?? []);
  const [startTime] = useState(partner?.preferredHours?.start ?? "09:00 AM");
  const [endTime] = useState(partner?.preferredHours?.end ?? "06:00 PM");

  const handleGenderSelect = useCallback(() => {
    Alert.alert("Select Gender", "Choose your gender:", [
      {text: "Female", onPress: () => setGender("Female")},
      {text: "Male", onPress: () => setGender("Male")},
      {text: "Others", onPress: () => setGender("Others")},
      {text: "Cancel", style: "cancel"},
    ]);
  }, []);

  const handleRemoveLanguage = useCallback((lang: string) => {
    setLanguages((prev) => prev.filter((l) => l !== lang));
  }, []);

  const handleAddLanguage = useCallback(() => {
    Alert.alert("Add Language", "Select a language to add:", [
      {text: "Bengali", onPress: () => setLanguages((p) => [...p, "Bengali"])},
      {text: "Gujarati", onPress: () => setLanguages((p) => [...p, "Gujarati"])},
      {text: "Punjabi", onPress: () => setLanguages((p) => [...p, "Punjabi"])},
      {text: "Cancel", style: "cancel"},
    ]);
  }, []);

  const handleSave = useCallback(() => {
    if (updateMe.isPending) return;
    if (!fullName.trim()) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }
    const dobIso = dob.trim() ? dmyToIso(dob) : null;
    if (dob.trim() && !dobIso) {
      Alert.alert("Invalid date", "Please enter date of birth as DD/MM/YYYY.");
      return;
    }
    // Phone is the login identity and is not editable here.
    updateMe.mutate(
      {name: fullName.trim(), email: email.trim(), gender: toApiGender(gender), dob: dobIso ?? undefined, languages},
      {
        onSuccess: () => {
          updatePartner({fullName: fullName.trim(), email: email.trim(), gender, dob: dobIso ?? undefined, languages});
          reloadPartner().catch(() => undefined);
          toast.success("Profile updated");
          navigation.goBack();
        },
      },
    );
  }, [updateMe, fullName, email, gender, dob, languages, updatePartner, reloadPartner, navigation]);

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
        {/* AVATAR UPLOAD */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👩‍🦰</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarEditBadge}
            activeOpacity={0.8}
            onPress={() => Alert.alert("Upload Photo", "Choose photo from Camera or Gallery.")}
          >
            <Text style={styles.avatarEditIcon}>✎</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.uploadPhotoText}>Upload Profile Photo</Text>

        {/* FULL NAME */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* EMAIL ADDRESS */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter email address"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
        </View>

        {/* GENDER */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={handleGenderSelect}
          >
            <Text style={styles.dropdownText}>{gender || "Select Gender"}</Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>
        </View>

        {/* DATE OF BIRTH */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Date Of Birth</Text>
          <View style={styles.dobWrapper}>
            <TextInput
              style={[styles.textInput, {borderWidth: 0, paddingRight: 40}]}
              value={dob}
              onChangeText={setDob}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.calendarIcon}>📅</Text>
          </View>
        </View>

        {/* MOBILE NUMBER */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <View style={styles.phoneNumberBox}>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                editable={false}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                onPress={() => Alert.alert("Change Phone", "OTP verification will be sent to new number.")}
                activeOpacity={0.7}
              >
                <Text style={styles.changePhoneText}>CHANGE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* LANGUAGE KNOWN */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Language Known</Text>
          <View style={styles.languageChipsRow}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.langChip}
                activeOpacity={0.7}
                onPress={() => handleRemoveLanguage(lang)}
              >
                <Text style={styles.langChipText}>{lang}</Text>
                <Text style={styles.langChipClose}>✕</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addMoreChip}
              activeOpacity={0.7}
              onPress={handleAddLanguage}
            >
              <Text style={styles.addMoreText}>+ Add More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CURRENT ADDRESS CARD */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeaderRow}>
            <Text style={styles.addressTitle}>Current Address</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("PrimaryAddress")}
              activeOpacity={0.7}
            >
              <Text style={styles.addressEditBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addressBody}>
            Flat 402, Rose Garden Apts, Powai, Mumbai - 400076
          </Text>

          <View style={styles.radiusRow}>
            <Text style={styles.radiusLabel}>Working Radius</Text>
            <Text style={styles.radiusValue}>8 km</Text>
          </View>

          {/* RADIUS SLIDER BAR */}
          <View style={styles.sliderTrack}>
            <View style={styles.sliderFilled} />
            <View style={styles.sliderThumb} />
          </View>
          <View style={styles.sliderLimitsRow}>
            <Text style={styles.sliderLimitText}>1 km</Text>
            <Text style={styles.sliderLimitText}>15 km</Text>
          </View>

          {/* VISIBLE AREA NOTE */}
          <View style={styles.visibilityBox}>
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.visibilityText}>
              You are currently visible to clients across the Powai, Vikhroli, and Kanjurmarg areas.
            </Text>
          </View>
        </View>

        {/* SHIFT TIMINGS */}
        <View style={styles.shiftCard}>
          <View style={styles.shiftCol}>
            <Text style={styles.shiftLabel}>Starts</Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>{startTime}</Text>
            </View>
          </View>

          <Text style={styles.shiftArrow}>→</Text>

          <View style={styles.shiftCol}>
            <Text style={styles.shiftLabel}>Ends</Text>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>{endTime}</Text>
            </View>
          </View>
        </View>

        {/* CANCEL & SAVE BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
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
  avatarContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 6,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  avatarEmoji: {
    fontSize: 42,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#114B3E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarEditIcon: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  uploadPhotoText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 18,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
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
  dropdownInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 14,
    color: "#0F172A",
  },
  dropdownArrow: {
    fontSize: 16,
    color: "#94A3B8",
  },
  dobWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 14,
  },
  calendarIcon: {
    fontSize: 16,
  },
  phoneRow: {
    flexDirection: "row",
    gap: 8,
  },
  countryCodeBox: {
    width: 60,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  phoneNumberBox: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 0,
  },
  changePhoneText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#114B3E",
    letterSpacing: 0.5,
  },
  languageChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  langChipText: {
    fontSize: 13,
    color: "#0F172A",
  },
  langChipClose: {
    fontSize: 10,
    color: "#64748B",
  },
  addMoreChip: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addMoreText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 16,
  },
  addressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  addressEditBtn: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  addressBody: {
    fontSize: 13.5,
    color: "#0F172A",
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 14,
  },
  radiusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  radiusLabel: {
    fontSize: 12.5,
    color: "#64748B",
  },
  radiusValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#114B3E",
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CCFBF1",
    position: "relative",
    justifyContent: "center",
    marginBottom: 4,
  },
  sliderFilled: {
    position: "absolute",
    left: 0,
    width: "50%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "#114B3E",
  },
  sliderThumb: {
    position: "absolute",
    left: "50%",
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#114B3E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 2,
  },
  sliderLimitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sliderLimitText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  visibilityBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  visibilityText: {
    fontSize: 11.5,
    color: "#64748B",
    flex: 1,
    lineHeight: 16,
  },
  shiftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 20,
  },
  shiftCol: {
    alignItems: "center",
  },
  shiftLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 4,
  },
  timeBox: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  shiftArrow: {
    fontSize: 18,
    color: "#CBD5E1",
    marginTop: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#114B3E",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#114B3E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
