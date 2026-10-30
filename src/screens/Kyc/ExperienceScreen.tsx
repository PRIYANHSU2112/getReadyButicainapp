import React, {useState, useEffect} from "react";
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
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {KycStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {WorkHistoryItem, CertificationItem} from "../../types";
import {
  OnboardingHeader,
  MultiSelectSkillsDropdown,
} from "../../components/onboarding";
import {IMAGES} from "../../constants/images";
import {kycService} from "../../services/kycService";
import {useCertificates, useDeleteCertificate, useDeleteWorkHistory, useWorkHistory} from "../../hooks/queries";
import {toast} from "../../components/common/Toast";

type Props = NativeStackScreenProps<KycStackParamList, "Experience">;

export const ExperienceScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {partner, updatePartner} = useAuth();

  const [selectedSkills, setSelectedSkills] = useState<string[]>(partner?.skills ?? []);
  const [yearsExperience, setYearsExperience] = useState<string>(
    partner?.experienceYears ? `${partner.experienceYears}yr` : ""
  );
  const [saving, setSaving] = useState(false);

  // Server-backed lists (shared cache with Add Work / Add Certificate screens)
  const workQuery = useWorkHistory();
  const certQuery = useCertificates();
  const deleteWork = useDeleteWorkHistory();
  const deleteCert = useDeleteCertificate();
  const workHistory: WorkHistoryItem[] = workQuery.data ?? [];
  const certifications: CertificationItem[] = certQuery.data ?? [];

  // Profile must exist before work history / certificates can be attached.
  useEffect(() => { kycService.ensureProfile().catch(() => undefined); }, []);

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const handleRemoveWork = (id: string) => deleteWork.mutate(id);

  const handleRemoveCert = (id: string) => deleteCert.mutate(id);

  const handleSaveAndContinue = async () => {
    if (saving) return;
    if (selectedSkills.length === 0) {
      toast.warning("Please select at least one skill");
      return;
    }
    const numYears = parseInt(yearsExperience.replace(/[^0-9]/g, ""), 10) || 0;
    setSaving(true);
    try {
      await kycService.ensureProfile();
      await kycService.updateProfile({skills: selectedSkills, experienceYears: numYears});
      updatePartner({skills: selectedSkills, experienceYears: numYears, workHistory, certifications});
      navigation.navigate("BankDetails");
    } catch {
      // error toast raised by the API layer
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate("BankDetails");
  };

  return (
    <View style={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        {/* Onboarding Header with Step 4 of 7 (57% progress) */}
        <OnboardingHeader
          title="Profile Creation"
          stepNumber={4}
          totalSteps={7}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: Math.max(insets.bottom + 20, 36)},
          ]}
          keyboardShouldPersistTaps="handled">
          {/* Header Title Section matching Screenshot 1 */}
          <View style={styles.titleSection}>
            <Text maxFontSizeMultiplier={1.3} style={styles.mainTitle}>
              Skills & Experience
            </Text>
            <Text maxFontSizeMultiplier={1.3} style={styles.subTitle}>
              Tell us a bit about yourself Skills and experties your profile.
            </Text>
          </View>

          {/* Field 1: Select Skills Dropdown */}
          <MultiSelectSkillsDropdown
            label="Select Skills"
            placeholder="Choose categories"
            selectedSkills={selectedSkills}
            onToggleSkill={handleToggleSkill}
          />

          {/* Skills Chips matching Screenshot 1 */}
          {selectedSkills.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={styles.skillsLabel}>Skills</Text>
              <View style={styles.chipsRow}>
                {selectedSkills.map(skill => (
                  <View key={skill} style={styles.chipPill}>
                    <Text style={styles.chipText}>{skill}</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleRemoveSkill(skill)}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                      style={styles.chipCloseBtn}>
                      <Text style={styles.chipCloseIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Field 2: Years Of Experience */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Years Of Experience</Text>
            <TextInput
              value={yearsExperience}
              onChangeText={setYearsExperience}
              placeholder="Eg. 6yr"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </View>

          {/* Section 3: Work History with "+ Add Work" */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Work History</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AddWorkExperience")}
              style={styles.addTextBtn}>
              <Text style={styles.addTextBtnTitle}>+ Add Work</Text>
            </TouchableOpacity>
          </View>

          {workHistory.length === 0 ? (
            <View style={styles.emptyCardBox}>
              <Text style={styles.emptyCardText}>
                No work history added yet. Tap "+ Add Work" to include previous salon roles.
              </Text>
            </View>
          ) : (
            workHistory.map(item => (
              <View key={item.id} style={styles.historyCard}>
                {/* Green vertical accent indicator on left edge */}
                <View style={styles.verticalGreenBar} />

                {/* Content */}
                <View style={styles.historyCardContent}>
                  <Text style={styles.historySalonName}>{item.salonName}</Text>
                  <Text style={styles.historyRoleText}>{item.role}</Text>
                  <Text style={styles.historyDurationText}>
                    {item.years || "Jan 2020 – Dec 2023 (4 years)"}
                  </Text>
                </View>

                {/* Trash can icon */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleRemoveWork(item.id)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                  style={styles.trashBtn}>
                  <Text style={styles.trashIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Section 4: Certifications with "+ Add" */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AddCertificate")}
              style={styles.addTextBtn}>
              <Text style={styles.addTextBtnTitle}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {certifications.length === 0 ? (
            <View style={styles.emptyCardBox}>
              <Text style={styles.emptyCardText}>
                No certifications added yet. Tap "+ Add" to include certified beauty courses.
              </Text>
            </View>
          ) : (
            certifications.map(item => (
              <View key={item.id} style={styles.certCard}>
                {/* Green vertical accent indicator on left edge */}
                <View style={styles.verticalGreenBar} />

                {/* Left: Certificate card preview thumbnail */}
                <View style={styles.certThumbnailBox}>
                  <Image
                    source={
                      item.imageUri && item.imageUri !== "demo_certificate"
                        ? {uri: item.imageUri}
                        : IMAGES.CERTIFICATE_CARD
                    }
                    style={styles.certThumbnailImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Middle: Certificate details */}
                <View style={styles.certDetails}>
                  <Text style={styles.certTitle}>{item.title}</Text>
                  <Text style={styles.certIssuer}>{item.issuer}</Text>
                  <Text style={styles.certDate}>
                    {item.issueDate || "Issue : 26 Jul 2024"}
                  </Text>
                </View>

                {/* Trash can icon */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleRemoveCert(item.id)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                  style={styles.trashBtn}>
                  <Text style={styles.trashIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Bottom Action Buttons matching Screenshot 1 */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSaveAndContinue}
              accessibilityRole="button"
              accessibilityLabel="Save and Continue"
              style={styles.saveContinueBtn}>
              <Text style={styles.saveContinueText}>Save and Continue →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSkip}
              accessibilityRole="button"
              accessibilityLabel="Skip"
              style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>Skip</Text>
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
  skillsSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  skillsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 4,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  chipCloseBtn: {
    marginLeft: 6,
    padding: 2,
  },
  chipCloseIcon: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "700",
  },
  inputGroup: {
    marginTop: 8,
    marginBottom: 20,
  },
  inputLabel: {
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  addTextBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  addTextBtnTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  emptyCardBox: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  emptyCardText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    paddingRight: 14,
    marginBottom: 16,
    minHeight: 74,
  },
  verticalGreenBar: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: "#114B3E",
  },
  historyCardContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  historySalonName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  historyRoleText: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  historyDurationText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  trashBtn: {
    padding: 8,
  },
  trashIcon: {
    fontSize: 18,
    opacity: 0.8,
  },
  certCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    paddingRight: 14,
    marginBottom: 24,
    minHeight: 74,
  },
  certThumbnailBox: {
    width: 60,
    height: 44,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    marginLeft: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  certThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  certDetails: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  certTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  certIssuer: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 2,
  },
  certDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  bottomActions: {
    marginTop: 12,
    paddingBottom: 16,
  },
  saveContinueBtn: {
    backgroundColor: "#114B3E",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveContinueText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  skipBtn: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtnText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
});
