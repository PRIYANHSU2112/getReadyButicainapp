import React, {useState, useEffect, useRef} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Alert,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {KycStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {OnboardingHeader} from "../../components/onboarding";
import {IMAGES} from "../../constants/images";
import {mediaService} from "../../services/mediaService";
import {kycService} from "../../services/kycService";
import {isLocalFile, isRealImage} from "../../utils/files";
import {toast} from "../../components/common/Toast";

type Props = NativeStackScreenProps<KycStackParamList, "Selfie">;

export const SelfieScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {partner, updatePartner} = useAuth();

  // Selfie capture state (defaults to demo image matching screenshot)
  const [selfieUri, setSelfieUri] = useState<string | null>(partner?.avatar ?? null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Smooth 60-FPS scanning laser animation across the face viewfinder
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.start();

    return () => {
      scanLoop.stop();
    };
  }, [scanAnim]);

  // Open camera or image picker
  const handleCapturePhoto = () => {
    Alert.alert(
      "Selfie Verification",
      "Choose capture method for your live selfie verification:",
      [
        {
          text: "Open Camera",
          onPress: async () => {
            setIsCapturing(true);
            try {
              const media = await mediaService.openCamera({
                width: 1000,
                height: 1333,
                cropping: true,
                cropperCircleOverlay: false,
              });
              if (media?.path) {
                setSelfieUri(media.path);
              }
            } finally {
              setIsCapturing(false);
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            setIsCapturing(true);
            try {
              const media = await mediaService.openGallery({
                width: 1000,
                height: 1333,
                cropping: true,
              });
              if (media?.path) {
                setSelfieUri(media.path);
              }
            } finally {
              setIsCapturing(false);
            }
          },
        },
        {text: "Cancel", style: "cancel"},
      ]
    );
  };

  const [uploading, setUploading] = useState(false);

  const handleSaveAndContinue = async () => {
    if (uploading) return;
    // Already-uploaded remote avatar → nothing to send again.
    const uri = selfieUri ?? "";
    if (!isLocalFile(uri)) {
      if (uri.startsWith("http")) return navigation.navigate("KycReview");
      Alert.alert("Selfie Required", "Please capture a selfie holding your ID card.");
      return;
    }
    setUploading(true);
    try {
      await kycService.ensureProfile();
      await kycService.uploadSelfie(uri);
      updatePartner({avatar: uri});
      toast.success("Selfie uploaded");
      navigation.navigate("KycReview");
    } catch {
      // error toast raised by the API layer
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Interpolate laser line position vertically across viewfinder (approx 280dp travel)
  const laserTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 320],
  });

  const laserOpacity = scanAnim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0.3, 0.9, 0.9, 0.3],
  });

  return (
    <View style={styles.screenContainer}>
      {/* Onboarding Header with Step 6 of 7 (86% progress) */}
      <OnboardingHeader
        title="Profile Creation"
        stepNumber={6}
        totalSteps={7}
        onBackPress={handleBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 20, 32)},
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Title Section matching Screenshot 4 */}
        <View style={styles.titleSection}>
          <Text maxFontSizeMultiplier={1.3} style={styles.mainTitle}>
            Selfie Verification
          </Text>
          <Text maxFontSizeMultiplier={1.3} style={styles.subTitle}>
            We need to verify your identity to ensure a safe environment for all professional beauticians.
          </Text>
        </View>

        {/* Camera Viewfinder Card matching Screenshot 4 */}
        <View style={styles.viewfinderWrapper}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={handleCapturePhoto}
            accessibilityRole="button"
            accessibilityLabel="Tap to capture or change selfie"
            style={styles.viewfinderCard}>
            {/* Background Selfie / Camera Image */}
            <Image
              source={isRealImage(selfieUri) ? {uri: selfieUri!} : IMAGES.SELFIE_SAMPLE}
              style={styles.selfieImage}
              resizeMode="cover"
              // Dim the guide illustration so it's clearly not the captured selfie.
              {...(!isRealImage(selfieUri) ? {blurRadius: 6} : {})}
            />

            {/* Subtle dark gradient overlay to ensure oval and badge visibility */}
            <View style={styles.viewfinderVignette} />

            {/* Dotted Oval Face Framing Guide matching Screenshot 4 */}
            <View style={styles.ovalGuideContainer} pointerEvents="none">
              <View style={styles.ovalDashedBorder} />
            </View>

            {/* Animated Laser Scanning Line */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.scanningBeam,
                {
                  transform: [{translateY: laserTranslateY}],
                  opacity: laserOpacity,
                },
              ]}
            >
              <View style={styles.scanningBeamCore} />
            </Animated.View>

            {/* Retake Camera Tap Overlay Chip */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCapturePhoto}
              style={styles.retakeChip}>
              <Text style={styles.retakeChipIcon}>📷</Text>
              <Text style={styles.retakeChipText}>Retake Photo</Text>
            </TouchableOpacity>

            {/* Bottom Lighting Guidance Pill matching Screenshot 4 */}
            <View style={styles.guidancePill}>
              <Text style={styles.guidanceIcon}>☀️</Text>
              <Text style={styles.guidanceText}>
                Look straight, ensure good lighting
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Verification Tips Box matching Screenshot 4 */}
        <View style={styles.tipsBox}>
          <View style={styles.tipsIconCircle}>
            <Text style={styles.tipsIconText}>ⓘ</Text>
          </View>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Verification Tips</Text>
            <Text style={styles.tipsDescription}>
              Remove glasses or hats. Hold your phone at eye level.
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSaveAndContinue}
            disabled={isCapturing || uploading}
            accessibilityRole="button"
            accessibilityLabel="Save and Continue"
            style={[styles.saveContinueBtn, (isCapturing || uploading) && {opacity: 0.7}]}>
            <Text style={styles.saveContinueText}>{uploading ? "Uploading…" : "Save and Continue →"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 18,
  },
  viewfinderWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  viewfinderCard: {
    width: "100%",
    height: 410,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1F2937",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  selfieImage: {
    width: "100%",
    height: "100%",
  },
  viewfinderVignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  ovalGuideContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  ovalDashedBorder: {
    width: 210,
    height: 290,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.9)",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  scanningBeam: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#34D399",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  scanningBeamCore: {
    height: "100%",
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  retakeChip: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  retakeChipIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  retakeChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  guidancePill: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.72)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  guidanceIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  guidanceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  tipsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  tipsIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#6B7280",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  tipsIconText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    lineHeight: 14,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  tipsDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  bottomActions: {
    marginTop: 4,
    paddingBottom: 16,
  },
  saveContinueBtn: {
    backgroundColor: "#114B3E",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveContinueText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  backBtn: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
  },
});
