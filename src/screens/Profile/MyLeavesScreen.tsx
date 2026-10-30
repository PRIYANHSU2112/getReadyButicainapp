import React, {useState, useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, AppIcon, AppIconName} from "../../components/common";
import {useCancelLeave, useLeaves} from "../../hooks/queries";
import {LeaveStatusApi} from "../../services/partnerService";

type LeaveStatus = "pending" | "approved" | "rejected";

const STATUS_API: Record<LeaveStatus, LeaveStatusApi> = {pending: "PENDING", approved: "APPROVED", rejected: "REJECTED"};
const TYPE_LABEL: Record<string, string> = {CL: "Casual Leave", SL: "Sick Leave", PL: "Paid Leave", EMERGENCY: "Emergency Leave"};
// Annual policy quotas (no balance endpoint on the backend yet).
const QUOTA = {PL: 12, SL: 6, CL: 6};

const shortDate = (d: string) => new Date(d).toLocaleDateString("en-IN", {day: "2-digit", month: "short"});
const pad2 = (n: number) => String(n).padStart(2, "0");

// Days a leave spans (half day = 0.5).
const leaveDays = (l: any) =>
  l.duration === "HALF_DAY" ? 0.5 : Math.max(1, Math.round((Date.parse(l.endDate) - Date.parse(l.startDate)) / 86400000) + 1);

export const MyLeavesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [selectedStatus, setSelectedStatus] = useState<LeaveStatus>("pending");
  const listQuery = useLeaves(STATUS_API[selectedStatus]);
  const approvedQuery = useLeaves("APPROVED");
  const cancelLeave = useCancelLeave();

  const leavesData = useMemo(
    () =>
      (listQuery.data ?? []).map(l => ({
        id: String(l._id ?? l.id),
        type: TYPE_LABEL[l.leaveType] ?? l.leaveType,
        status: selectedStatus,
        dates:
          shortDate(l.startDate) === shortDate(l.endDate)
            ? shortDate(l.startDate)
            : `${shortDate(l.startDate)} – ${shortDate(l.endDate)}`,
        reason: l.reason ?? "",
        iconName: (l.leaveType === "SL" ? "first-aid" : "calendar") as AppIconName,
      })),
    [listQuery.data, selectedStatus],
  );

  // Used days per type this year, from approved leaves.
  const used = useMemo(() => {
    const year = new Date().getFullYear();
    const acc = {PL: 0, SL: 0, CL: 0} as Record<keyof typeof QUOTA, number>;
    (approvedQuery.data ?? []).forEach(l => {
      if (new Date(l.startDate).getFullYear() === year && l.leaveType in acc) acc[l.leaveType as keyof typeof QUOTA] += leaveDays(l);
    });
    return acc;
  }, [approvedQuery.data]);

  const confirmCancel = (id: string) =>
    Alert.alert("Cancel Leave Request", "Withdraw this pending leave request?", [
      {text: "Keep", style: "cancel"},
      {text: "Withdraw", style: "destructive", onPress: () => cancelLeave.mutate(id)},
    ]);

  const monthLabel = new Date().toLocaleDateString("en-IN", {month: "long", year: "numeric"});

  const getBadgeStyle = (status: LeaveStatus) => {
    switch (status) {
      case "approved":
        return {
          bg: "#DCFCE7",
          text: "#166534",
          label: "Approved",
        };
      case "rejected":
        return {
          bg: "#FEE2E2",
          text: "#991B1B",
          label: "Rejected",
        };
      case "pending":
      default:
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          label: "Pending",
        };
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="My Leaves"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.applyHeaderBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("SubmitLeave")}
          >
            <Text style={styles.applyHeaderBtnText}>+ Apply leave</Text>
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
        {/* MONTH HEADER */}
        <View style={styles.monthHeaderRow}>
          <Text style={styles.monthTitle}>{monthLabel}</Text>
          <View style={styles.monthNavRow}>
            <TouchableOpacity style={styles.arrowBtn}>
              <Text style={styles.arrowIcon}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrowBtn}>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* QUOTA CARD 1 - PAID LEAVE */}
        <View style={[styles.quotaCard, {borderLeftColor: "#22C55E"}]}>
          <View style={styles.quotaHeaderRow}>
            <Text style={styles.quotaLabel}>PAID LEAVE</Text>
            <AppIcon name="umbrella" size={20} color="#114B3E" />
          </View>
          <Text style={styles.quotaFraction}>
            <Text style={styles.quotaUsed}>{pad2(used.PL)} </Text>
            <Text style={styles.quotaTotal}>/ {QUOTA.PL}</Text>
          </Text>
        </View>

        {/* QUOTA CARD 2 - SICK LEAVE */}
        <View style={[styles.quotaCard, {borderLeftColor: "#F43F5E"}]}>
          <View style={styles.quotaHeaderRow}>
            <Text style={styles.quotaLabel}>SICK LEAVE</Text>
            <AppIcon name="first-aid" size={20} color="#E11D48" />
          </View>
          <Text style={styles.quotaFraction}>
            <Text style={[styles.quotaUsed, {color: "#E11D48"}]}>{pad2(used.SL)} </Text>
            <Text style={styles.quotaTotal}>/ {pad2(QUOTA.SL)}</Text>
          </Text>
        </View>

        {/* QUOTA CARD 3 - CASUAL LEAVE */}
        <View style={[styles.quotaCard, {borderLeftColor: "#114B3E"}]}>
          <View style={styles.quotaHeaderRow}>
            <Text style={styles.quotaLabel}>CASUAL LEAVE</Text>
            <AppIcon name="calendar" size={20} color="#114B3E" />
          </View>
          <Text style={styles.quotaFraction}>
            <Text style={styles.quotaUsed}>{pad2(used.CL)} </Text>
            <Text style={styles.quotaTotal}>/ {pad2(QUOTA.CL)}</Text>
          </Text>
        </View>

        {/* TABS: PENDING / APPROVED / REJECTED */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedStatus === "pending" && styles.tabButtonActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setSelectedStatus("pending")}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === "pending"
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedStatus === "approved" && styles.tabButtonActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setSelectedStatus("approved")}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === "approved"
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              Approved
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedStatus === "rejected" && styles.tabButtonActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setSelectedStatus("rejected")}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === "rejected"
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              Rejected
            </Text>
          </TouchableOpacity>
        </View>

        {/* RECENT REQUESTS SECTION */}
        <Text style={styles.sectionTitle}>Recent Requests</Text>

        {listQuery.isLoading && <ActivityIndicator style={styles.loader} color="#114B3E" />}
        {!listQuery.isLoading && leavesData.length === 0 && (
          <Text style={styles.emptyText}>No {selectedStatus} leave requests</Text>
        )}
        {leavesData.map((item) => {
          const badge = getBadgeStyle(item.status);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.requestCard}
              activeOpacity={item.status === "pending" ? 0.7 : 1}
              disabled={item.status !== "pending"}
              onPress={() => confirmCancel(item.id)}>
              <View style={styles.requestIconBox}>
                <AppIcon name={item.iconName} size={20} color="#114B3E" />
              </View>

              <View style={styles.requestInfoCol}>
                <View style={styles.requestHeaderRow}>
                  <Text style={styles.requestTitle}>{item.type}</Text>
                  <View style={[styles.statusBadge, {backgroundColor: badge.bg}]}>
                    <Text style={[styles.statusBadgeText, {color: badge.text}]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.requestSub}>
                  {item.dates} • "{item.reason}"
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: {marginVertical: 16},
  emptyText: {textAlign: "center", marginVertical: 24, color: "#64748B", fontSize: 13},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  applyHeaderBtn: {
    borderWidth: 1.5,
    borderColor: "#114B3E",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  applyHeaderBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  monthHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
  quotaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  quotaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  quotaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  quotaIcon: {
    fontSize: 16,
  },
  quotaFraction: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  quotaUsed: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
  },
  quotaTotal: {
    fontSize: 16,
    color: "#94A3B8",
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginVertical: 14,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 10,
  },
  requestIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  requestIcon: {
    fontSize: 20,
  },
  requestInfoCol: {
    flex: 1,
  },
  requestHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  requestSub: {
    fontSize: 12,
    color: "#64748B",
  },
});
