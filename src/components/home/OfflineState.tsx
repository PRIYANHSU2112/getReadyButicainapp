import React from "react";
import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "../../theme";
import {SwipeToConfirm} from "../common/SwipeToConfirm";

interface OfflineStateProps {
  onGoOnline: () => void;
  busy?: boolean;
}

// Dashboard body while the partner is off duty (Figma "Sorry, we're CLOSED").
// The sign is drawn with Views as a stand-in until the illustration asset is supplied.
export const OfflineState: React.FC<OfflineStateProps> = React.memo(({onGoOnline, busy = false}) => {
  const {theme} = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.sign} accessible accessibilityLabel="Sorry, we're closed">
        <View style={[styles.rope, styles.ropeLeft]} />
        <View style={[styles.rope, styles.ropeRight]} />
        <View style={[styles.signBoard, {backgroundColor: theme.colors.crimsonTint, borderColor: theme.colors.crimson}]}>
          <Text style={[styles.signSmall, {color: theme.colors.crimson}]}>Sorry, we're</Text>
          <Text style={[styles.signBig, {color: theme.colors.crimson}]}>CLOSED</Text>
        </View>
      </View>

      <Text maxFontSizeMultiplier={1.3} style={[styles.title, {color: theme.colors.textPrimary}]}>
        No bookings yet today
      </Text>
      <Text maxFontSizeMultiplier={1.3} style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
        New requests will appear here. Make sure you're Online to receive bookings.
      </Text>

      <View style={styles.swipe}>
        <SwipeToConfirm label="Swipe to go Online" onComplete={onGoOnline} busy={busy} />
      </View>

      <View style={[styles.chip, {backgroundColor: theme.colors.surfaceVariant}]}>
        <View style={[styles.dot, {backgroundColor: theme.colors.offline}]} />
        <Text style={[styles.chipText, {color: theme.colors.textSecondary}]}>Currently Offline</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sign: {
    alignItems: "center",
    marginBottom: 28,
  },
  rope: {
    position: "absolute",
    top: -2,
    width: 2,
    height: 46,
    backgroundColor: "#9CA3AF",
  },
  ropeLeft: {
    left: 62,
    transform: [{rotate: "-24deg"}],
  },
  ropeRight: {
    right: 62,
    transform: [{rotate: "24deg"}],
  },
  signBoard: {
    marginTop: 38,
    width: 210,
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
  },
  signSmall: {
    fontSize: 17,
    fontStyle: "italic",
    fontWeight: "600",
  },
  signBig: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  swipe: {
    alignSelf: "stretch",
    marginBottom: 18,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
