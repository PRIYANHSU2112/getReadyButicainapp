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

interface AvatarUploadPickerProps {
  imageUri?: string | null;
  onImageSelected: (uri: string) => void;
}

export const AvatarUploadPicker: React.FC<AvatarUploadPickerProps> = ({
  imageUri,
  onImageSelected,
}) => {
  const handlePress = () => {
    Alert.alert(
      "Profile Photo",
      "Choose photo source",
      [
        {
          text: "Take Photo (Camera)",
          onPress: async () => {
            const media = await openCamera({
              width: 500,
              height: 500,
              cropping: true,
              cropperCircleOverlay: true,
            });
            if (media?.path) {
              onImageSelected(media.path);
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const media = await openGallery({
              width: 500,
              height: 500,
              cropping: true,
              cropperCircleOverlay: true,
            });
            if (media?.path) {
              onImageSelected(media.path);
            }
          },
        },
        {text: "Cancel", style: "cancel"},
      ],
      {cancelable: true}
    );
  };

  // Ignore legacy "demo"/"sample" placeholders stored before real uploads existed.
  const isPlaceholder = !imageUri || imageUri === "demo" || imageUri === "sample";
  const hasImage = !isPlaceholder;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Upload profile photo"
        style={styles.avatarWrapper}>
        {hasImage ? (
          <Image
            source={{uri: imageUri!}}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.emptyPlaceholder}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        )}

        {/* Action badge at bottom right */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeIcon}>{hasImage ? "✎" : "+"}</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.subtext}>Upload Profile Photo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 14,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    position: "relative",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  emptyPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  cameraIcon: {
    fontSize: 34,
    opacity: 0.6,
  },
  badgeContainer: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#114B3E", // Deep emerald
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  badgeIcon: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  subtext: {
    fontSize: 11.5,
    color: "#9CA3AF",
    marginTop: 8,
    fontWeight: "500",
  },
});
