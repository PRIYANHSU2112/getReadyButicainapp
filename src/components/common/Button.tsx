import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import {useTheme} from "../../theme";

export type ButtonVariant = "primary" | "secondary" | "gold" | "outline" | "danger" | "ghost";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const {theme} = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.disabledBackground;
    switch (variant) {
      case "primary":
        return theme.colors.primary;
      case "secondary":
        return theme.colors.secondary;
      case "gold":
        return theme.colors.gold;
      case "danger":
        return theme.colors.error;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.disabledText;
    switch (variant) {
      case "primary":
        return theme.colors.textInverse;
      case "secondary":
        return theme.colors.textPrimary;
      case "gold":
        return "#1A1500";
      case "danger":
        return "#FFFFFF";
      case "outline":
        return theme.colors.primary;
      case "ghost":
        return theme.colors.textPrimary;
      default:
        return theme.colors.textInverse;
    }
  };

  const getBorderColor = () => {
    if (variant === "outline") {
      return disabled ? theme.colors.disabledBackground : theme.colors.primary;
    }
    return "transparent";
  };

  const getHeight = () => {
    switch (size) {
      case "small":
        return theme.dimensions.buttonHeightSmall;
      case "large":
        return 56;
      case "medium":
      default:
        return theme.dimensions.buttonHeight;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 1.5 : 0,
          height: getHeight(),
          borderRadius: theme.radius.button,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text
            style={[
              theme.typography.button,
              {color: getTextColor(), marginLeft: icon ? 8 : 0},
              textStyle,
            ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
