import React, {useState, useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {
  ScreenContainer,
  Header,
  LogoutModal,
  DeleteAccountModal,
  AppIcon,
  AppIconName,
} from "../../components/common";
import {useAuth} from "../../context/AuthContext";
import {useHomeSummary} from "../../hooks/queries";
import {isRealImage} from "../../utils/files";

// Tier from lifetime completed services — matches the dashboard's "Gold Expert" badge.
const tierFor = (completed: number, rating: number): string | null => {
  if (completed >= 500 && rating >= 4.5) return "PLATINUM EXPERT";
  if (completed >= 100 && rating >= 4.2) return "GOLD EXPERT";
  if (completed >= 25) return "SILVER EXPERT";
  return completed > 0 ? "NEW PARTNER" : null;
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {partner, logout} = useAuth();
  const {data: summary} = useHomeSummary();

  const completed = summary?.completedBookingsTotal ?? partner?.totalBookings ?? 0;
  // An unrated partner has no rating — a seeded average would be a fabricated one.
  const ratingCount = summary?.ratingCount ?? 0;
  const rating = ratingCount > 0 ? summary?.rating ?? partner?.rating ?? 0 : 0;
  const tier = tierFor(completed, rating);
  // Prefer the server's score; fall back to rating 70% + booking volume 30% (caps at 200 jobs).
  const perfScore =
    summary?.performanceScore ??
    (rating ? Math.round((rating / 5) * 70 + Math.min(completed / 200, 1) * 30) : null);

  const [darkMode, setDarkMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLanguageChange = useCallback(() => {
    Alert.alert("Select Language", "Choose your preferred interface language:", [
      {text: "English", onPress: () => setSelectedLanguage("English")},
      {text: "हिन्दी (Hindi)", onPress: () => setSelectedLanguage("Hindi")},
      {text: "मराठी (Marathi)", onPress: () => setSelectedLanguage("Marathi")},
      {text: "Cancel", style: "cancel"},
    ]);
  }, []);

  const handleConfirmLogout = useCallback(() => {
    setShowLogoutModal(false);
    logout();
  }, [logout]);

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteModal(false);
    Alert.alert(
      "Account Deletion Scheduled",
      "Your partner account has been scheduled for deletion. We are sorry to see you go.",
      [{text: "OK", onPress: () => logout()}]
    );
  }, [logout]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Profile"
        showBack={navigation.canGoBack()}
        onBackPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate("DashboardTab");
          }
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 90, 110)},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR & USER INFO */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("EditProfile")}>
            {isRealImage(partner?.avatar) ? (
              <Image source={{uri: partner!.avatar!}} style={styles.avatarCircle} resizeMode="cover" />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>👩‍🦰</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeIcon}>✎</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{partner?.fullName || "—"}</Text>
          <Text style={styles.userPhone}>{partner?.phoneNumber || "—"}</Text>

          {/* BADGES: driven by real KYC status and rating */}
          <View style={styles.badgeRow}>
            {partner?.kycStatus === "approved" && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedTick}>✔</Text>
                <Text style={styles.verifiedText}>VERIFIED PROFILE</Text>
              </View>
            )}

            {!!tier && (
              <View style={styles.expertBadge}>
                <Text style={styles.expertStar}>⭐</Text>
                <Text style={styles.expertText}>{tier}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 3 STATS CARD */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{completed}</Text>
            <Text style={styles.statLabel}>Completed{"\n"}Services</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{rating ? `${rating.toFixed(1)} ★` : "—"}</Text>
            <Text style={styles.statLabel}>Rating{ratingCount ? ` (${ratingCount})` : ""}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{perfScore ?? "—"}</Text>
            <Text style={styles.statLabel}>Performance{"\n"}Score</Text>
          </View>
        </View>

        {/* MAIN PROFILE NAVIGATION MENU CARD */}
        <View style={styles.menuCard}>
          {[
            {
              title: "Edit Profile",
              iconName: "edit-profile" as AppIconName,
              route: "EditProfile",
            },
            {
              title: "My performance",
              iconName: "performance" as AppIconName,
              route: "MyPerformance",
            },
            {
              title: "My Services",
              iconName: "services" as AppIconName,
              route: "MyServices",
            },
            {
              title: "Documents and Certificates",
              iconName: "documents" as AppIconName,
              route: "DocumentsCertificates",
            },
            {
              title: "Privacy Policy",
              iconName: "privacy" as AppIconName,
              route: "PrivacyPolicy",
            },
            {
              title: "Bank Details",
              iconName: "bank" as AppIconName,
              route: "BankDetails",
            },
            {
              title: "FAQs",
              iconName: "faq" as AppIconName,
              route: "Faq",
            },
            {
              title: "Emergency Contact",
              iconName: "emergency" as AppIconName,
              route: "EmergencyContacts",
            },
            {
              title: "Help & Support",
              iconName: "support" as AppIconName,
              route: "HelpSupport",
            },
          ].map((item, index, arr) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItemRow,
                index === arr.length - 1 && styles.lastMenuItem,
              ]}
              activeOpacity={0.7}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBox}>
                  <AppIcon name={item.iconName} size={20} color="#114B3E" />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SETTINGS CARD: LANGUAGE */}
        <TouchableOpacity
          style={styles.settingCard}
          activeOpacity={0.7}
          onPress={handleLanguageChange}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconBox}>
              <AppIcon name="language" size={20} color="#114B3E" />
            </View>
            <Text style={styles.menuTitle}>Language</Text>
          </View>
          <View style={styles.settingRightRow}>
            <Text style={styles.settingValueText}>{selectedLanguage}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* SETTINGS CARD: DARK MODE */}
        <View style={styles.settingCard}>
          <View style={styles.menuItemLeft}>
            <View style={styles.iconBox}>
              <AppIcon name="dark-mode" size={20} color="#114B3E" />
            </View>
            <Text style={styles.menuTitle}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{false: "#E2E8F0", true: "#A7F3D0"}}
            thumbColor={darkMode ? "#114B3E" : "#FFFFFF"}
          />
        </View>

        {/* SETTINGS CARD: APP VERSION */}
        <View style={styles.settingCard}>
          <View style={styles.menuItemLeft}>
            <View style={styles.iconBox}>
              <AppIcon name="app-version" size={20} color="#114B3E" />
            </View>
            <Text style={styles.menuTitle}>App Version</Text>
          </View>
          <Text style={styles.settingValueText}>V.11. 265 ›</Text>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutCard}
          activeOpacity={0.7}
          onPress={() => setShowLogoutModal(true)}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconBox}>
              <AppIcon name="logout" size={20} color="#EF4444" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* LOGOUT CONFIRMATION MODAL */}
      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirmLogout={handleConfirmLogout}
      />

      {/* DELETE ACCOUNT MODAL */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirmDelete={handleConfirmDelete}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  avatarEmoji: {
    fontSize: 40,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    elevation: 2,
  },
  editBadgeIcon: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12.5,
    color: "#64748B",
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  verifiedTick: {
    fontSize: 10,
    color: "#0284C7",
    fontWeight: "800",
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#0284C7",
    letterSpacing: 0.3,
  },
  expertBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  expertStar: {
    fontSize: 10,
    marginRight: 4,
  },
  expertText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#166534",
    letterSpacing: 0.3,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#114B3E",
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#F1F5F9",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  chevron: {
    fontSize: 18,
    color: "#94A3B8",
    fontWeight: "600",
  },
  settingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 10,
  },
  settingRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValueText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  logoutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
});
