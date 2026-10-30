import React, {useState, useCallback, useMemo} from "react";
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
import {ScreenContainer, Header} from "../../components/common";
import {useApplyLeave} from "../../hooks/queries";
import {LeaveType} from "../../services/partnerService";
import {mediaService} from "../../services/mediaService";
import {dmyToIso} from "../../utils/date";

const LEAVE_TYPES: {code: LeaveType; label: string}[] = [
  {code: "CL", label: "CL (Casual Leave)"},
  {code: "SL", label: "SL (Sick Leave)"},
  {code: "PL", label: "PL (Paid Leave)"},
  {code: "EMERGENCY", label: "Emergency Leave"},
];

export const SubmitLeaveScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const applyLeave = useApplyLeave();

  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [duration, setDuration] = useState<"full" | "half">("full");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachmentUri, setAttachmentUri] = useState<string | null>(null);
  const hasAttachment = !!attachmentUri;

  const startIso = dmyToIso(startDate);
  const endIso = duration === "half" ? startIso : dmyToIso(endDate);

  const dayCount = useMemo(() => {
    if (duration === "half") return 0.5;
    if (!startIso || !endIso) return 0;
    return Math.max(0, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 86400000) + 1);
  }, [duration, startIso, endIso]);

  const handleSelectLeaveType = useCallback(() => {
    Alert.alert("Select Leave Type", "Choose leave category:", [
      ...LEAVE_TYPES.map(t => ({text: t.label, onPress: () => setLeaveType(t)})),
      {text: "Cancel", style: "cancel" as const},
    ]);
  }, []);

  const handleUploadAttachment = useCallback(() => {
    Alert.alert(
      "Attach Supporting Document",
      "Upload doctor certificate or official leave proof (JPG, PNG up to 5MB):",
      [
        {text: "Take Photo", onPress: async () => { const m = await mediaService.openCamera({cropping: false}); if (m?.path) setAttachmentUri(m.path); }},
        {text: "Choose from Gallery", onPress: async () => { const m = await mediaService.openGallery({cropping: false}); if (m?.path) setAttachmentUri(m.path); }},
        ...(hasAttachment ? [{text: "Remove Attachment", style: "destructive" as const, onPress: () => setAttachmentUri(null)}] : []),
        {text: "Cancel", style: "cancel" as const},
      ]
    );
  }, [hasAttachment]);

  const handleSubmit = useCallback(() => {
    if (applyLeave.isPending) return;
    if (!startIso) {
      Alert.alert("Start date required", "Please enter a valid start date (DD/MM/YYYY).");
      return;
    }
    if (!endIso || Date.parse(endIso) < Date.parse(startIso)) {
      Alert.alert("Invalid end date", "End date must be on or after the start date.");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Reason required", "Please describe the reason for your leave.");
      return;
    }
    applyLeave.mutate(
      {
        leaveType: leaveType.code,
        duration: duration === "half" ? "HALF_DAY" : "FULL_DAY",
        startDate: startIso,
        endDate: endIso,
        reason: reason.trim(),
        attachmentUri: attachmentUri ?? undefined,
      },
      {
        onSuccess: () =>
          Alert.alert(
            "Leave Request Submitted",
            "Your leave request has been submitted to the operations admin team. You will be notified once reviewed.",
            [{text: "OK", onPress: () => navigation.goBack()}]
          ),
      },
    );
  }, [applyLeave, startIso, endIso, reason, leaveType, duration, attachmentUri, navigation]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Submit Leave"
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
        <Text style={styles.headerSubtitle}>Submit 48h in advance</Text>

        {/* MAIN FORM CARD */}
        <View style={styles.formCard}>
          {/* LEAVE TYPE */}
          <Text style={styles.inputLabel}>LEAVE TYPE</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={handleSelectLeaveType}
          >
            <Text style={styles.dropdownText}>{leaveType.label}</Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>

          {/* DURATION */}
          <Text style={[styles.inputLabel, {marginTop: 16}]}>DURATION</Text>
          <View style={styles.durationToggleContainer}>
            <TouchableOpacity
              style={[
                styles.durationOption,
                duration === "full" && styles.durationOptionActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setDuration("full")}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === "full" && styles.durationTextActive,
                ]}
              >
                Full Day
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.durationOption,
                duration === "half" && styles.durationOptionActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setDuration("half")}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === "half" && styles.durationTextActive,
                ]}
              >
                Half Day
              </Text>
            </TouchableOpacity>
          </View>

          {/* START DATE */}
          <Text style={[styles.inputLabel, {marginTop: 16}]}>START DATE</Text>
          <View style={styles.dateInputWrapper}>
            <TextInput
              style={styles.dateInput}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#94A3B8"
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.dateIcon}>📅</Text>
          </View>

          {/* END DATE */}
          <Text style={[styles.inputLabel, {marginTop: 16}]}>END DATE</Text>
          <View style={styles.dateInputWrapper}>
            <TextInput
              style={styles.dateInput}
              value={duration === "half" ? startDate : endDate}
              onChangeText={setEndDate}
              editable={duration !== "half"}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#94A3B8"
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.dateIcon}>📅</Text>
          </View>

          {/* CALCULATED DURATION BANNER */}
          <View style={styles.calcDurationBanner}>
            <View style={styles.calcAccentBar} />
            <Text style={styles.calcLabel}>Calculated Duration</Text>
            <Text style={styles.calcValue}>
              {dayCount} {dayCount === 1 ? "Day" : "Days"}
            </Text>
          </View>

          {/* REASON FOR LEAVE */}
          <Text style={[styles.inputLabel, {marginTop: 16}]}>REASON FOR LEAVE</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            placeholder="Briefly describe the reason for your request..."
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
          />

          {/* SUPPORTING DOCUMENTS (OPTIONAL) */}
          <Text style={[styles.inputLabel, {marginTop: 16}]}>
            SUPPORTING DOCUMENTS (OPTIONAL)
          </Text>
          <TouchableOpacity
            style={styles.uploadContainer}
            activeOpacity={0.8}
            onPress={handleUploadAttachment}
          >
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={styles.uploadTitle}>
              {hasAttachment ? "Document Attached ✓" : "Tap to upload attachment"}
            </Text>
            <Text style={styles.uploadSub}>PDF, JPG, PNG UP TO 5MB</Text>
          </TouchableOpacity>

          {/* PEAK WEEKEND NOTICE */}
          <View style={styles.warningNoticeBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Peak weekend slots require Admin approval. Approval is not guaranteed for Friday–Sunday requests.
            </Text>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.8}
            onPress={handleSubmit}
          >
            <Text style={styles.submitBtnText}>{applyLeave.isPending ? "Submitting…" : "Submit Leave Request"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 6,
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
    fontWeight: "600",
    color: "#0F172A",
  },
  dropdownArrow: {
    fontSize: 16,
    color: "#94A3B8",
  },
  durationToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
  },
  durationOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  durationOptionActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  durationText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  durationTextActive: {
    color: "#114B3E",
  },
  dateInputWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    height: 48,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    paddingVertical: 0,
  },
  dateIcon: {
    fontSize: 16,
  },
  calcDurationBanner: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    position: "relative",
  },
  calcAccentBar: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3.5,
    backgroundColor: "#114B3E",
    borderRadius: 2,
  },
  calcLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#166534",
    flex: 1,
    marginLeft: 6,
  },
  calcValue: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#114B3E",
  },
  textArea: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    height: 90,
    fontSize: 13.5,
    color: "#0F172A",
  },
  uploadContainer: {
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  uploadSub: {
    fontSize: 10.5,
    color: "#94A3B8",
  },
  warningNoticeBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  warningIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  warningText: {
    fontSize: 11.5,
    color: "#B45309",
    flex: 1,
    lineHeight: 16,
  },
  submitBtn: {
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
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
