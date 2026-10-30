import React, {useState, useEffect} from "react";
import {StyleSheet, Text, View} from "react-native";
import {useTheme} from "../../theme";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {ScreenContainer, Button, Card} from "../../components/common";
import {useBooking} from "../../context/BookingContext";

type Props = NativeStackScreenProps<RootStackParamList, "IncomingJob">;

export const IncomingJobScreen: React.FC<Props> = ({route, navigation}) => {
  const {bookingId} = route.params;
  const {theme} = useTheme();
  const {acceptBooking, rejectBooking} = useBooking();
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigation.goBack();
      return;
    }
    const timer = setInterval(() => setSecondsLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, navigation]);

  const handleAccept = async () => {
    await acceptBooking(bookingId);
    navigation.replace("JobDetail", {bookingId});
  };

  const handleReject = async () => {
    await rejectBooking(bookingId);
    navigation.goBack();
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.timerCircle, {borderColor: theme.colors.gold}]}>
          <Text style={[styles.timerNumber, {color: theme.colors.gold}]}>{secondsLeft}</Text>
          <Text style={[theme.typography.captionSmall, {color: theme.colors.textSecondary}]}>SEC</Text>
        </View>

        <Text style={[theme.typography.h1, {color: theme.colors.textPrimary, marginTop: 16, textAlign: "center"}]}>
          New Booking Request!
        </Text>
        <Text style={[theme.typography.body2, {color: theme.colors.textSecondary, marginTop: 4, textAlign: "center"}]}>
          A customer nearby requested beauty services
        </Text>

        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>PAYOUT AMOUNT</Text>
            <Text style={[theme.typography.h2, {color: theme.colors.primary}]}>₹ 2,499</Text>
          </View>
          <View style={[styles.divider, {backgroundColor: theme.colors.borderLight}]} />
          <Text style={[theme.typography.body1, {color: theme.colors.textPrimary, fontWeight: "600"}]}>
            Bridal Hair Styling & Makeup
          </Text>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary, marginTop: 4}]}>
            📍 Bellandur, Bangalore (2.3 km away)
          </Text>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary, marginTop: 2}]}>
            🕒 Scheduled: Today, 02:00 PM
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Accept Job"
            variant="primary"
            size="large"
            onPress={handleAccept}
            style={styles.acceptBtn}
          />
          <Button
            title="Decline"
            variant="outline"
            size="large"
            onPress={handleReject}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  timerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  timerNumber: {
    fontSize: 32,
    fontWeight: "800",
  },
  card: {
    width: "100%",
    marginTop: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  actions: {
    width: "100%",
    marginTop: 24,
    gap: 12,
  },
  acceptBtn: {
    marginBottom: 4,
  },
});
