import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

interface PreferredHoursCardProps {
  startTime: string;
  endTime: string;
  onTimeChange: (start: string, end: string) => void;
}

const SHIFT_OPTIONS = [
  {start: "08:00 AM", end: "05:00 PM", label: "Early Shift"},
  {start: "09:00 AM", end: "06:00 PM", label: "Standard"},
  {start: "10:00 AM", end: "07:00 PM", label: "Late Shift"},
  {start: "08:00 AM", end: "08:00 PM", label: "Full Day"},
];

export const PreferredHoursCard: React.FC<PreferredHoursCardProps> = ({
  startTime,
  endTime,
  onTimeChange,
}) => {
  const handleSelectShift = () => {
    Alert.alert(
      "Preferred Working Hours",
      "Choose your typical working window:",
      [
        ...SHIFT_OPTIONS.map(s => ({
          text: `${s.label} (${s.start} - ${s.end})`,
          onPress: () => onTimeChange(s.start, s.end),
        })),
        {text: "Cancel", style: "cancel"},
      ],
      {cancelable: true}
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleSelectShift}
      style={styles.card}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeLabel}>Starts</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{startTime}</Text>
        </View>
      </View>

      <Text style={styles.arrowIcon}>→</Text>

      <View style={styles.timeColumn}>
        <Text style={styles.timeLabel}>Ends</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{endTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  timeBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1F2937",
  },
  arrowIcon: {
    fontSize: 18,
    color: "#9CA3AF",
    marginHorizontal: 12,
    marginTop: 18,
  },
});
