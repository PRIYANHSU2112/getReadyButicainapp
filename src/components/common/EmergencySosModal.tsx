import React, {useRef, useEffect} from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";

interface EmergencySosModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirmSos: () => void;
}

const {width} = Dimensions.get("window");

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  visible,
  onCancel,
  onConfirmSos,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}>
      <View style={styles.backdropOverlay}>
        <Animated.View
          style={[
            styles.dialogContainer,
            {
              opacity: opacityAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Red Warning Hexagon/Circle Emblem matching Image 2 */}
          <View style={styles.warningEmblemWrapper}>
            <View style={styles.warningCircle}>
              <Text style={styles.warningTriangleIcon}>▲</Text>
              <Text style={styles.exclamationMark}>!</Text>
            </View>
          </View>

          {/* Title matching Image 2: "Are you in Emergency?" */}
          <Text maxFontSizeMultiplier={1.3} style={styles.dialogTitle}>
            Are you in Emergency?
          </Text>

          {/* Subtitle matching Image 2 */}
          <Text maxFontSizeMultiplier={1.3} style={styles.dialogSubtitle}>
            Tap SOS to call emergency services (112) right away. Only use this in
            a real emergency.
          </Text>

          {/* Action Buttons: Cancel and SOS matching Image 2 */}
          <View style={styles.buttonRow}>
            {/* Outline Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel Emergency"
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {/* Filled Red SOS Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onConfirmSos}
              accessibilityRole="button"
              accessibilityLabel="Confirm SOS Emergency"
              style={styles.sosConfirmButton}>
              <Text style={styles.sosConfirmButtonText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  dialogContainer: {
    width: Math.min(width - 48, 360),
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  warningEmblemWrapper: {
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  warningCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#B91C1C", // Deep crimson red matching Image 2
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#B91C1C",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  warningTriangleIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    lineHeight: 30,
  },
  exclamationMark: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "900",
    color: "#B91C1C",
    top: 24,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  dialogSubtitle: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#B91C1C",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B91C1C",
  },
  sosConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#B91C1C", // Deep red matching Image 2
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B91C1C",
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  sosConfirmButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
