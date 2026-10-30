import React, {useState, useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header} from "../../components/common";
import {useAttendance, useLeaves} from "../../hooks/queries";

type DayStatus = "present" | "leave" | "absent" | "normal";

const STATUS_MAP: Record<string, DayStatus> = {PRESENT: "present", HALF_DAY: "present", ON_LEAVE: "leave", ABSENT: "absent"};
const LEAVE_LABEL: Record<string, string> = {CL: "Casual Leave", SL: "Sick Leave", PL: "Paid Leave", EMERGENCY: "Emergency Leave"};
const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", {month: "short", day: "numeric"});

export const AttendanceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const today = new Date();
  const [cursor, setCursor] = useState({month: today.getMonth() + 1, year: today.getFullYear()});
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());

  const attendance = useAttendance(cursor.month, cursor.year);
  const leaves = useLeaves();

  const daysInMonth = useMemo(
    () => Array.from({length: new Date(cursor.year, cursor.month, 0).getDate()}, (_, i) => i + 1),
    [cursor],
  );
  const leadingBlanks = new Date(cursor.year, cursor.month - 1, 1).getDay();
  const monthLabel = new Date(cursor.year, cursor.month - 1, 1).toLocaleDateString("en-IN", {month: "long", year: "numeric"});

  // day-of-month → status, from records whose `date` is "YYYY-MM-DD" (or a Date).
  const statusByDay = useMemo(() => {
    const map: Record<number, DayStatus> = {};
    (attendance.data ?? []).forEach(r => {
      const d = new Date(r.date);
      if (!isNaN(d.getTime())) map[d.getDate()] = STATUS_MAP[r.status] ?? "normal";
    });
    return map;
  }, [attendance.data]);

  const getDateStatus = (day: number): DayStatus => statusByDay[day] ?? "normal";

  const shiftMonth = (delta: number) =>
    setCursor(c => {
      const m = c.month + delta;
      return m < 1 ? {month: 12, year: c.year - 1} : m > 12 ? {month: 1, year: c.year + 1} : {month: m, year: c.year};
    });

  const recentLeaves = (leaves.data ?? []).filter(l => l.status !== "CANCELLED").slice(0, 3);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Attendance"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 40, 60)},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* CALENDAR CARD */}
        <View style={styles.calendarCard}>
          {/* MONTH HEADER */}
          <View style={styles.monthHeaderRow}>
            <Text style={styles.monthTitle}>{monthLabel}</Text>
            <View style={styles.monthNavRow}>
              <TouchableOpacity style={styles.arrowBtn} onPress={() => shiftMonth(-1)}>
                <Text style={styles.arrowIcon}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowBtn} onPress={() => shiftMonth(1)}>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DAY NAMES */}
          <View style={styles.dayNamesRow}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
              <Text key={`${d}-${idx}`} style={styles.dayNameText}>
                {d}
              </Text>
            ))}
          </View>

          {/* DATES GRID */}
          <View style={styles.datesGrid}>
            {/* Leading blanks so day 1 lands on the right weekday */}
            {Array.from({length: leadingBlanks}, (_, i) => (
              <View key={`blank-${i}`} style={styles.dateCell} />
            ))}

            {daysInMonth.map((day) => {
              const status = getDateStatus(day);
              const isSelected = selectedDate === day;

              let cellBg = "#F1F5F9";
              let textColor = "#475569";
              if (status === "present") {
                cellBg = "#DCFCE7";
                textColor = "#166534";
              } else if (status === "leave") {
                cellBg = "#DBEAFE";
                textColor = "#1E40AF";
              } else if (status === "absent") {
                cellBg = "#FEE2E2";
                textColor = "#991B1B";
              }

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    styles.dateCell,
                    {backgroundColor: cellBg},
                    isSelected && styles.dateCellSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      {color: textColor},
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* LEGEND ROW */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: "#22C55E"}]} />
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: "#3B82F6"}]} />
              <Text style={styles.legendText}>Leave</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: "#EF4444"}]} />
              <Text style={styles.legendText}>Absent</Text>
            </View>
          </View>
        </View>

        {/* LEAVE MANAGEMENT SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Leave Management</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("MyLeaves")}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* LEAVE SUMMARY CARD */}
        <View style={styles.leavesListCard}>
          {recentLeaves.length === 0 && (
            <View style={[styles.leaveRow, {borderBottomWidth: 0}]}>
              <Text style={styles.leaveDurationText}>{leaves.isLoading ? "Loading…" : "No leave requests yet"}</Text>
            </View>
          )}
          {recentLeaves.map((l, idx) => {
            const days = l.duration === "HALF_DAY"
              ? 0.5
              : Math.max(1, Math.round((Date.parse(l.endDate) - Date.parse(l.startDate)) / 86400000) + 1);
            const range = fmt(l.startDate) === fmt(l.endDate) ? fmt(l.startDate) : `${fmt(l.startDate)} - ${fmt(l.endDate)}`;
            const [badge, badgeText, label] =
              l.status === "APPROVED"
                ? [styles.approvedBadge, styles.approvedBadgeText, "Approved"]
                : l.status === "REJECTED"
                ? [styles.rejectedBadge, styles.rejectedBadgeText, "Rejected"]
                : [styles.pendingBadge, styles.pendingBadgeText, "Pending"];
            return (
              <View
                key={String(l._id ?? l.id)}
                style={[styles.leaveRow, idx === recentLeaves.length - 1 && {borderBottomWidth: 0}]}>
                <View>
                  <Text style={styles.leaveTypeTitle}>{LEAVE_LABEL[l.leaveType] ?? l.leaveType}</Text>
                  <Text style={styles.leaveDurationText}>{range} • {days} {days === 1 ? "Day" : "Days"}</Text>
                </View>
                <View style={badge}>
                  <Text style={badgeText}>{label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* APPLY LEAVE CTA */}
        <TouchableOpacity
          style={styles.applyLeaveBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SubmitLeave")}
        >
          <Text style={styles.applyLeaveBtnText}>+ Apply Leave</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 20,
  },
  monthHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  monthNavRow: {
    flexDirection: "row",
    gap: 8,
  },
  arrowBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  arrowIcon: {
    fontSize: 18,
    color: "#475569",
    fontWeight: "700",
  },
  dayNamesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    width: 38,
    textAlign: "center",
  },
  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 6,
    marginBottom: 16,
  },
  dateCell: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dateCellSelected: {
    borderWidth: 2,
    borderColor: "#114B3E",
  },
  prevMonthDay: {
    fontSize: 12,
    color: "#CBD5E1",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
  },
  dateTextSelected: {
    fontWeight: "900",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  leavesListCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 20,
  },
  leaveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  leaveTypeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  leaveDurationText: {
    fontSize: 12,
    color: "#64748B",
  },
  approvedBadge: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  approvedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  pendingBadge: {
    backgroundColor: "#FEF2F2",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
  },
  rejectedBadge: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  rejectedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#991B1B",
  },
  applyLeaveBtn: {
    backgroundColor: "#114B3E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  applyLeaveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
