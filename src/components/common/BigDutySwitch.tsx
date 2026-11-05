import React, {useEffect, useRef} from "react";
import {palette} from "../../theme";
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  Text,
} from "react-native";

interface BigDutySwitchProps {
  isOnline: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const BigDutySwitch: React.FC<BigDutySwitchProps> = ({
  isOnline,
  onToggle,
  disabled = false,
}) => {
  // Knob slide animation (0 = offline, 1 = online)
  const slideAnim = useRef(new Animated.Value(isOnline ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOnline ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [isOnline, slideAnim]);

  const knobTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 33],
  });

  const backgroundColor = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#374151", palette.brand.green], // Slate gray when offline, Deep emerald when online
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{checked: isOnline}}
      accessibilityLabel={`Stylist duty switch, currently ${isOnline ? "Online" : "Offline"}`}
      style={styles.touchableWrapper}>
      <Animated.View style={[styles.switchTrack, {backgroundColor}]}>
        {/* Subtle Online/Offline label inside track for premium look */}
        <View style={styles.trackContentRow}>
          <Text style={[styles.trackIndicatorText, isOnline ? styles.textHidden : styles.textVisible]}>
            OFF
          </Text>
          <Text style={[styles.trackIndicatorText, isOnline ? styles.textVisible : styles.textHidden]}>
            ON
          </Text>
        </View>

        {/* Sliding knob */}
        <Animated.View
          style={[
            styles.switchKnob,
            {
              transform: [{translateX: knobTranslate}],
            },
          ]}>
          <View
            style={[
              styles.knobInnerDot,
              {backgroundColor: isOnline ? "#10B981" : "#9CA3AF"},
            ]}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchableWrapper: {
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  switchTrack: {
    width: 66,
    height: 36,
    borderRadius: 18,
    position: "relative",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  trackContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    width: "100%",
  },
  trackIndicatorText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  textVisible: {
    opacity: 0.95,
  },
  textHidden: {
    opacity: 0,
  },
  switchKnob: {
    position: "absolute",
    left: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  knobInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
