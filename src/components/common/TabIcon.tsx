import React from "react";
import {StyleSheet, View, Text} from "react-native";

export type TabIconName = "home" | "bookings" | "wallet" | "profile";

interface TabIconProps {
  name: TabIconName;
  isFocused: boolean;
  color?: string;
  size?: number;
}

export const TabIcon: React.FC<TabIconProps> = React.memo(({
  name,
  isFocused,
  color,
  size = 24,
}) => {
  const activeColor = color || (isFocused ? "#114B3E" : "#8A99A8");

  switch (name) {
    case "home":
      return (
        <View style={[styles.iconContainer, {width: size, height: size}]}>
          {/* Peaked roof */}
          <View
            style={[
              styles.homeRoof,
              {
                borderBottomColor: activeColor,
                borderLeftWidth: size / 2,
                borderRightWidth: size / 2,
                borderBottomWidth: size * 0.42,
              },
            ]}
          />
          {/* House body */}
          <View
            style={[
              styles.homeBody,
              {
                borderColor: activeColor,
                width: size * 0.74,
                height: size * 0.48,
                marginTop: -1,
                borderWidth: isFocused ? 2.2 : 1.8,
              },
            ]}
          >
            {/* Door opening */}
            <View
              style={[
                styles.homeDoor,
                {
                  backgroundColor: activeColor,
                  width: size * 0.22,
                  height: size * 0.26,
                },
              ]}
            />
          </View>
        </View>
      );

    case "bookings":
      return (
        <View style={[styles.iconContainer, {width: size, height: size}]}>
          {/* Top binder clips */}
          <View style={styles.calendarBinderRow}>
            <View style={[styles.calendarClip, {backgroundColor: activeColor}]} />
            <View style={[styles.calendarClip, {backgroundColor: activeColor}]} />
          </View>
          {/* Calendar body */}
          <View
            style={[
              styles.calendarBody,
              {
                borderColor: activeColor,
                width: size * 0.85,
                height: size * 0.78,
                borderWidth: isFocused ? 2.2 : 1.8,
                backgroundColor: isFocused ? "#E6F7F0" : "transparent",
              },
            ]}
          >
            {/* Checkmark inside */}
            <Text
              style={[
                styles.calendarCheckmark,
                {
                  color: activeColor,
                  fontSize: size * 0.42,
                  fontWeight: isFocused ? "900" : "700",
                },
              ]}
            >
              ✓
            </Text>
          </View>
        </View>
      );

    case "wallet":
      return (
        <View style={[styles.iconContainer, {width: size, height: size}]}>
          <View
            style={[
              styles.walletBody,
              {
                borderColor: activeColor,
                width: size * 0.92,
                height: size * 0.68,
                borderWidth: isFocused ? 2.2 : 1.8,
                backgroundColor: isFocused ? "#E6F7F0" : "transparent",
              },
            ]}
          >
            {/* Flap line */}
            <View
              style={[
                styles.walletFlap,
                {
                  borderBottomColor: activeColor,
                  borderBottomWidth: 1.5,
                  width: "100%",
                },
              ]}
            />
            {/* Clasp button */}
            <View
              style={[
                styles.walletClasp,
                {
                  borderColor: activeColor,
                  backgroundColor: isFocused ? activeColor : "#FFFFFF",
                  width: size * 0.22,
                  height: size * 0.22,
                  borderRadius: (size * 0.22) / 2,
                  borderWidth: 1.5,
                },
              ]}
            />
          </View>
        </View>
      );

    case "profile":
      return (
        <View style={[styles.iconContainer, {width: size, height: size}]}>
          {/* Head circle */}
          <View
            style={[
              styles.profileHead,
              {
                borderColor: activeColor,
                width: size * 0.38,
                height: size * 0.38,
                borderRadius: (size * 0.38) / 2,
                borderWidth: isFocused ? 2.2 : 1.8,
                backgroundColor: isFocused ? activeColor : "transparent",
              },
            ]}
          />
          {/* Shoulders arc */}
          <View
            style={[
              styles.profileShoulders,
              {
                borderColor: activeColor,
                width: size * 0.82,
                height: size * 0.38,
                borderTopLeftRadius: size * 0.42,
                borderTopRightRadius: size * 0.42,
                borderWidth: isFocused ? 2.2 : 1.8,
                borderBottomWidth: 0,
                marginTop: 2,
                backgroundColor: isFocused ? "#E6F7F0" : "transparent",
              },
            ]}
          />
        </View>
      );

    default:
      return null;
  }
});

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  homeRoof: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  homeBody: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  homeDoor: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  calendarBinderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 14,
    marginBottom: -2,
    zIndex: 2,
  },
  calendarClip: {
    width: 2.5,
    height: 4,
    borderRadius: 1,
  },
  calendarBody: {
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCheckmark: {
    marginTop: -1,
  },
  walletBody: {
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 3,
  },
  walletFlap: {
    position: "absolute",
    top: 3,
    left: 0,
  },
  walletClasp: {
    zIndex: 2,
  },
  profileHead: {
    marginBottom: 1,
  },
  profileShoulders: {
    overflow: "hidden",
  },
});
