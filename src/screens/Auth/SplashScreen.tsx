import React, {useEffect} from "react";
import {StyleSheet, Text, View, ActivityIndicator, Dimensions} from "react-native";
import {useTheme} from "../../theme";
import {AppIcon} from "../../components/common";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export const SplashScreen: React.FC<Props> = ({navigation}) => {
  const {theme} = useTheme();
  const {isAuthenticated, isRestoring, partner} = useAuth();

  useEffect(() => {
    if (isRestoring) return;
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigation.replace("Onboarding");
      } else if (partner?.kycStatus !== "approved") {
        navigation.replace("KycStack", {screen: "PersonalInfo"});
      } else {
        navigation.replace("MainTabs", {screen: "DashboardTab"});
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isRestoring, partner, navigation]);

  return (
    <View style={styles.container}>
      {/* Green top panel with the peaked lower edge from the Figma splash */}
      <View style={[styles.topPanel, {backgroundColor: theme.colors.primary}]}>
        <View style={styles.logoFrame}>
          <AppIcon name="user" size={44} color="#FFFFFF" />
        </View>
        <View
          style={[
            styles.peak,
            {
              borderLeftWidth: SCREEN_WIDTH / 2,
              borderRightWidth: SCREEN_WIDTH / 2,
              borderBottomWidth: PEAK_HEIGHT,
            },
          ]}
        />
      </View>

      <View style={styles.wordmarkBox}>
        <Text style={styles.wordmark} accessibilityRole="header">
          <Text style={{color: theme.colors.primary}}>GET </Text>
          <Text style={{color: theme.colors.crimson}}>READY</Text>
        </Text>
        <Text style={styles.tagline}>Beauty salon at home</Text>
      </View>

      <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
    </View>
  );
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const PEAK_HEIGHT = 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topPanel: {
    height: "44%",
    alignItems: "center",
    justifyContent: "center",
  },
  // White triangle sitting on the bottom edge of the panel creates the peak.
  peak: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFFFFF",
  },
  logoFrame: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: PEAK_HEIGHT / 2,
  },
  wordmarkBox: {
    alignItems: "center",
    marginTop: 56,
  },
  wordmark: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 2,
    fontSize: 12.5,
    letterSpacing: 3,
    color: "#1F2937",
    fontWeight: "500",
  },
  loader: {
    position: "absolute",
    bottom: 48,
    alignSelf: "center",
  },
});
