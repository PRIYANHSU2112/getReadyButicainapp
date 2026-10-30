import React from "react";
import {StatusBar, StyleSheet, View, ViewStyle, KeyboardAvoidingView, Platform, ScrollView} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useTheme} from "../../theme";

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withSafeArea?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  testID?: string;
}

export const ScreenContainer: React.FC<Props> = ({
  children, scrollable = false, style, contentContainerStyle,
  withSafeArea = true, keyboardAvoiding = true, backgroundColor, testID,
}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const bg = backgroundColor || theme.colors.background;

  const content = scrollable
    ? <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scrollContent, contentContainerStyle]}>{children}</ScrollView>
    : <View style={[styles.flex, contentContainerStyle]}>{children}</View>;

  const wrapped = keyboardAvoiding
    ? <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>{content}</KeyboardAvoidingView>
    : content;

  const topInset = withSafeArea ? (Platform.OS === "android" ? Math.max(insets.top, StatusBar.currentHeight || 0) : insets.top) : 0;
  const bottomInset = withSafeArea ? Math.max(insets.bottom, Platform.OS === "android" ? 44 : 0) : 0;

  return (
    <View testID={testID} style={[styles.flex, {backgroundColor: bg, paddingTop: topInset, paddingBottom: bottomInset}, style]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} {...({backgroundColor: bg, translucent: !withSafeArea} as any)} />
      {wrapped}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  scrollContent: {flexGrow: 1},
});
