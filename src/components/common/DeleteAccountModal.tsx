import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";

interface DeleteAccountModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirmDelete: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = React.memo(({
  visible,
  onCancel,
  onConfirmDelete,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetCard}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onCancel}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Warning Icon Badge */}
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarEmoji}>👩‍🦰</Text>
                  </View>
                  <View style={styles.badgeCrossCircle}>
                    <Text style={styles.crossIcon}>✕</Text>
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>Delete Account</Text>

                {/* Subtitle Card */}
                <View style={styles.noticeCard}>
                  <Text style={styles.noticeTitle}>
                    Are you sure you want to say goodbye?
                  </Text>
                  <Text style={styles.noticeDesc}>
                    Deleting your account is permanent. Once you confirm, your entire
                    salon-at-home history will be wiped clean, and we won't be able
                    to recover it for you.
                  </Text>
                </View>

                {/* What You Will Lose Card */}
                <View style={styles.consequencesCard}>
                  <Text style={styles.consequencesTitle}>
                    You will lose if you delete your account
                  </Text>

                  <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.bulletBold}>Your Styling History: </Text>
                      Access to your past bookings, favorite treatments, and receipts will be gone.
                    </Text>
                  </View>

                  <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.bulletBold}>Saved Stylists: </Text>
                      You will lose your curated list of preferred professionals who know exactly how you like your hair, nails, or skin treated.
                    </Text>
                  </View>

                  <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.bulletBold}>Loyalty Points & Rewards: </Text>
                      Any unused cashback, promo codes, or active membership perks will be permanently forfeited.
                    </Text>
                  </View>

                  <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.bulletBold}>Saved Addresses & Payments: </Text>
                      Your saved home/work addresses and secure payment methods will be completely erased.
                    </Text>
                  </View>

                  <View style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      <Text style={styles.bulletBold}>Pending Bookings: </Text>
                      Any scheduled appointments will be immediately canceled (subject to our cancellation policy).
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.8}
                    onPress={onCancel}
                  >
                    <Text style={styles.cancelBtnText}>No, Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    activeOpacity={0.8}
                    onPress={onConfirmDelete}
                  >
                    <Text style={styles.deleteBtnText}>Yes, Delete</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  sheetCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: "88%",
  },
  closeBtn: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "700",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginVertical: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  avatarEmoji: {
    fontSize: 38,
  },
  badgeCrossCircle: {
    position: "absolute",
    top: -2,
    left: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  crossIcon: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  noticeCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    width: "100%",
    marginBottom: 14,
  },
  noticeTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  noticeDesc: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
    textAlign: "center",
  },
  consequencesCard: {
    backgroundColor: "#FFFBFB",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    width: "100%",
    marginBottom: 20,
  },
  consequencesTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#114B3E",
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: "#64748B",
    marginRight: 6,
    lineHeight: 17,
  },
  bulletText: {
    flex: 1,
    fontSize: 11.5,
    color: "#475569",
    lineHeight: 16,
  },
  bulletBold: {
    fontWeight: "700",
    color: "#0F172A",
  },
  actionRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#114B3E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
