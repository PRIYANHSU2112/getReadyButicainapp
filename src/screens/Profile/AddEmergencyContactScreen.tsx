import React, {useState, useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, toast} from "../../components/common";
import {useAuth} from "../../context/AuthContext";
import {useRoute} from "@react-navigation/native";

export const AddEmergencyContactScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {partner, updatePartner} = useAuth();
  const contactId = (useRoute().params as any)?.contactId as string | undefined;
  const existing = partner?.emergencyContacts?.find(c => c.id === contactId);

  const [name, setName] = useState(existing?.name ?? "");
  const [relation, setRelation] = useState(existing?.relation ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [autoShareLocation, setAutoShareLocation] = useState(existing?.autoShareLocation ?? true);

  const handleSelectRelationship = useCallback(() => {
    Alert.alert("Relationship", "Select relationship:", [
      {text: "Mother", onPress: () => setRelation("Mother")},
      {text: "Father", onPress: () => setRelation("Father")},
      {text: "Spouse", onPress: () => setRelation("Spouse")},
      {text: "Brother", onPress: () => setRelation("Brother")},
      {text: "Sister", onPress: () => setRelation("Sister")},
      {text: "Friend", onPress: () => setRelation("Friend")},
      {text: "Cancel", style: "cancel"},
    ]);
  }, []);

  const handleSave = useCallback(() => {
    const digits = phone.replace(/\D/g, "");
    if (!name.trim() || !relation || digits.length < 10) {
      Alert.alert("Missing details", "Please enter name, relationship and a valid 10-digit phone number.");
      return;
    }
    const contact = {
      id: existing?.id ?? `ec_${Date.now()}`,
      name: name.trim(),
      phone: digits,
      relation,
      autoShareLocation,
      initials: name.trim().split(/\s+/).map(s => s[0]).join("").slice(0, 2).toUpperCase(),
    };
    const list = partner?.emergencyContacts ?? [];
    updatePartner({emergencyContacts: existing ? list.map(c => (c.id === existing.id ? contact : c)) : [...list, contact]});
    toast.success("Emergency contact saved");
    navigation.goBack();
  }, [name, relation, phone, autoShareLocation, existing, partner?.emergencyContacts, updatePartner, navigation]);

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
        {/* SAFETY MATTERS BANNER */}
        <View style={styles.safetyBanner}>
          <Text style={styles.safetyIcon}>✳️</Text>
          <View style={styles.safetyTextCol}>
            <Text style={styles.safetyTitle}>Your Safety Matters</Text>
            <Text style={styles.safetyDesc}>
              Setting up an emergency contact allows us to share your location and details instantly if you trigger the SOS button during a service appointment.
            </Text>
          </View>
        </View>

        {/* AVATAR PHOTO */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarEditBadge}
            activeOpacity={0.8}
            onPress={() => Alert.alert("Upload Photo", "Choose photo for emergency contact.")}
          >
            <Text style={styles.avatarEditIcon}>✎</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.uploadPhotoLabel}>Upload Profile Photo</Text>

        {/* EMERGENCY CONTACT NAME */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Emergency Contact Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. John Doe"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* RELATIONSHIP DROPDOWN */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Relationship</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={handleSelectRelationship}
          >
            <Text style={styles.dropdownText}>{relation || "Select relationship"}</Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>
        </View>

        {/* MOBILE NUMBER */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>+91 -</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="98765 43210"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* AUTO-SHARE LOCATION CARD */}
        <View style={styles.autoShareCard}>
          <View style={styles.autoShareTextCol}>
            <View style={styles.autoShareHeader}>
              <Text style={styles.pinIcon}>📍</Text>
              <Text style={styles.autoShareTitle}>Auto-Share Location</Text>
            </View>
            <Text style={styles.autoShareDesc}>
              Automatically send your real-time GPS location to this contact when SOS is activated.
            </Text>
          </View>
          <Switch
            value={autoShareLocation}
            onValueChange={setAutoShareLocation}
            trackColor={{false: "#CBD5E1", true: "#A7F3D0"}}
            thumbColor={autoShareLocation ? "#114B3E" : "#FFFFFF"}
          />
        </View>

        {/* ENCRYPTION NOTICE */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            Data is encrypted and only shared during active safety alerts.
          </Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  safetyBanner: {
    backgroundColor: "#114B3E",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  safetyIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  safetyTextCol: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  safetyDesc: {
    fontSize: 11.5,
    color: "#D1FAE5",
    lineHeight: 16,
  },
  avatarWrapper: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 6,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  avatarEmoji: {
    fontSize: 38,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    elevation: 2,
  },
  avatarEditIcon: {
    fontSize: 11,
    color: "#0F172A",
    fontWeight: "700",
  },
  uploadPhotoLabel: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 16,
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
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: "#0F172A",
  },
  dropdownInput: {
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  phoneInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  autoShareCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 14,
  },
  autoShareTextCol: {
    flex: 1,
    marginRight: 10,
  },
  autoShareHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  autoShareTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  autoShareDesc: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  noticeBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  noticeIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  noticeText: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
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
