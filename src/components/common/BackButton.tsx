import React from "react";
import {StyleSheet, Text, TouchableOpacity, ViewStyle} from "react-native";
import {useTheme} from "../../theme";

interface BackButtonProps {
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
}

// Figma back button: crimson chevron on a blush circle. Used by Header and
// OnboardingHeader so every screen's back affordance looks the same.
export const BackButton: React.FC<BackButtonProps> = React.memo(({onPress, size = 36, style}) => {
  const {theme} = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={[
        styles.circle,
        {width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.crimsonTint},
        style,
      ]}>
      <Text style={[styles.chevron, {color: theme.colors.crimson, fontSize: size * 0.7, lineHeight: size * 0.8}]}>
        ‹
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    fontWeight: "600",
    includeFontPadding: false,
    // The glyph sits slightly low inside its line box; nudge it to optical centre.
    marginTop: -2,
  },
});
