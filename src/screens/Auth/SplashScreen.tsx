import React, {useEffect} from "react";
import {StyleSheet, Text, View, ActivityIndicator} from "react-native";
import {useTheme} from "../../theme";
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
    <View style={[styles.container, {backgroundColor: theme.colors.primary}]}>
      <View style={styles.centerBox}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>✂️</Text>
        </View>
        <Text style={[styles.title, {color: theme.colors.gold}]}>GetReady</Text>
        <Text style={styles.partnerSubtitle}>PARTNER & BEAUTICIAN APP</Text>
      </View>
      <ActivityIndicator size="small" color={theme.colors.gold} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerBox: {
    alignItems: "center",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  partnerSubtitle: {
    fontSize: 11,
    color: "#E0E0E0",
    letterSpacing: 2,
    marginTop: 6,
    fontWeight: "600",
  },
  loader: {
    position: "absolute",
    bottom: 48,
  },
});
