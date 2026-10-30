import React, {useState, useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, AppIcon} from "../../components/common";
import {useCompany, usePolicy} from "../../hooks/queries";

interface Section {id: string; title: string; content: string}

// Splits the API's markdown policy on "##"/"#" headings into accordion sections.
const parsePolicy = (md: string): Section[] => {
  if (!md.trim()) return [];
  const parts = md.split(/\n(?=#{1,3}\s)/g);
  const out: Section[] = [];
  parts.forEach((chunk, i) => {
    const m = chunk.match(/^#{1,3}\s*(.+)/);
    const title = m?.[1]?.trim() ?? "";
    const body = (m ? chunk.slice(m[0].length) : chunk)
      .replace(/^[ \t]*[-*]\s+/gm, "• ")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .trim();
    // First chunk is usually the document title with no body — skip it.
    if (!body) return;
    out.push({id: `sec-${i}`, title: title || "Policy", content: body});
  });
  return out.length ? out : [{id: "sec-0", title: "Privacy Policy", content: md.trim()}];
};

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {data: policyMd = "", isLoading, isError} = usePolicy("privacy");
  const company = useCompany().data;

  const sections = useMemo(() => parsePolicy(policyMd), [policyMd]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const addr = company?.registeredAddress;
  const addressLine = addr
    ? [addr.street, addr.city, addr.postalCode].filter(Boolean).join(", ")
    : "";

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Privacy Policy"
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
        {/* PRIVACY MATTERS BANNER */}
        <View style={styles.mattersCard}>
          <AppIcon name="privacy" size={22} color="#114B3E" style={{marginRight: 10, marginTop: 2}} />
          <View style={styles.mattersTextCol}>
            <Text style={styles.mattersTitle}>Your privacy matters to us</Text>
            <Text style={styles.mattersDesc}>
              {company?.brandName ?? "GET READY"} is committed to protecting your personal data. This policy explains
              what we collect, why, and how you can control it.
            </Text>
          </View>
        </View>

        {isLoading && <ActivityIndicator color="#114B3E" style={styles.loader} />}
        {isError && !isLoading && (
          <Text style={styles.emptyText}>Couldn't load the policy. Pull back and try again.</Text>
        )}

        {/* ACCORDION SECTIONS */}
        <View style={styles.accordionContainer}>
          {sections.map((sec, index) => {
            const isExpanded = expandedSection === sec.id;
            return (
              <View
                key={sec.id}
                style={[
                  styles.accordionItem,
                  index === sections.length - 1 && styles.lastAccordionItem,
                ]}
              >
                <TouchableOpacity
                  style={styles.accordionHeader}
                  activeOpacity={0.7}
                  onPress={() => toggleSection(sec.id)}
                >
                  <Text style={styles.accordionTitle}>{sec.title}</Text>
                  <Text
                    style={[
                      styles.chevron,
                      isExpanded && styles.chevronExpanded,
                    ]}
                  >
                    {isExpanded ? "⌃" : "⌄"}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.accordionBody}>
                    <Text style={styles.bodyText}>{sec.content}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* CONTACT OUR PRIVACY TEAM CARD */}
        <View style={styles.privacyTeamCard}>
          <Text style={styles.teamCardTitle}>Contact Our Privacy Team</Text>
          <Text style={styles.teamCardSub}>
            For privacy-related queries or data requests
          </Text>

          <View style={styles.contactRow}>
            <AppIcon name="email" size={16} color="#64748B" />
            <Text style={styles.contactText}>{company?.supportEmail ?? "—"}</Text>
          </View>

          <View style={styles.contactRow}>
            <AppIcon name="location" size={16} color="#64748B" />
            <Text style={styles.contactText}>
              {[company?.legalName, addressLine].filter(Boolean).join(", ") || "—"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: {marginVertical: 24},
  emptyText: {textAlign: "center", color: "#64748B", fontSize: 13, marginVertical: 20},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  mattersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  shieldIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  mattersTextCol: {
    flex: 1,
  },
  mattersTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  mattersDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  accordionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    marginBottom: 18,
  },
  accordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  lastAccordionItem: {
    borderBottomWidth: 0,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  chevron: {
    fontSize: 16,
    color: "#94A3B8",
    fontWeight: "800",
  },
  chevronExpanded: {
    color: "#E11D48",
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bodyText: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
  },
  privacyTeamCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 20,
  },
  teamCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  teamCardSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  contactIcon: {
    fontSize: 13,
    marginRight: 8,
  },
  contactText: {
    fontSize: 12,
    color: "#475569",
    flex: 1,
  },
});
