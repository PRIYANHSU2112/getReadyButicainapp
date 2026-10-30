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
import {useAddWorkHistory} from "../../hooks/queries";
import {dmyToIso} from "../../utils/date";

export const AddWorkExperienceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const addWork = useAddWorkHistory();

  const [jobRole, setJobRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSave = useCallback(() => {
    if (addWork.isPending) return;
    const startIso = dmyToIso(startDate);
    const endIso = endDate.trim() ? dmyToIso(endDate) : null;
    if (!jobRole.trim() || !companyName.trim() || !startIso || (endDate.trim() && !endIso)) {
      Alert.alert("Missing details", "Enter role, company and valid dates (DD/MM/YYYY). Leave end date empty if current.");
      return;
    }
    addWork.mutate(
      {companyName: companyName.trim(), role: jobRole.trim(), startDate: startIso, endDate: endIso, isCurrent: !endIso},
      {onSuccess: () => { toast.success("Work experience added"); navigation.goBack(); }},
    );
  }, [addWork, jobRole, companyName, startDate, endDate, navigation]);

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
        <Text style={styles.title}>Work Experience</Text>
        <Text style={styles.subtitle}>
          Tell us a bit about yourself Skills and experties your profile.
        </Text>

        {/* JOB ROLE */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Job Role</Text>
          <TextInput
            style={styles.textInput}
            value={jobRole}
            onChangeText={setJobRole}
            placeholder="Eg. hair Stylist"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* COMPANY NAME */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Company Name</Text>
          <TextInput
            style={styles.textInput}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="eg. Elite Salon Spa"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* TENURE DATES CONTAINER */}
        <View style={styles.datesContainer}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Start date</Text>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateTextInput}
                value={startDate}
                onChangeText={setStartDate}
              />
              <Text style={styles.calIcon}>📅</Text>
            </View>
          </View>

          <Text style={styles.arrowIcon}>→</Text>

          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>End date</Text>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateTextInput}
                value={endDate}
                onChangeText={setEndDate}
              />
              <Text style={styles.calIcon}>📅</Text>
            </View>
          </View>
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
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 20,
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
  datesContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 24,
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 6,
  },
  dateInputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 42,
  },
  dateTextInput: {
    fontSize: 12.5,
    color: "#0F172A",
    fontWeight: "600",
    paddingVertical: 0,
    flex: 1,
  },
  calIcon: {
    fontSize: 14,
  },
  arrowIcon: {
    fontSize: 16,
    color: "#94A3B8",
    marginHorizontal: 8,
    marginTop: 18,
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
