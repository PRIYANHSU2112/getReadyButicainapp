import React, {useState, useEffect, useRef} from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import {IMAGES} from "../../constants/images";
import {IncomingBookingData} from "../../types";

interface IncomingBookingModalProps {
  visible: boolean;
  data?: IncomingBookingData;
  onAccept: (booking: IncomingBookingData) => void;
  onReject: (booking: IncomingBookingData) => void;
  onClose?: () => void;
}

const {width} = Dimensions.get("window");

export const IncomingBookingModal: React.FC<IncomingBookingModalProps> = ({
  visible,
  data,
  onAccept,
  onReject,
  onClose,
}) => {
  const initialCountdown = data?.initialCountdown || 28;
  const [countdown, setCountdown] = useState(initialCountdown);

  // Animations for smooth entrance and pulse
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setCountdown(initialCountdown);
      // Smooth pop-in animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      // Soft pulse animation on timer ring
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => {
        pulseLoop.stop();
      };
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, initialCountdown, scaleAnim, opacityAnim, pulseAnim]);

  // Tick down seconds
  useEffect(() => {
    if (!visible) return;
    if (countdown <= 0) {
      if (onClose) onClose();
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, countdown, onClose]);

  if (!visible || !data) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.backdropOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Header Tag matching Image 4 */}
          <Text style={styles.newRequestTag}>NEW REQUEST</Text>
          <Text maxFontSizeMultiplier={1.3} style={styles.incomingTitle}>
            Incoming Booking
          </Text>

          {/* Circular Countdown Ring matching Image 4 */}
          <Animated.View
            style={[
              styles.timerRingOuter,
              {transform: [{scale: pulseAnim}]},
            ]}>
            <View style={styles.timerRingInner}>
              <Text style={styles.timerCountText}>{countdown}</Text>
              <Text style={styles.timerLabelText}>SECONDS</Text>
            </View>
          </Animated.View>

          {/* Customer & Payout Info Card matching Image 4 */}
          <View style={styles.customerCard}>
            <Image
              source={IMAGES.CLIENT_AVATAR}
              style={styles.customerAvatar}
              resizeMode="cover"
            />
            <View style={styles.customerMeta}>
              <Text style={styles.customerName}>{data.clientName}</Text>
              {!!data.membershipTag && <Text style={styles.membershipTag}>⭐ {data.membershipTag}</Text>}
            </View>
            <View style={styles.payoutColumn}>
              <Text style={styles.payoutHeader}>💵 PAY</Text>
              <Text style={styles.payoutValue}>₹{data.payoutAmount.toLocaleString()}</Text>
            </View>
          </View>

          {/* 2-Column Service and Schedule Box matching Image 4 */}
          <View style={styles.twoColumnGrid}>
            <View style={styles.gridBox}>
              <Text style={styles.boxHeaderLabel}>✒ SERVICE</Text>
              <Text style={styles.boxValueText}>{data.serviceName}</Text>
            </View>
            <View style={styles.gridBox}>
              <Text style={styles.boxHeaderLabel}>📅 DATE & TIME</Text>
              <Text style={styles.boxValueText}>{data.dateTime}</Text>
            </View>
          </View>

          {/* Address Box with Distance Pill matching Image 4 */}
          <View style={styles.addressBox}>
            <View style={styles.addressHeaderRow}>
              <Text style={styles.addressHeaderLabel}>📍 ADDRESS</Text>
              {!!data.distanceKm && (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>{data.distanceKm}</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText} numberOfLines={2}>
              {data.address}
            </Text>
          </View>

          {/* Action Buttons matching Image 4 */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => onAccept(data)}
              accessibilityRole="button"
              accessibilityLabel="Accept Request"
              style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Accept Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onReject(data)}
              accessibilityRole="button"
              accessibilityLabel="Reject"
              style={styles.rejectButton}>
              <Text style={styles.rejectButtonText}>Reject</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.62)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: Math.min(width - 32, 380),
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  newRequestTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#114B3E", // Deep emerald
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  incomingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  timerRingOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 4,
    borderColor: "#FCE7F3", // Soft rose pink ring
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    backgroundColor: "#FFF1F2",
  },
  timerRingInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerCountText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1F2937",
    lineHeight: 38,
  },
  timerLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.8,
  },
  customerCard: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: "#E5E7EB",
  },
  customerMeta: {
    flex: 1,
  },
  customerName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#111827",
  },
  membershipTag: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  payoutColumn: {
    alignItems: "flex-end",
  },
  payoutHeader: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#114B3E",
    letterSpacing: 0.5,
  },
  payoutValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginTop: 1,
  },
  twoColumnGrid: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  gridBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  boxHeaderLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#114B3E",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  boxValueText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#1F2937",
  },
  addressBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 16,
  },
  addressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  addressHeaderLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#114B3E",
    letterSpacing: 0.6,
  },
  distanceBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  distanceBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#6B7280",
  },
  addressText: {
    fontSize: 12.5,
    color: "#374151",
    fontWeight: "500",
  },
  actionsContainer: {
    width: "100%",
    gap: 10,
  },
  acceptButton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#114B3E", // Deep emerald
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  rejectButton: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#EF4444", // Red outline
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
});
