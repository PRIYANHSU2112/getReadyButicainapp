import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";

interface ServiceUnderReviewModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

const {width: SCREEN_WIDTH} = Dimensions.get("window");

export const ServiceUnderReviewModal: React.FC<ServiceUnderReviewModalProps> = ({
  visible,
  onClose,
  title = "Service Under review",
  message = "Once admin will verify and approved your service Package request it will add in your Bucket.",
  buttonText = "Back to Home",
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Text maxFontSizeMultiplier={1.3} style={styles.modalTitle}>
                {title}
              </Text>
              <Text maxFontSizeMultiplier={1.3} style={styles.modalDescription}>
                {message}
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={buttonText}
                style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: Math.min(SCREEN_WIDTH - 48, 340),
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  actionButton: {
    width: "100%",
    backgroundColor: "#114B3E", // Deep emerald matching Figma screenshots
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
