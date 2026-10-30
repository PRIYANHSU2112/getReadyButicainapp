import React, {useRef, useEffect} from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

interface FloatingSosButtonProps {
  onPress: () => void;
  bottomOffset?: number;
}

export const FloatingSosButton: React.FC<FloatingSosButtonProps> = ({
  onPress,
  bottomOffset,
}) => {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Gentle periodic alert pulse to keep SOS accessible & recognizable
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulseAnim]);

  // Position above the tab bar and above system navigation bar
  const calculatedBottom =
    bottomOffset !== undefined
      ? bottomOffset
      : 76 + (insets.bottom > 0 ? insets.bottom : 10);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: calculatedBottom,
          transform: [{scale: pulseAnim}],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Emergency SOS Alert"
        style={styles.sosButton}>
        {/* Siren / Alert Icon matching Image 4 */}
        <View style={styles.iconCircle}>
          <Text style={styles.sirenIcon}>🚨</Text>
        </View>
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    zIndex: 99,
  },
  sosButton: {
    width: 58,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#B91C1C", // Vibrant crimson matching Image 4
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B91C1C",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "#DC2626",
    paddingVertical: 4,
  },
  iconCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sirenIcon: {
    fontSize: 20,
    lineHeight: 22,
  },
  sosText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.2,
  },
});
