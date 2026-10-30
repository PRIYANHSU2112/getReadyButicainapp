import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceAddedSuccess">;

export const ServiceAddedSuccessScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const {bookingId, addedItems} = route.params || {
    bookingId: "bk-101",
    addedItems: [],
  };

  const handleResume = () => {
    // Return to ServiceCheckIn with the updated extra items, matching Resume.png
    navigation.navigate("ServiceCheckIn", {
      bookingId,
      extraItems: addedItems && addedItems.length > 0 ? addedItems : [
        {
          id: "extra-1",
          title: "Classic Manicure",
          category: "Nails",
          duration: "45 min",
          discountPrice: 245,
          originalPrice: 445,
        },
        {
          id: "extra-2",
          title: "Classic Manicure",
          category: "Nails",
          duration: "45 min",
          discountPrice: 245,
          originalPrice: 445,
        },
      ],
    });
  };

  const displayItems =
    addedItems && addedItems.length > 0
      ? addedItems
      : [
          {title: "Mini Glow Cleanup Package", subtitle: "Base Service", price: 1500},
          {title: "Mini Glow Cleanup Package", subtitle: "Base Service", price: 1500},
        ];

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Booking Summary & Earnings.png */}
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
          Service Check In
        </Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 90, 110)},
        ]}>
        {/* Success Checkmark Circle matching Booking Summary & Earnings.png */}
        <View style={styles.successCircle}>
          <Text style={styles.checkmarkIcon}>✓</Text>
        </View>

        {/* Heading & Subtitle */}
        <Text maxFontSizeMultiplier={1.3} style={styles.successHeading}>
          Service Added Successfully
        </Text>
        <Text maxFontSizeMultiplier={1.3} style={styles.successSubtitle}>
          The client payment is ready to be collected and your earnings have been
          processed.
        </Text>

        {/* Item added Section matching Booking Summary & Earnings.png */}
        <View style={styles.itemsSection}>
          <Text maxFontSizeMultiplier={1.3} style={styles.sectionHeading}>
            Item addeD
          </Text>

          {displayItems.map((item, idx) => (
            <View key={`added-item-${idx}`} style={styles.itemRowCard}>
              <View style={styles.itemTexts}>
                <Text maxFontSizeMultiplier={1.3} style={styles.itemTitle}>
                  {item.title}
                </Text>
                <Text style={styles.itemSubtitle}>
                  {item.subtitle || "Base Service"}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{(item.price || item.discountPrice || 1500).toLocaleString("en-IN")}
              </Text>
            </View>
          ))}
        </View>

        {/* Resume Service Action Button matching Booking Summary & Earnings.png */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleResume}
          style={styles.resumeServiceBtn}>
          <Text style={styles.resumeServiceBtnText}>Resume service →</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#E11D48",
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
    paddingTop: 36,
    alignItems: "center",
  },
  successCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#22C55E", // Bright vibrant emerald check circle
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#22C55E",
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  checkmarkIcon: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  successHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  itemsSection: {
    width: "100%",
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  itemRowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemTexts: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 11.5,
    color: "#6B7280",
  },
  itemPrice: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#111827",
  },
  resumeServiceBtn: {
    width: "100%",
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
  resumeServiceBtnText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
