import React, {useCallback, useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, AppIcon} from "../../components/common";
import {usePayslips} from "../../hooks/queries";

const inr = (n?: number) => `₹${Math.round(n ?? 0).toLocaleString("en-IN")}`;
const pad2 = (n?: number) => String(n ?? 0).padStart(2, "0");

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
  "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const twoDigits = (n: number) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`);
// Indian numbering: crore / lakh / thousand / hundred.
const toWords = (num: number): string => {
  let n = Math.round(num);
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 1e7); n %= 1e7;
  const lakh = Math.floor(n / 1e5); n %= 1e5;
  const thousand = Math.floor(n / 1e3); n %= 1e3;
  const hundred = Math.floor(n / 100); n %= 100;
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (n) parts.push(`${parts.length ? "and " : ""}${twoDigits(n)}`);
  return parts.join(" ");
};

export const SalaryBreakdownScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const payslips = usePayslips();
  // Newest first; index 0 = latest payslip.
  const list = payslips.data ?? [];
  const [idx, setIdx] = useState(0);
  const p = list[idx];

  const monthLabel = p
    ? new Date(p.year, p.month - 1, 1).toLocaleDateString("en-IN", {month: "long", year: "numeric"})
    : "No payslips yet";
  const gross = (p?.totalEarnings ?? 0) + (p?.bonuses ?? 0);
  const totalDeductions = (p?.platformCommission ?? 0) + (p?.tds ?? 0) + (p?.deductions ?? 0);
  const net = p?.netPayout ?? gross - totalDeductions;

  const handleDownloadPayslip = useCallback(() => {
    if (!p) return;
    Share.share({
      title: `Payslip ${monthLabel}`,
      message: [
        `Payslip — ${monthLabel}`,
        `Bookings: ${p.totalBookings ?? 0}`,
        `Service Earnings: ${inr(p.totalEarnings)}`,
        `Bonuses: ${inr(p.bonuses)}`,
        `Platform Commission: -${inr(p.platformCommission)}`,
        `TDS: -${inr(p.tds)}`,
        `Other Deductions: -${inr(p.deductions)}`,
        `Net Payable: ${inr(net)} (${p.status})`,
      ].join("\n"),
    }).catch(() => undefined);
  }, [p, monthLabel, net]);

  const handleSalaryDispute = useCallback(() => {
    navigation.navigate("HelpSupport");
  }, [navigation]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Salary Breakdown"
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
        {/* MONTH HEADER */}
        <View style={styles.monthHeaderRow}>
          <Text style={styles.monthTitle}>{monthLabel}</Text>
          <View style={styles.monthNavRow}>
            {/* ‹ = older payslip, › = newer */}
            <TouchableOpacity style={styles.arrowBtn} disabled={idx >= list.length - 1} onPress={() => setIdx(i => i + 1)}>
              <Text style={styles.arrowIcon}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrowBtn} disabled={idx === 0} onPress={() => setIdx(i => i - 1)}>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {payslips.isLoading && <ActivityIndicator style={styles.loader} color="#114B3E" />}

        {/* WORK DAYS STATS ROW */}
        <View style={styles.daysStatsCard}>
          <View style={styles.dayCol}>
            <Text style={styles.dayLabel}>Working Days</Text>
            <Text style={styles.dayValue}>{pad2(p?.workingDays)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.dayCol}>
            <Text style={styles.dayLabel}>Days Worked</Text>
            <Text style={[styles.dayValue, {color: "#166534"}]}>{pad2(p?.presentDays)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.dayCol}>
            <Text style={styles.dayLabel}>Leave Taken</Text>
            <Text style={[styles.dayValue, {color: "#0369A1"}]}>{pad2(p?.leaveDays)}</Text>
          </View>
        </View>

        {/* BREAKDOWN CARD */}
        <View style={styles.breakdownCard}>
          {/* EARNINGS SECTION */}
          <View style={styles.sectionHeadingBox}>
            <Text style={styles.sectionHeadingText}>EARNINGS</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Service Earnings ({p?.totalBookings ?? 0} bookings)</Text>
            <Text style={styles.itemAmount}>{inr(p?.totalEarnings)}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Bonuses</Text>
            <Text style={[styles.itemAmount, {color: "#166534"}]}>{inr(p?.bonuses)}</Text>
          </View>

          {/* DEDUCTIONS SECTION */}
          <View style={styles.sectionHeadingBox}>
            <Text style={styles.sectionHeadingText}>DEDUCTIONS</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Platform Commission</Text>
            <Text style={[styles.itemAmount, {color: "#DC2626"}]}>{inr(p?.platformCommission)}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemName}>TDS</Text>
            <Text style={[styles.itemAmount, {color: "#DC2626"}]}>{inr(p?.tds)}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Other Deductions</Text>
            <Text style={[styles.itemAmount, {color: "#DC2626"}]}>{p?.deductions ? inr(p.deductions) : "—"}</Text>
          </View>

          <View style={styles.divider} />

          {/* TOTALS ROW */}
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>GROSS EARNINGS</Text>
            <Text style={[styles.totalValue, {color: "#166534"}]}>{inr(gross)}</Text>
          </View>

          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>TOTAL DEDUCTIONS</Text>
            <Text style={[styles.totalValue, {color: "#DC2626"}]}>{inr(totalDeductions)}</Text>
          </View>
        </View>

        {/* NET PAYABLE HIGHLIGHT CARD */}
        <View style={styles.netCard}>
          <Text style={styles.netCaption}>NET PAYABLE AMOUNT{p?.status === "PAID" ? " • PAID" : ""}</Text>
          <Text style={styles.netWords}>{toWords(net)} Only</Text>
          <Text style={styles.netAmount}>{inr(net)}</Text>
        </View>

        {/* DOWNLOAD PAYSLIP */}
        <TouchableOpacity
          style={styles.downloadBtn}
          activeOpacity={0.7}
          disabled={!p}
          onPress={handleDownloadPayslip}
        >
          <AppIcon name="download" size={16} color="#114B3E" style={{marginRight: 8}} />
          <Text style={styles.downloadBtnText}>SHARE PAYSLIP</Text>
        </TouchableOpacity>

        {/* SALARY QUERY CARD */}
        <TouchableOpacity
          style={styles.queryCard}
          activeOpacity={0.8}
          onPress={handleSalaryDispute}
        >
          <View style={styles.queryIconBox}>
            <AppIcon name="documents" size={20} color="#114B3E" />
          </View>
          <View style={styles.queryTextCol}>
            <Text style={styles.queryTitle}>Query regarding salary?</Text>
            <Text style={styles.querySub}>
              Raise a dispute or contact HR Finance.
            </Text>
          </View>
          <View style={styles.queryArrowBox}>
            <Text style={styles.queryArrowIcon}>›</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: {marginVertical: 12},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
  daysStatsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  dayCol: {
    flex: 1,
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },
  dayValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#F1F5F9",
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  sectionHeadingBox: {
    backgroundColor: "#FDF2F2",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionHeadingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#991B1B",
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  itemName: {
    fontSize: 13.5,
    color: "#334155",
    fontWeight: "500",
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.4,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "900",
  },
  netCard: {
    backgroundColor: "#114B3E",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  netCaption: {
    fontSize: 11,
    fontWeight: "800",
    color: "#A7F3D0",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  netWords: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 10,
    textAlign: "center",
  },
  netAmount: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  downloadBtn: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  downloadBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#114B3E",
    letterSpacing: 0.5,
  },
  queryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 20,
  },
  queryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  queryIcon: {
    fontSize: 20,
  },
  queryTextCol: {
    flex: 1,
  },
  queryTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  querySub: {
    fontSize: 11.5,
    color: "#64748B",
  },
  queryArrowBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
  },
  queryArrowIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
