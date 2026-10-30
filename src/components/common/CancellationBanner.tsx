import React from "react";
import {StyleSheet, Text, View, ViewStyle} from "react-native";

interface CancellationBannerProps {
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const CancellationBanner: React.FC<CancellationBannerProps> = React.memo(({
  title = "Appointment Cancelled",
  subtitle = "On 14 Jul at 01:15 PM (2 hours prior to start time)",
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconCircle}>
        <Text style={styles.calendarIcon}>📅</Text>
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  calendarIcon: {
    fontSize: 16,
  },
  textColumn: {
    flex: 1,
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#EF4444",
  },
  subtitleText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
});
