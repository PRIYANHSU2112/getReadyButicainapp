import React, {useMemo, useState} from "react";
import {StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert} from "react-native";
import {useTheme} from "../../theme";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {ScreenContainer, Header, Card, Button} from "../../components/common";
import {useAuth} from "../../context/AuthContext";
import {useSlotMutation, useSlots} from "../../hooks/queries";
import {Slot, slotService} from "../../services/bookingService";
import {toYmd} from "./AvailabilityScreen";

type Props = NativeStackScreenProps<RootStackParamList, "SlotManager">;

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"});

export const SlotManagerScreen: React.FC<Props> = ({navigation, route}) => {
  const {theme} = useTheme();
  const {partner} = useAuth();
  const beauticianId = partner?.userId;
  const [date, setDate] = useState(route.params?.date ?? toYmd(new Date()));

  const week = useMemo(() => {
    const base = new Date();
    return Array.from({length: 7}, (_, i) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + i));
  }, []);

  const {data: slots = [], isLoading} = useSlots(beauticianId, date);
  const toggle = useSlotMutation((s: Slot) => slotService.setStatus(s._id, s.status === "ACTIVE" ? "BLOCKED" : "ACTIVE"));
  const openDay = useSlotMutation(() => slotService.openDay(beauticianId!, date));

  const onSlotPress = (s: Slot) => {
    if (s.bookedCount > 0) {
      Alert.alert("Slot Booked", "This slot already has a booking and can't be blocked.");
      return;
    }
    toggle.mutate(s);
  };

  return (
    <ScreenContainer scrollable>
      <Header title="Manage Booking Slots" showBack onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
          {week.map(d => {
            const ymd = toYmd(d);
            const sel = ymd === date;
            return (
              <TouchableOpacity
                key={ymd}
                onPress={() => setDate(ymd)}
                style={[styles.dayChip, {backgroundColor: sel ? theme.colors.primary : theme.colors.surfaceVariant}]}>
                <Text style={[styles.dayChipTop, {color: sel ? theme.colors.white : theme.colors.textSecondary}]}>
                  {d.toLocaleDateString("en-IN", {weekday: "short"})}
                </Text>
                <Text style={[styles.dayChipNum, {color: sel ? theme.colors.white : theme.colors.textPrimary}]}>{d.getDate()}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[theme.typography.body2, styles.hint, {color: theme.colors.textSecondary}]}>
          Tap a slot to block or reopen it. Booked slots are locked.
        </Text>

        {isLoading && <ActivityIndicator color={theme.colors.primary} />}

        {!isLoading && slots.length === 0 && (
          <Card>
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>No slots for this day.</Text>
            <Button title="Open 9 AM – 7 PM" onPress={() => openDay.mutate(undefined)} loading={openDay.isPending} style={styles.openBtn} />
          </Card>
        )}

        <View style={styles.grid}>
          {slots.map(s => {
            const booked = s.bookedCount > 0;
            const blocked = s.status !== "ACTIVE";
            const bg = booked ? theme.colors.infoLight : blocked ? theme.colors.errorLight : theme.colors.successLight;
            const fg = booked ? theme.colors.info : blocked ? theme.colors.error : theme.colors.success;
            return (
              <TouchableOpacity key={s._id} onPress={() => onSlotPress(s)} style={[styles.slot, {backgroundColor: bg, borderColor: fg}]}>
                <Text style={[styles.slotTime, {color: fg}]}>{fmtTime(s.startAt)}</Text>
                <Text style={[styles.slotState, {color: fg}]}>{booked ? "Booked" : blocked ? "Blocked" : "Open"}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {padding: 16},
  dayStrip: {gap: 8, paddingBottom: 12},
  dayChip: {width: 54, paddingVertical: 8, borderRadius: 12, alignItems: "center"},
  dayChipTop: {fontSize: 11, fontWeight: "600"},
  dayChipNum: {fontSize: 16, fontWeight: "800", marginTop: 2},
  hint: {marginBottom: 12},
  openBtn: {marginTop: 12},
  grid: {flexDirection: "row", flexWrap: "wrap", gap: 10},
  slot: {width: "30%", paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center"},
  slotTime: {fontSize: 13, fontWeight: "700"},
  slotState: {fontSize: 11, marginTop: 2},
});
