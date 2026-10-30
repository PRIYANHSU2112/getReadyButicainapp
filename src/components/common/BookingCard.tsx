import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ViewStyle,
} from "react-native";

export type BookingStatus = "assigned" | "upcoming" | "completed" | "cancelled" | "canceled";

export interface BookingCardData {
  id: string;
  bookingNumber?: string;
  customerName: string;
  date: string;
  time: string;
  price: number;
  status: BookingStatus;
  thumbnailUrl?: string;
  serviceTitle?: string;
}

interface BookingCardProps {
  booking: BookingCardData;
  onPressCard?: () => void;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  style?: ViewStyle;
}

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop&q=80";

export const BookingCard: React.FC<BookingCardProps> = React.memo(({
  booking,
  onPressCard,
  onPrimaryPress,
  onSecondaryPress,
  style,
}) => {
  const isCancelled = booking.status === "cancelled" || booking.status === "canceled";
  const isCompleted = booking.status === "completed";
  const isUpcoming = booking.status === "assigned" || booking.status === "upcoming";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPressCard}
      style={[styles.card, style]}
    >
      {/* Top Header: Date/Time + Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.dateTimeRow}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.dateTimeText}>
            {booking.date} at {booking.time}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            isCompleted && styles.statusPillCompleted,
            isUpcoming && styles.statusPillAssigned,
            isCancelled && styles.statusPillCancelled,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isCompleted && styles.statusTextCompleted,
              isUpcoming && styles.statusTextAssigned,
              isCancelled && styles.statusTextCancelled,
            ]}
          >
            {isUpcoming ? "Assigned" : isCompleted ? "Completed" : "Canceled"}
          </Text>
        </View>
      </View>

      {/* Middle Row: Image + Customer Info + Price */}
      <View style={styles.bodyRow}>
        <Image
          source={{uri: booking.thumbnailUrl || DEFAULT_THUMBNAIL}}
          style={styles.thumbnail}
        />
        <View style={styles.infoCol}>
          <Text style={styles.customerName}>{booking.customerName}</Text>
          <Text style={styles.bookingIdText}>
            Booking ID : {booking.bookingNumber || booking.id}
          </Text>
        </View>
        <Text style={styles.priceText}>
          ₹{booking.price.toLocaleString("en-IN")}
        </Text>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        {isUpcoming && (
          <>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onPrimaryPress}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Start journey</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onSecondaryPress || onPressCard}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>View Details</Text>
            </TouchableOpacity>
          </>
        )}

        {isCompleted && (
          <>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onPrimaryPress || onPressCard}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onSecondaryPress}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>View Invoice</Text>
            </TouchableOpacity>
          </>
        )}

        {isCancelled && (
          <TouchableOpacity
            style={styles.fullWidthBtn}
            onPress={onPressCard || onPrimaryPress}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  dateTimeText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#64748B",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPillAssigned: {
    backgroundColor: "#E6F7F0",
  },
  statusPillCompleted: {
    backgroundColor: "#E6F7F0",
  },
  statusPillCancelled: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  statusTextAssigned: {
    color: "#114B3E",
  },
  statusTextCompleted: {
    color: "#114B3E",
  },
  statusTextCancelled: {
    color: "#EF4444",
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  thumbnail: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 3,
  },
  bookingIdText: {
    fontSize: 12,
    color: "#64748B",
  },
  priceText: {
    fontSize: 16.5,
    fontWeight: "900",
    color: "#0F172A",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#114B3E",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#0F172A",
  },
  fullWidthBtn: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
