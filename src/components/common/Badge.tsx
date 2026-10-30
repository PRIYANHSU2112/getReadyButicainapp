import React from "react";
import {StyleSheet, Text, View, ViewStyle, TextStyle} from "react-native";
import {useTheme} from "../../theme";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "gold"
  | "neutral";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "small" | "medium";
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "neutral",
  style,
  textStyle,
  size = "medium",
}) => {
  const {theme} = useTheme();

  const getColors = () => {
    switch (variant) {
      case "success":
        return {
          bg: theme.colors.successLight,
          text: theme.colors.success,
        };
      case "warning":
        return {
          bg: theme.colors.warningLight,
          text: theme.colors.warning,
        };
      case "error":
        return {
          bg: theme.colors.errorLight,
          text: theme.colors.error,
        };
      case "gold":
        return {
          bg: theme.colors.goldLight,
          text: "#8A6D00",
        };
      case "info":
        return {
          bg: theme.colors.infoLight,
          text: theme.colors.info,
        };
      case "neutral":
      default:
        return {
          bg: theme.colors.surfaceVariant,
          text: theme.colors.textSecondary,
        };
    }
  };

  const {bg, text} = getColors();
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 2 : 4,
          borderRadius: theme.radius.pill,
        },
        style,
      ]}>
      <Text
        style={[
          isSmall ? theme.typography.captionSmall : theme.typography.caption,
          {color: text, fontWeight: "600"},
          textStyle,
        ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
});
