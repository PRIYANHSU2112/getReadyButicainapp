import React from "react";
import {palette} from "../../theme";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {BackButton} from "../common/BackButton";

interface OnboardingHeaderProps {
  title?: string;
  stepNumber: number;
  totalSteps?: number;
  onBackPress: () => void;
  showBack?: boolean;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  title = "Profile Creation",
  stepNumber,
  totalSteps = 7,
  onBackPress,
  showBack = true,
}) => {
  const insets = useSafeAreaInsets();
  const progressPercent = Math.min(
    Math.max((stepNumber / totalSteps) * 100, 0),
    100
  );

  return (
    <View style={[styles.container, {paddingTop: Math.max(insets.top + 6, 16)}]}>
      {/* Top Navigation Row matching Screenshots: < Profile Creation */}
      <View style={styles.topRow}>
        <View style={styles.backRow}>
          {showBack && <BackButton onPress={onBackPress} style={styles.backButton} />}
          <Text maxFontSizeMultiplier={1.3} style={styles.headerTitle}>
            {title}
          </Text>
        </View>
      </View>

      {/* Progress Info Row */}
      <View style={styles.progressRow}>
        <Text style={styles.onboardingLabel}>ONBOARDING</Text>
        <Text style={styles.stepLabel}>
          Step {stepNumber} of {totalSteps}
        </Text>
      </View>

      {/* Progress Bar Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {width: `${progressPercent}%`},
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  onboardingLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.8,
  },
  stepLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: palette.brand.green, // Deep emerald
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: palette.brand.green, // Deep emerald
    borderRadius: 2,
  },
});
