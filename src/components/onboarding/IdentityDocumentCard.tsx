import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import {openCamera, openGallery} from "../../services/mediaService";

export type DocStatus = "pending" | "verified" | "rejected";

interface IdentityDocumentCardProps {
  title: string;
  filename?: string;
  errorMessage?: string;
  status: DocStatus;
  imageUri?: string | null;
  sideLabel?: string; // e.g. "Upload Front Side"
  onStatusChange: (status: DocStatus, uri: string | null) => void;
}

export const IdentityDocumentCard: React.FC<IdentityDocumentCardProps> = ({
  title,
  filename,
  errorMessage,
  status,
  imageUri,
  sideLabel = "Upload Front Side",
  onStatusChange,
}) => {
  const handlePickDocument = () => {
    Alert.alert(
      `Upload ${title}`,
      "Select capture method:",
      [
        {
          text: "Take Photo (Camera)",
          onPress: async () => {
            const media = await openCamera({
              width: 1000,
              height: 650,
              cropping: true,
            });
            if (media?.path) {
              onStatusChange("verified", media.path);
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const media = await openGallery({
              width: 1000,
              height: 650,
              cropping: true,
            });
            if (media?.path) {
              onStatusChange("verified", media.path);
            }
          },
        },
        ...(imageUri
          ? [{text: "Remove", style: "destructive" as const, onPress: () => onStatusChange("pending", null)}]
          : []),
        {text: "Cancel", style: "cancel" as const},
      ],
      {cancelable: true}
    );
  };

  const isVerified = status === "verified";
  const isRejected = status === "rejected";
  const isPending = status === "pending";

  const getSubtitle = () => {
    if (isRejected && errorMessage) return errorMessage;
    if (isVerified && filename) return filename;
    if (isPending) return "Pending upload";
    return filename || "Document uploaded";
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row with Icon, Title/Subtitle, and Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.docIconBox}>
            <Text style={styles.docIconEmoji}>🪪</Text>
          </View>
          <View style={styles.titleTextBox}>
            <Text style={styles.docTitle}>{title}</Text>
            <Text
              style={[
                styles.docSubtitle,
                isRejected && styles.docSubtitleRejected,
              ]}>
              {getSubtitle()}
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        {isVerified ? (
          <View style={styles.badgeVerify}>
            <Text style={styles.badgeVerifyText}>✔ VERIFY</Text>
          </View>
        ) : isRejected ? (
          <View style={styles.badgeReject}>
            <Text style={styles.badgeRejectText}>🗙 REJECT</Text>
          </View>
        ) : (
          <View style={styles.badgePending}>
            <Text style={styles.badgePendingText}>⏳ PENDING</Text>
          </View>
        )}
      </View>

      {/* Middle Content Zone: Upload box or Card preview */}
      {isPending ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePickDocument}
          style={styles.pendingUploadBox}>
          <Text style={styles.cloudIcon}>☁</Text>
          <Text style={styles.uploadSideText}>{sideLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.previewContainer,
            isRejected && styles.previewRejectedBorder,
          ]}>
          {/* The actual uploaded document */}
          {imageUri ? (
            <Image
              source={{uri: imageUri}}
              style={[styles.docPreview, isRejected && styles.docPreviewDimmed]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardMockup, styles.docMissing]}>
              <Text style={styles.docMissingText}>Document not available</Text>
            </View>
          )}
        </View>
      )}

      {/* Action Button Below Image / Upload Zone */}
      {isPending ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePickDocument}
          style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>Upload</Text>
        </TouchableOpacity>
      ) : isRejected ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePickDocument}
          style={styles.reuploadBtn}>
          <Text style={styles.reuploadBtnText}>🔄 Re-upload Document</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePickDocument}
          style={styles.replaceBtn}>
          <Text style={styles.replaceBtnText}>Replace Document</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  docIconEmoji: {
    fontSize: 20,
  },
  titleTextBox: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#1F2937",
  },
  docSubtitle: {
    fontSize: 11.5,
    color: "#6B7280",
    marginTop: 2,
  },
  docSubtitleRejected: {
    color: "#EF4444",
    fontWeight: "500",
  },
  badgeVerify: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeVerifyText: {
    color: "#137333",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  badgeReject: {
    backgroundColor: "#FCE8E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeRejectText: {
    color: "#D93025",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePendingText: {
    color: "#D97706",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  pendingUploadBox: {
    height: 125,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#FCA5A5", // Soft red dashed border per Figma
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cloudIcon: {
    fontSize: 28,
    color: "#6B7280",
  },
  uploadSideText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
    marginTop: 6,
  },
  previewContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  previewRejectedBorder: {
    borderWidth: 1.5,
    borderColor: "#F87171",
  },
  cardMockup: {
    height: 140,
    padding: 12,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  docPreview: {width: "100%", height: 140, borderRadius: 12, backgroundColor: "#E2E8F0"},
  docPreviewDimmed: {opacity: 0.7},
  docMissing: {alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9"},
  docMissingText: {fontSize: 12, color: "#64748B"},
  mockCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mockChip: {
    width: 24,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#D4AF37", // Gold chip
  },
  mockGovText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.8,
  },
  mockBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mockPhoto: {
    width: 48,
    height: 56,
    borderRadius: 6,
  },
  mockDetails: {
    flex: 1,
  },
  mockName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.4,
  },
  mockNumber: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    marginTop: 2,
    letterSpacing: 1,
  },
  mockDob: {
    fontSize: 9.5,
    color: "#6B7280",
    marginTop: 2,
  },
  uploadBtn: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#114B3E",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtnText: {
    color: "#114B3E",
    fontSize: 14,
    fontWeight: "700",
  },
  replaceBtn: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#114B3E",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  replaceBtnText: {
    color: "#114B3E",
    fontSize: 14,
    fontWeight: "700",
  },
  reuploadBtn: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  reuploadBtnText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
});
