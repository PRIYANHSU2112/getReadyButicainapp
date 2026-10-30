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
import {ScreenContainer, Header, AppIcon} from "../../components/common";
import {useAssignments, useHomeSummary} from "../../hooks/queries";
import {toBooking} from "../../services/mappers";

type PeriodTab = "today" | "week" | "month";

const MONTHLY_GOAL = 15000;
const inr = (n?: number) => `₹${Math.round(n ?? 0).toLocaleString("en-IN")}`;

export const MyPerformanceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<PeriodTab>("today");
  const assignments = useAssignments();
  const summary = useHomeSummary().data;
  const all = useMemo(() => (assignments.data ?? []).map(toBooking), [assignments.data]);

  // Period stats + revenue buckets computed from the beautician's own bookings.
  const {stats, chartBars} = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const from = activeTab === "today" ? dayStart : activeTab === "week" ? dayStart - 6 * 86400000 : dayStart - 29 * 86400000;
    const inRange = all.filter(b => b.scheduledStart && Date.parse(b.scheduledStart) >= from);
    const done = inRange.filter(b => b.status === "completed");

    const buckets =
      activeTab === "today"
        ? [8, 10, 12, 14, 16, 18, 20].map(h => ({label: `${h % 12 || 12}${h < 12 ? "AM" : "PM"}`, test: (d: Date) => d.getHours() >= h && d.getHours() < h + 2}))
        : activeTab === "week"
        ? Array.from({length: 7}, (_, i) => {
            const day = new Date(dayStart - (6 - i) * 86400000);
            return {label: day.toLocaleDateString("en-IN", {weekday: "short"}), test: (d: Date) => d.toDateString() === day.toDateString()};
          })
        : Array.from({length: 5}, (_, i) => {
            const s = from + i * 6 * 86400000;
            return {label: `W${i + 1}`, test: (d: Date) => d.getTime() >= s && d.getTime() < s + 6 * 86400000};
          });

    const sums = buckets.map(bk => done.filter(b => bk.test(new Date(b.scheduledStart!))).reduce((s, b) => s + b.totalAmount, 0));
    const max = Math.max(...sums, 1);
    const peak = sums.indexOf(Math.max(...sums));
    const bars = buckets.map((bk, i) => ({
      label: bk.label,
      height: Math.max(8, Math.round((sums[i] / max) * 114)),
      color: i === peak && sums[i] > 0 ? "#114B3E" : sums[i] > 0 ? "#7ECBB8" : "#E8F5F1",
      isPeak: i === peak && sums[i] > 0,
    }));
    const mins = done.reduce((s, b) => s + b.items.reduce((m, it) => m + it.duration, 0), 0);
    return {
      stats: {
        total: inRange.length,
        completed: done.length,
        pending: inRange.filter(b => b.status !== "completed" && b.status !== "cancelled").length,
        worked: `${Math.floor(mins / 60)}h ${mins % 60}m`,
        revenue: done.reduce((s, b) => s + b.totalAmount, 0),
      },
      chartBars: bars,
    };
  }, [all, activeTab]);

  const monthEarned = summary?.monthlyEarnings ?? 0;
  const goalPct = Math.min(100, Math.round((monthEarned / MONTHLY_GOAL) * 100));
  const recent = all.slice(0, 2);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="My Performance"
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
        {/* TABS: TODAY / THIS WEEK / THIS MONTH */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "today" && styles.tabButtonActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab("today")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "today" ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "week" && styles.tabButtonActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab("week")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "week" ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "month" && styles.tabButtonActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab("month")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "month" ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* HIGHLIGHT EARNINGS CARD */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsCaption}>
            {activeTab === "today"
              ? "TODAY'S EARNED"
              : activeTab === "week"
              ? "THIS WEEK'S EARNED"
              : "THIS MONTH'S EARNED"}
          </Text>
          <Text style={styles.earningsAmount}>
            +{inr(stats.revenue)}
          </Text>
        </View>

        {/* 4 METRIC STATS GRID */}
        <View style={styles.statsGrid}>
          <View style={styles.gridCard}>
            <View style={styles.statIconBox}>
              <AppIcon name="scissors" size={20} color="#114B3E" />
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Services</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={styles.statIconBox}>
              <AppIcon name="scissors" size={20} color="#114B3E" />
            </View>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={styles.statIconBox}>
              <AppIcon name="scissors" size={20} color="#114B3E" />
            </View>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={styles.statIconBox}>
              <AppIcon name="clock" size={20} color="#114B3E" />
            </View>
            <Text style={styles.statValue}>{stats.worked}</Text>
            <Text style={styles.statLabel}>Worked</Text>
          </View>
        </View>

        {/* REVENUE BAR CHART CARD */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>
              {activeTab === "today"
                ? "TODAY REVENUE"
                : activeTab === "week"
                ? "TOTAL REVENUE (LAST 7 DAYS)"
                : "TOTAL REVENUE (LAST 1 MONTH)"}
            </Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>
                {activeTab === "today" ? "Today" : "Completed"}
              </Text>
            </View>
          </View>

          <View style={styles.barsContainer}>
            {chartBars.map((bar, idx) => (
              <View key={`${bar.label}-${idx}`} style={styles.barCol}>
                <View style={styles.peakSlot}>
                  {bar.isPeak && <Text style={styles.peakTag}>Peak</Text>}
                </View>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: bar.height,
                      backgroundColor: bar.color,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* GAMIFICATION / CAREER JOURNEY CARD */}
        <View style={styles.boostCard}>
          <Text style={styles.boostTitle}>{goalPct >= 100 ? "Monthly Goal Reached!" : "Monthly Goal"}</Text>
          <Text style={styles.boostSub}>
            {goalPct >= 100
              ? "Great work — you've hit your earnings goal this month."
              : `Only ${inr(MONTHLY_GOAL - monthEarned)} more to reach your monthly goal.`}
          </Text>
          <View style={styles.boostProgressTrack}>
            <View style={[styles.boostProgressFill, {width: `${goalPct}%`}]} />
          </View>
          <View style={styles.boostLimitsRow}>
            <Text style={styles.boostLimitText}>{inr(monthEarned)}</Text>
            <Text style={styles.boostLimitText}>Goal: {inr(MONTHLY_GOAL)}</Text>
          </View>
        </View>

        {/* RECENT BOOKINGS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("MainTabs", {screen: "BookingsTab"})}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 && !assignments.isLoading && (
          <Text style={styles.bookingDate}>No bookings yet</Text>
        )}
        {recent.map(b => {
          const done = b.status === "completed";
          return (
            <View key={b.id} style={styles.bookingCard}>
              <View style={styles.bookingHeaderRow}>
                <View style={styles.bookingDateRow}>
                  <AppIcon name="calendar" size={13} color="#64748B" />
                  <Text style={styles.bookingDate}>{b.scheduledAt}</Text>
                </View>
                <View style={done ? styles.completedBadge : styles.assignedBadge}>
                  <Text style={done ? styles.completedBadgeText : styles.assignedBadgeText}>{done ? "Completed" : "Assigned"}</Text>
                </View>
              </View>
              <View style={styles.clientRow}>
                <View style={styles.clientAvatar}>
                  <AppIcon name="user" size={18} color="#114B3E" />
                </View>
                <View style={styles.clientCol}>
                  <Text style={styles.clientName}>{b.customerName}</Text>
                  <Text style={styles.bookingId}>Booking ID : #{b.bookingNumber ?? b.id.slice(-6)}</Text>
                </View>
                <Text style={styles.bookingAmount}>{inr(b.totalAmount)}</Text>
              </View>
              <View style={styles.bookingBtnRow}>
                <TouchableOpacity
                  style={styles.primaryBookingBtn}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(done ? "CompletedBookingDetail" : "EnRoute", {bookingId: b.id})}
                >
                  <Text style={styles.primaryBookingBtnText}>{done ? "View Details" : "Start Journey"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.outlineBookingBtn}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(done ? "BookingReceipt" : "JobDetail", {bookingId: b.id})}
                >
                  <Text style={styles.outlineBookingBtnText}>{done ? "View Invoice" : "View Details"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* QUICK NAVIGATION LINKS CARD */}
        <View style={styles.linksCard}>
          <TouchableOpacity
            style={styles.linkRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Attendance")}
          >
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBox}>
                <AppIcon name="attendance" size={20} color="#114B3E" />
              </View>
              <Text style={styles.linkTitle}>My Attendance</Text>
            </View>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("MyLeaves")}
          >
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBox}>
                <AppIcon name="leaves" size={20} color="#114B3E" />
              </View>
              <Text style={styles.linkTitle}>My Leaves</Text>
            </View>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("SubmitLeave")}
          >
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBox}>
                <AppIcon name="apply-leave" size={20} color="#114B3E" />
              </View>
              <Text style={styles.linkTitle}>Apply Leave</Text>
            </View>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkRow, {borderBottomWidth: 0}]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("SalaryBreakdown")}
          >
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBox}>
                <AppIcon name="salary" size={20} color="#114B3E" />
              </View>
              <Text style={styles.linkTitle}>Payment & salary</Text>
            </View>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>
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
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: "#114B3E",
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#114B3E",
  },
  tabTextInactive: {
    color: "#64748B",
  },
  earningsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#114B3E",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 14,
  },
  earningsCaption: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: "900",
    color: "#114B3E",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  gridCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  statIconBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11.5,
    color: "#64748B",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
    elevation: 1,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.4,
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#114B3E",
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#64748B",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 165,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  barCol: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    marginHorizontal: 3,
  },
  peakSlot: {
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  peakTag: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  barFill: {
    width: "100%",
    maxWidth: 36,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  barLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
  },
  boostCard: {
    backgroundColor: "#114B3E",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  boostTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  boostSub: {
    fontSize: 12,
    color: "#A7F3D0",
    lineHeight: 16,
    marginBottom: 12,
  },
  boostProgressTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  boostProgressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  boostLimitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boostLimitText: {
    fontSize: 11,
    color: "#A7F3D0",
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
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 12,
    elevation: 1,
  },
  bookingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  bookingDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookingDate: {
    fontSize: 11.5,
    color: "#64748B",
  },
  assignedBadge: {
    backgroundColor: "#E0F2FE",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  assignedBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#0284C7",
  },
  completedBadge: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  completedBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#166534",
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  clientAvatarText: {
    fontSize: 20,
  },
  clientCol: {
    flex: 1,
  },
  clientName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 1,
  },
  bookingId: {
    fontSize: 11,
    color: "#94A3B8",
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  bookingBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  primaryBookingBtn: {
    flex: 1,
    backgroundColor: "#114B3E",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBookingBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  outlineBookingBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBookingBtnText: {
    color: "#475569",
    fontSize: 12.5,
    fontWeight: "700",
  },
  linksCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginTop: 8,
    marginBottom: 20,
    overflow: "hidden",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkIconBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  linkIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  linkTitle: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#0F172A",
  },
  linkChevron: {
    fontSize: 18,
    color: "#94A3B8",
  },
});
