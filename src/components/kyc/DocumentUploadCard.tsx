import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";
import {useTheme} from "../../theme";
import {openCamera, openGallery, PickedMedia} from "../../services/mediaService";

interface DocumentUploadCardProps {
  title: string;
  subtitle: string;
  imageUri?: string | null;
  onImageSelected: (media: PickedMedia) => void;
  required?: boolean;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  title,
  subtitle,
  imageUri,
  onImageSelected,
  required = false,
}) => {
  const {theme} = useTheme();

  const handleSelectSource = () => {
    Alert.alert(
      "Upload Document",
      "Choose capture method",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const media = await openCamera();
            if (media) onImageSelected(media);
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const media = await openGallery();
            if (media) onImageSelected(media);
          },
        },
        {text: "Cancel", style: "cancel"},
      ],
      {cancelable: true}
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.cardBorder,
        },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[theme.typography.h4, {color: theme.colors.textPrimary}]}>
          {title} {required ? <Text style={{color: theme.colors.error}}>*</Text> : null}
        </Text>
      </View>
      <Text
        style={[
          theme.typography.caption,
          {color: theme.colors.textSecondary, marginTop: 2, marginBottom: 12},
        ]}>
        {subtitle}
      </Text>

      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{uri: imageUri}} style={styles.previewImage} />
          <TouchableOpacity
            style={[styles.reuploadBtn, {backgroundColor: theme.colors.surface}]}
            activeOpacity={0.8}
            onPress={handleSelectSource}>
            <Text style={[theme.typography.caption, {color: theme.colors.primary, fontWeight: "600"}]}>
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSelectSource}
          style={[
            styles.uploadZone,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.uploadIcon, {color: theme.colors.primary}]}>📷</Text>
          <Text
            style={[
              theme.typography.body2,
              {color: theme.colors.primary, fontWeight: "600", marginTop: 6},
            ]}>
            Tap to Upload Document
          </Text>
          <Text
            style={[
              theme.typography.captionSmall,
              {color: theme.colors.textTertiary, marginTop: 4},
            ]}>
            Supports JPG, PNG (Max 5MB)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uploadZone: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIcon: {
    fontSize: 28,
  },
  previewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  reuploadBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
