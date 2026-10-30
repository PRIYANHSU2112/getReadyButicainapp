import React, {useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {
  EarningsCreditedBanner,
  ItemizedBreakdownCard,
  BillBreakdownCard,
  PaymentStatusCard,
  ItemizedServiceItem,
} from "../../components/common";
import {useBookingDetail} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "JobCompleted">;

export const JobCompletedScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {bookingId, earnings: passedEarnings} = route.params;
  const {data: booking} = useBookingDetail(bookingId);

  const items = useMemo<ItemizedServiceItem[]>(
    () => (booking?.items ?? []).map(i => ({id: i.serviceId, title: i.serviceTitle, subtitle: `${i.duration} min`, price: i.price})),
    [booking?.items],
  );
  const serviceTotal = booking?.subtotal ?? booking?.totalAmount ?? 0;
  const grandTotal = booking?.payable ?? booking?.totalAmount ?? 0;
  const taxes = Math.max(0, grandTotal - serviceTotal);
  const isPaid = booking?.paymentStatus === "PAID" || booking?.paymentStatus === "SUCCESS";
  const earnings = passedEarnings ?? grandTotal;

  const handleReturnToDashboard = () => {
    navigation.navigate("MainTabs", {screen: "DashboardTab"});
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Figma: Service Check In with Back chevron */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Check In</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 16) + 24},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Check Circle Icon */}
        <View style={styles.successIconWrapper}>
          <View style={styles.successIconOuterGlow}>
            <View style={styles.successIconCircle}>
              <Text style={styles.checkMarkIcon}>✓</Text>
            </View>
          </View>
        </View>

        {/* Headline & Description */}
        <Text style={styles.mainTitle}>Service Completed Successfully</Text>
        <Text style={styles.mainSubtitle}>
          The client payment is ready to be collected and your earnings have been processed.
        </Text>

        {/* Reusable Component: Earnings Credited Banner */}
        <View style={styles.sectionSpacer}>
          <EarningsCreditedBanner amount={earnings} />
        </View>

        {/* Section: Itemized Breakdown */}
        <Text style={styles.sectionTitle}>Itemized Breakdown</Text>
        <ItemizedBreakdownCard items={items} />

        {/* Reusable Component: Bill Calculation Breakdown */}
        <BillBreakdownCard
          serviceTotal={serviceTotal}
          taxesAndFees={taxes}
          grandTotal={grandTotal}
        />

        {/* Reusable Component: Payment Status Card */}
        <PaymentStatusCard
          balanceAmount={isPaid ? 0 : grandTotal}
          advanceAmount={isPaid ? grandTotal : 0}
          paymentMode={isPaid ? "Prepaid (Online)" : booking?.paymentMethod ?? "Cash / UPI"}
        />

        {/* Bottom Primary Action Button */}
        <TouchableOpacity
          style={styles.returnButton}
          onPress={handleReturnToDashboard}
          activeOpacity={0.85}
        >
          <Text style={styles.returnButtonText}>
            Complete & Return to Dashboard →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 26,
    fontWeight: "300",
    color: "#0F172A",
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSpacer: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  successIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successIconOuterGlow: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  checkMarkIcon: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  mainTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 13.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  sectionSpacer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  returnButton: {
    width: "100%",
    backgroundColor: "#114B3E", // Deep emerald matching Figma
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  returnButtonText: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
