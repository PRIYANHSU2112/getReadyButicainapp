import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Animated, Pressable, StyleSheet, Text, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useTheme} from "../../theme";

type ToastKind = "success" | "error" | "info" | "warning";
interface ToastMsg { id: number; kind: ToastKind; message: string; }

// Imperative API so services / query cache can raise alerts without hooks.
let push: ((kind: ToastKind, message: string) => void) | null = null;
export const toast = {
  success: (m: string) => push?.("success", m),
  error: (m: string) => push?.("error", m),
  info: (m: string) => push?.("info", m),
  warning: (m: string) => push?.("warning", m),
};

const ICON: Record<ToastKind, string> = {success: "✓", error: "!", info: "i", warning: "⚠"};
const DURATION = 3200;

export const ToastHost: React.FC = () => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<ToastMsg | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMsg = useRef<{text: string; at: number}>({text: "", at: 0});

  const hide = useCallback(() => {
    Animated.timing(anim, {toValue: 0, duration: 200, useNativeDriver: true}).start(() => setCurrent(null));
  }, [anim]);

  useEffect(() => {
    push = (kind, message) => {
      const now = Date.now();
      // Dedupe identical alerts fired in a burst (e.g. parallel failing queries).
      if (lastMsg.current.text === message && now - lastMsg.current.at < 1500) return;
      lastMsg.current = {text: message, at: now};
      if (timer.current) clearTimeout(timer.current);
      setCurrent({id: now, kind, message});
      anim.setValue(0);
      Animated.spring(anim, {toValue: 1, useNativeDriver: true, friction: 8}).start();
      timer.current = setTimeout(hide, DURATION);
    };
    return () => { push = null; if (timer.current) clearTimeout(timer.current); };
  }, [anim, hide]);

  const tone = useMemo(() => {
    const c = theme.colors;
    const map = {success: c.success, error: c.error, info: c.info, warning: c.warning};
    return current ? map[current.kind] : c.primary;
  }, [current, theme.colors]);

  if (!current) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {bottom: insets.bottom + 72, opacity: anim, transform: [{translateY: anim.interpolate({inputRange: [0, 1], outputRange: [40, 0]})}]},
      ]}>
      <Pressable
        onPress={hide}
        accessibilityRole="alert"
        style={[styles.card, theme.shadows.lg,{backgroundColor: theme.colors.emerald[900], borderLeftColor: tone}]}>
        <View style={[styles.icon, {backgroundColor: tone}]}>
          <Text style={styles.iconText}>{ICON[current.kind]}</Text>
        </View>
        <Text style={[styles.text, {color: theme.colors.white}]} numberOfLines={3}>{current.message}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {position: "absolute", left: 16, right: 16, zIndex: 9999, elevation: 30},
  card: {flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderLeftWidth: 4},
  icon: {width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 12},
  iconText: {color: "#FFFFFF", fontWeight: "700", fontSize: 14},
  text: {flex: 1, fontSize: 14, fontWeight: "500", lineHeight: 20},
});
