import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import {useTheme} from "../../theme";
import {BackButton} from "./BackButton";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  style,
}) => {
  const {theme} = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContainer}>
        {showBack ? <BackButton onPress={onBackPress} style={styles.backButton} /> : null}
        <View style={styles.titleContainer}>
          <Text
            numberOfLines={1}
            style={[
              theme.typography.h3,
              {color: theme.colors.textPrimary},
            ]}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[
                theme.typography.caption,
                {color: theme.colors.textSecondary, marginTop: 2},
              ]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightAction ? (
        <View style={styles.rightContainer}>{rightAction}</View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
});
