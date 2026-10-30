import React, {useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {BookingCard} from "../../components/common";
import {useAssignmentCards} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "PreviousBookings">;

export const PreviousBookingsScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {clientName} = route.params || {};
  const {cards, isLoading} = useAssignmentCards();

  // Reuses the cached assignments list — no extra request.
  const previous = useMemo(
    () => cards.filter(b => b.status === "completed" && (!clientName || b.customerName === clientName)),
    [cards, clientName],
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching bookings-5.png: < Previous Booking */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Previous Booking</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 16) + 30},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <ActivityIndicator style={{marginTop: 40}} color="#114B3E" />}
        {!isLoading && previous.length === 0 && (
          <Text style={{textAlign: "center", marginTop: 40, color: "#64748B"}}>No previous bookings</Text>
        )}
        {previous.map(booking => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onPressCard={() =>
              navigation.navigate("CompletedBookingDetail", {bookingId: booking.id})
            }
            onPrimaryPress={() =>
              navigation.navigate("CompletedBookingDetail", {bookingId: booking.id})
            }
            onSecondaryPress={() =>
              navigation.navigate("BookingReceipt", {bookingId: booking.id})
            }
          />
        ))}
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
    fontSize: 17.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSpacer: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
