import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import {useTheme} from "../../theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  bordered?: boolean;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  bordered = true,
  elevated = true,
}) => {
  const {theme} = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.base,
    borderWidth: bordered ? 1 : 0,
    borderColor: theme.colors.cardBorder,
    ...(elevated ? theme.shadows.card : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.card, cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
});
