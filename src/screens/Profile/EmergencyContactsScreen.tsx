import React, {useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, AppIcon} from "../../components/common";
import {useAuth} from "../../context/AuthContext";

export const EmergencyContactsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  // Seeded from the profile's emergency contact; extra contacts are kept on-device.
  const contacts = useAuth().partner?.emergencyContacts ?? [];

  const handleEditContact = useCallback((contact: any) => {
    navigation.navigate("AddEmergencyContact", {contactId: contact.id});
  }, [navigation]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Profile Creation"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.addHeaderBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("AddEmergencyContact")}
          >
            <Text style={styles.addHeaderBtnText}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 40, 60)},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.avatarCircle}>
              <AppIcon name="user" size={24} color="#114B3E" />
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              <Text style={styles.contactRelation}>{contact.relation}</Text>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.7}
              onPress={() => handleEditContact(contact)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            >
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* SECURITY & PRIVACY NOTICE */}
        <View style={styles.noticeBox}>
          <AppIcon name="info" size={16} color="#64748B" />
          <Text style={styles.noticeText}>
            Data is encrypted and only shared during active safety alerts.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  addHeaderBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  addHeaderBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarEmoji: {
    fontSize: 28,
  },
  infoCol: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12.5,
    color: "#64748B",
    marginBottom: 1,
  },
  contactRelation: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  editBtn: {
    padding: 8,
  },
  editIcon: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "700",
  },
  noticeBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginTop: 8,
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  noticeText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    flex: 1,
  },
});
