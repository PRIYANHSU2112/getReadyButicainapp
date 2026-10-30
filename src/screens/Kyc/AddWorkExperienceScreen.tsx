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
  Alert,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {KycStackParamList} from "../../navigation/types";
import {useAddWorkHistory} from "../../hooks/queries";
import {dmyToIso} from "../../utils/date";
import {toast} from "../../components/common/Toast";

type Props = NativeStackScreenProps<KycStackParamList, "AddWorkExperience">;

export const AddWorkExperienceScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const addWork = useAddWorkHistory();

  const [jobRole, setJobRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleAdd = () => {
    if (addWork.isPending) return;
    if (!jobRole.trim()) {
      Alert.alert("Job Role required", "Please enter your job role (e.g. Senior Hair Stylist).");
      return;
    }
    if (!companyName.trim()) {
      Alert.alert("Company Name required", "Please enter company or salon name.");
      return;
    }

    const startIso = dmyToIso(startDate);
    if (!startIso) {
      Alert.alert("Start date required", "Please enter a valid start date (DD/MM/YYYY).");
      return;
    }
    // Empty end date = currently working here.
    const endIso = endDate.trim() ? dmyToIso(endDate) : null;
    if (endDate.trim() && !endIso) {
      Alert.alert("Invalid end date", "Please enter a valid end date (DD/MM/YYYY) or leave it empty.");
      return;
    }

    addWork.mutate(
      {companyName: companyName.trim(), role: jobRole.trim(), startDate: startIso, endDate: endIso, isCurrent: !endIso},
      {onSuccess: () => { toast.success("Work experience added"); navigation.goBack(); }},
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        {/* Header matching Screenshot 5 */}
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
            <Text style={styles.mainTitle}>Work Experience</Text>
            <Text style={styles.subTitle}>
              Tell us a bit about yourself Skills and experties your profile.
            </Text>
          </View>

          {/* Job Role Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Job Role</Text>
            <TextInput
              value={jobRole}
              onChangeText={setJobRole}
              placeholder="Eg. hair Stylist"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
              autoCapitalize="words"
            />
          </View>

          {/* Company Name Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Company Name</Text>
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="eg. Elite Salon Spa"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
              autoCapitalize="words"
            />
          </View>

          {/* Date Range Card matching Screenshot 5 */}
          <View style={styles.dateRangeCard}>
            {/* Start Date */}
            <View style={styles.dateCol}>
              <Text style={styles.dateColLabel}>Start date</Text>
              <View style={styles.dateInputBox}>
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#9CA3AF"
                  style={styles.dateInputText}
                />
                <Text style={styles.calendarIcon}>📅</Text>
              </View>
            </View>

            {/* Arrow */}
            <View style={styles.arrowBox}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>

            {/* End Date */}
            <View style={styles.dateCol}>
              <Text style={styles.dateColLabel}>End date</Text>
              <View style={styles.dateInputBox}>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#9CA3AF"
                  style={styles.dateInputText}
                />
                <Text style={styles.calendarIcon}>📅</Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
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
    backgroundColor: "#F9FAFB",
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
  dateRangeCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 28,
  },
  dateCol: {
    flex: 1,
  },
  dateColLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  dateInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
  },
  dateInputText: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    padding: 0,
  },
  calendarIcon: {
    fontSize: 14,
    marginLeft: 6,
  },
  arrowBox: {
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },
  arrowIcon: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  addBtn: {
    backgroundColor: "#114B3E",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
