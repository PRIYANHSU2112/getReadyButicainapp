import React, {memo, useMemo} from "react";
import {StyleSheet, Text, View, Switch, TouchableOpacity, ActivityIndicator} from "react-native";
import {useTheme} from "../../theme";
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {MainTabParamList} from "../../navigation/types";
import {ScreenContainer, Header, Card} from "../../components/common";
import {useAuth} from "../../context/AuthContext";
import {useSlotMutation, useSlots} from "../../hooks/queries";
import {slotService} from "../../services/bookingService";

type Props = BottomTabScreenProps<MainTabParamList, "CalendarTab">;

const DAYS_AHEAD = 7;
const OPEN_HOURS = {start: 9, end: 19};

export const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"});

const DayRow = memo(({date, beauticianId, onOpen}: {date: Date; beauticianId: string; onOpen: (ymd: string) => void}) => {
  const {theme} = useTheme();
  const ymd = toYmd(date);
  const {data: slots = [], isLoading} = useSlots(beauticianId, ymd);
  const open = useSlotMutation(() => slotService.openDay(beauticianId, ymd, OPEN_HOURS.start, OPEN_HOURS.end));
  const close = useSlotMutation(() =>
    Promise.all(slots.filter(s => s.status === "ACTIVE" && s.bookedCount === 0).map(s => slotService.setStatus(s._id, "BLOCKED"))),
  );

  const active = slots.filter(s => s.status === "ACTIVE");
  const isOn = active.length > 0;
  const busy = open.isPending || close.isPending;
  const label = isLoading
    ? "Loading…"
    : isOn
    ? `${fmtTime(active[0].startAt)} - ${fmtTime(active[active.length - 1].endAt)} • ${active.length} slots`
    : "Off";

  return (
    <Card onPress={() => onOpen(ymd)}>
      <View style={styles.row}>
        <View>
          <Text style={[theme.typography.h4, {color: theme.colors.textPrimary}]}>
            {date.toLocaleDateString("en-IN", {weekday: "long", day: "2-digit", month: "short"})}
          </Text>
          <Text style={[theme.typography.caption, styles.sub, {color: isOn ? theme.colors.primary : theme.colors.textTertiary}]}>
            {label}
          </Text>
        </View>
        {busy ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <Switch
            value={isOn}
            onValueChange={v => (v ? open.mutate(undefined) : close.mutate(undefined))}
            trackColor={{false: theme.colors.border, true: theme.colors.primary}}
          />
        )}
      </View>
    </Card>
  );
});

export const AvailabilityScreen: React.FC<Props> = ({navigation}) => {
  const {theme} = useTheme();
  const {partner} = useAuth();
  const beauticianId = partner?.userId ?? "";

  const days = useMemo(() => {
    const base = new Date();
    return Array.from({length: DAYS_AHEAD}, (_, i) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + i));
  }, []);

  const openDay = (date: string) => (navigation as any).navigate("SlotManager", {date});

  return (
    <ScreenContainer scrollable>
      <Header
        title="Weekly Schedule"
        rightAction={
          <TouchableOpacity onPress={() => openDay(toYmd(new Date()))}>
            <Text style={[styles.manage, {color: theme.colors.primary}]}>Manage</Text>
          </TouchableOpacity>
        }
      />
      <View style={styles.content}>
        <Text style={[theme.typography.h3, styles.title, {color: theme.colors.textPrimary}]}>Work Hours & Shifts</Text>
        <Text style={[theme.typography.body2, styles.subtitle, {color: theme.colors.textSecondary}]}>
          Turn a day on to open bookable slots ({OPEN_HOURS.start}:00–{OPEN_HOURS.end}:00). Tap a day to manage its slots.
        </Text>

        {!!beauticianId &&
          days.map(d => <DayRow key={d.toDateString()} date={d} beauticianId={beauticianId} onOpen={openDay} />)}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {padding: 16},
  row: {flexDirection: "row", justifyContent: "space-between", alignItems: "center"},
  sub: {marginTop: 2},
  title: {marginBottom: 4},
  subtitle: {marginBottom: 16},
  manage: {fontWeight: "700"},
});
