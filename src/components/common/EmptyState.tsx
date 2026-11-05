import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useTheme} from "../../theme";
import {fontFamilies} from "../../theme/typography";

interface EmptyStateProps {
  // Any node, normally an <AppIcon />; shown in a soft round badge.
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  footnote?: string;
}

// Shared "nothing here yet" layout: round icon badge, serif title (as in the Figma
// "Quiet for now" design), supporting text and an optional call to action.
export const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({icon, title, subtitle, actionLabel, onAction, footnote}) => {
    const {theme} = useTheme();
    return (
      <View style={styles.wrap}>
        <View style={[styles.badge, {backgroundColor: theme.colors.surface}]}>
          <View style={[styles.badgeInner, {backgroundColor: theme.colors.crimsonTint}]}>{icon}</View>
        </View>

        <Text maxFontSizeMultiplier={1.3} accessibilityRole="header" style={[styles.title, {color: theme.colors.textPrimary}]}>
          {title}
        </Text>
        {!!subtitle && (
          <Text maxFontSizeMultiplier={1.3} style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            {subtitle}
          </Text>
        )}

        {!!actionLabel && !!onAction && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            style={[styles.action, {backgroundColor: theme.colors.primary}]}>
            <Text style={[styles.actionText, {color: theme.colors.onPrimary}]}>{actionLabel}</Text>
          </TouchableOpacity>
        )}

        {!!footnote && <Text style={[styles.footnote, {color: theme.colors.textMuted}]}>{footnote}</Text>}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 28,
  },
  badge: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  badgeInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fontFamilies.serif,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 28,
  },
  action: {
    minWidth: 190,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 15,
    fontWeight: "700",
  },
  footnote: {
    marginTop: 28,
    fontSize: 12,
    textAlign: "center",
  },
});
