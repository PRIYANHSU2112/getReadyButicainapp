import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceCheckOut">;

export const ServiceCheckOutScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {bookingId} = route.params;

  // State to toggle between Home-2 (waiting for after photo) and Home-3 (after photo captured)
  const [hasAfterPhoto, setHasAfterPhoto] = useState(false);

  const handleTakePhoto = () => {
    // In live camera flow, this would launch the camera. For interactive prototype, toggles photo.
    setHasAfterPhoto(true);
  };

  const handleContinue = () => {
    navigation.navigate("EndOtp", {bookingId});
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Home-2.png & Home-3.png */}
      <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top, 14)}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backCircleBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>

        <Text maxFontSizeMultiplier={1.3} style={styles.headerTitle}>
          Service Check Out
        </Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 90, 110)},
        ]}>
        {/* Screen Heading */}
        <Text maxFontSizeMultiplier={1.3} style={styles.mainTitle}>
          Final Results
        </Text>
        <Text style={styles.mainSubtitle}>
          Photos help in service quality tracking
        </Text>

        {/* 1. BEFORE SERVICE PHOTO CARD matching Home-2.png */}
        <View style={styles.photoCard}>
          <Image
            source={IMAGES.SERVICE_HERO_FACIAL}
            style={styles.photoPreview}
            resizeMode="cover"
          />
          <View style={styles.photoBadgePill}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>BEFORE SERVICE</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert("Edit Photo", "Replace Before Service photo.")}
            style={styles.editPencilCircle}>
            <Text style={styles.editPencilIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* 2. AFTER SERVICE PHOTO CARD matching Home-2.png & Home-3.png */}
        {hasAfterPhoto ? (
          // Captured state matching Home-3.png
          <View style={styles.photoCard}>
            <Image
              source={IMAGES.SERVICE_HERO_BRIDAL}
              style={styles.photoPreview}
              resizeMode="cover"
            />
            <View style={styles.photoBadgePill}>
              <View style={styles.badgeDotGreen} />
              <Text style={styles.badgeTextGreen}>AFTER SERVICE</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setHasAfterPhoto(false)}
              style={styles.editPencilCircle}>
              <Text style={styles.editPencilIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Waiting to take photo matching Home-2.png
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleTakePhoto}
            style={styles.takePhotoDashedBox}>
            <View style={styles.cornerBracketTopLeft} />
            <View style={styles.cornerBracketTopRight} />
            <View style={styles.cornerBracketBottomLeft} />
            <View style={styles.cornerBracketBottomRight} />

            <View style={styles.afterBadgePill}>
              <View style={styles.badgeDotGreen} />
              <Text style={styles.badgeTextGreen}>AFTER SERVICE</Text>
            </View>

            <View style={styles.cameraIconCircle}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>

            <Text style={styles.takePhotoTitle}>Take After Photo</Text>
            <Text style={styles.takePhotoSubtitle}>Tap to open camera</Text>
          </TouchableOpacity>
        )}

        {/* Quality Assurance Info Box matching Home-2.png */}
        <View style={styles.qaInfoCard}>
          <Text style={styles.qaInfoIcon}>ℹ️</Text>
          <View style={styles.qaTexts}>
            <Text style={styles.qaTitle}>Quality Assurance</Text>
            <Text style={styles.qaDescription}>
              Encourage the client to pose in similar lighting as the 'Before'
              photo for the best comparison results.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue to Completion Button matching Home-2.png & Home-3.png */}
      <View
        style={[
          styles.bottomActionBar,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleContinue}
          style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Continue to Completion ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FAEDF1",
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#B02B58",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 12.5,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  photoCard: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  photoBadgePill: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4B5563",
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#374151",
    letterSpacing: 0.5,
  },
  badgeDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#114B3E",
    marginRight: 6,
  },
  badgeTextGreen: {
    fontSize: 10,
    fontWeight: "800",
    color: "#114B3E",
    letterSpacing: 0.5,
  },
  editPencilCircle: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  editPencilIcon: {
    fontSize: 14,
  },
  takePhotoDashedBox: {
    width: "100%",
    height: 210,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FECDD3",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 16,
  },
  cornerBracketTopLeft: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#CBD5E1",
  },
  cornerBracketTopRight: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#CBD5E1",
  },
  cornerBracketBottomLeft: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#CBD5E1",
  },
  cornerBracketBottomRight: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#CBD5E1",
  },
  afterBadgePill: {
    position: "absolute",
    top: 12,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cameraIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cameraIcon: {
    fontSize: 24,
  },
  takePhotoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  takePhotoSubtitle: {
    fontSize: 11,
    color: "#6B7280",
  },
  qaInfoCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 14,
  },
  qaInfoIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  qaTexts: {
    flex: 1,
  },
  qaTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  qaDescription: {
    fontSize: 11.5,
    lineHeight: 16,
    color: "#4B5563",
  },
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  continueBtn: {
    backgroundColor: "#114B3E",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  continueBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
