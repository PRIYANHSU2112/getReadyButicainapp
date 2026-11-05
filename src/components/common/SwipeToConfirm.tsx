import React, {useEffect, useMemo, useRef, useState} from "react";
import {Animated, LayoutChangeEvent, PanResponder, StyleSheet, Text, View} from "react-native";
import {useTheme} from "../../theme";

interface SwipeToConfirmProps {
  label: string;
  onComplete: () => void;
  // While true the knob stays at the end (work in flight); when it clears the knob resets.
  busy?: boolean;
  disabled?: boolean;
}

const KNOB = 48;
const PAD = 4;
// How far the knob must travel (fraction of the track) before release counts as confirmed.
const COMPLETE_AT = 0.8;

// Drag-to-confirm control for deliberate actions (e.g. going on duty). Screen-reader users
// get a plain "activate" action instead of having to perform the drag gesture.
export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({label, onComplete, busy = false, disabled = false}) => {
  const {theme} = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;

  // PanResponder is created once; it reads live values through refs.
  const maxX = Math.max(0, trackWidth - KNOB - PAD * 2);
  const maxRef = useRef(0);
  maxRef.current = maxX;
  const blockedRef = useRef(false);
  blockedRef.current = disabled || busy;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const reset = () => Animated.spring(x, {toValue: 0, useNativeDriver: false, friction: 8}).start();

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !blockedRef.current,
        onMoveShouldSetPanResponder: () => !blockedRef.current,
        onPanResponderMove: (_, g) => x.setValue(Math.min(Math.max(0, g.dx), maxRef.current)),
        onPanResponderRelease: (_, g) => {
          if (maxRef.current > 0 && g.dx >= maxRef.current * COMPLETE_AT) {
            Animated.timing(x, {toValue: maxRef.current, duration: 100, useNativeDriver: false}).start(() =>
              onCompleteRef.current(),
            );
          } else {
            reset();
          }
        },
        onPanResponderTerminate: reset,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [x],
  );

  // If the action failed and we're still mounted, bring the knob back.
  useEffect(() => {
    if (!busy) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  // Label fades as the knob covers it.
  const labelOpacity = x.interpolate({
    inputRange: [0, Math.max(1, maxX * 0.6)],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View
      onLayout={onLayout}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: disabled || busy, busy}}
      accessibilityActions={[{name: "activate", label}]}
      onAccessibilityAction={() => {
        if (!blockedRef.current) onCompleteRef.current();
      }}
      style={[styles.track, {backgroundColor: theme.colors.surfaceVariant}, (disabled || busy) && styles.dimmed]}>
      <Animated.Text style={[styles.label, {color: theme.colors.primary, opacity: labelOpacity}]}>
        {busy ? "Please wait…" : label}
      </Animated.Text>
      <Animated.View
        {...pan.panHandlers}
        style={[styles.knob, {backgroundColor: theme.colors.surface, transform: [{translateX: x}]}]}>
        <View style={[styles.knobIcon, {borderColor: theme.colors.primary}]}>
          <Text style={[styles.arrow, {color: theme.colors.primary}]}>→</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: KNOB + PAD * 2,
    borderRadius: (KNOB + PAD * 2) / 2,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  dimmed: {
    opacity: 0.6,
  },
  label: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    paddingLeft: KNOB,
  },
  knob: {
    position: "absolute",
    left: PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  knobIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
});
