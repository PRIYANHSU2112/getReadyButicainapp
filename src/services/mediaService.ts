import ImagePicker, {ImageOrVideo, Options} from "react-native-image-crop-picker";
import {Alert, PermissionsAndroid, Platform} from "react-native";

export interface PickedMedia {
  path: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  filename?: string;
}

const defaultOptions: Options = {
  width: 1200,
  height: 1200,
  cropping: true,
  cropperCircleOverlay: false,
  compressImageQuality: 0.8,
  mediaType: "photo",
  includeBase64: false,
};

export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "Beautician App needs camera access to capture KYC documents and selfie.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn("Camera permission error:", err);
      return false;
    }
  }
  return true;
};

export const openCamera = async (customOptions?: Partial<Options>): Promise<PickedMedia | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    Alert.alert("Permission Required", "Camera access is needed to capture documents.");
    return null;
  }

  try {
    const result: ImageOrVideo = await ImagePicker.openCamera({
      ...defaultOptions,
      ...customOptions,
    });

    return {
      path: result.path,
      mime: result.mime,
      size: result.size,
      width: result.width,
      height: result.height,
      filename: result.filename ?? result.path.split("/").pop(),
    };
  } catch (error: any) {
    if (error?.code !== "E_PICKER_CANCELLED") {
      console.error("Camera Error:", error);
      Alert.alert("Error", error?.message || "Failed to capture image.");
    }
    return null;
  }
};

export const openGallery = async (customOptions?: Partial<Options>): Promise<PickedMedia | null> => {
  try {
    const result: ImageOrVideo = await ImagePicker.openPicker({
      ...defaultOptions,
      ...customOptions,
    });

    return {
      path: result.path,
      mime: result.mime,
      size: result.size,
      width: result.width,
      height: result.height,
      filename: result.filename ?? result.path.split("/").pop(),
    };
  } catch (error: any) {
    if (error?.code !== "E_PICKER_CANCELLED") {
      console.error("Gallery Error:", error);
      Alert.alert("Error", error?.message || "Failed to pick image from gallery.");
    }
    return null;
  }
};

export const cleanTempImages = async (): Promise<void> => {
  try {
    await ImagePicker.clean();
  } catch (e) {
    console.warn("Could not clean temp images", e);
  }
};

export const mediaService = {
  openCamera,
  openGallery,
  pickImage: openGallery,
  cleanTempImages,
  requestCameraPermission,
};
