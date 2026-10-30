import React, {useCallback, useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, AppIcon, toast} from "../../components/common";
import {useAuth} from "../../context/AuthContext";
import {useCompany, useCreateTicket, useFaqs} from "../../hooks/queries";

const digits = (s?: string) => (s ?? "").replace(/\D/g, "");

export const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {partner} = useAuth();
  const company = useCompany().data;
  const faqs = useFaqs();
  const createTicket = useCreateTicket();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const phone = company?.supportPhone;
  const email = company?.supportEmail;
  const whatsapp = company?.whatsappNumber ?? phone;

  const openUrl = useCallback((url?: string, fallback?: string) => {
    if (!url) {
      Alert.alert("Not available", fallback ?? "Contact details are still loading.");
      return;
    }
    Linking.openURL(url).catch(() => Alert.alert("Couldn't open", fallback ?? url));
  }, []);

  const handleCall = useCallback(() => openUrl(phone && `tel:${digits(phone)}`, phone), [openUrl, phone]);
  const handleEmail = useCallback(() => openUrl(email && `mailto:${email}`, email), [openUrl, email]);
  const handleWhatsapp = useCallback(
    () => openUrl(whatsapp && `https://wa.me/${digits(whatsapp)}`, whatsapp),
    [openUrl, whatsapp],
  );

  const handleSubmitTicket = useCallback(() => {
    if (createTicket.isPending) return;
    if (subject.trim().length < 4 || message.trim().length < 10) {
      Alert.alert("Add more detail", "Please enter a subject and describe your issue (at least 10 characters).");
      return;
    }
    createTicket.mutate(
      {
        subject: subject.trim(),
        description: message.trim(),
        category: "Partner",
        userName: partner?.fullName,
        userPhone: partner?.phoneNumber,
        userId: partner?.userId,
      },
      {
        onSuccess: () => {
          setSubject("");
          setMessage("");
          toast.success("Support request sent. Our team will reach out.");
        },
      },
    );
  }, [createTicket, subject, message, partner]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Help & Support"
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
        {/* TOP CONTACT CARDS: CALL US & EMAIL US */}
        <View style={styles.topCardsRow}>
          <TouchableOpacity
            style={styles.contactTopCard}
            activeOpacity={0.8}
            onPress={handleCall}
          >
            <View style={styles.topIconCircleGreen}>
              <AppIcon name="phone" size={20} color="#114B3E" />
            </View>
            <Text style={styles.topCardTitle}>Call Us</Text>
            <Text style={styles.topCardSub} numberOfLines={1}>{phone ?? "—"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactTopCard}
            activeOpacity={0.8}
            onPress={handleEmail}
          >
            <View style={styles.topIconCircleRose}>
              <AppIcon name="email" size={20} color="#E11D48" />
            </View>
            <Text style={styles.topCardTitle}>Email Us</Text>
            <Text style={styles.topCardSub} numberOfLines={1}>{email ?? "—"}</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK ANSWERS CARD — live FAQs */}
        <View style={styles.quickAnswersCard}>
          <View style={styles.quickHeadRow}>
            <Text style={styles.quickHeading}>Quick Answers</Text>
            {faqs.data && faqs.data.length > 3 && (
              <TouchableOpacity onPress={() => navigation.navigate("Faq")} activeOpacity={0.7}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {faqs.isLoading && <ActivityIndicator color="#114B3E" />}
          {!faqs.isLoading && !faqs.data?.length && (
            <Text style={styles.qaAnswer}>No FAQs available right now.</Text>
          )}
          {(faqs.data ?? []).slice(0, 3).map((f, i, arr) => (
            <View key={f._id} style={[styles.qaBlock, i === arr.length - 1 && styles.qaBlockLast]}>
              <Text style={styles.qaQuestion}>{f.question}</Text>
              <Text style={styles.qaAnswer}>{f.answer}</Text>
            </View>
          ))}
        </View>

        {/* NOTE: no "my tickets" list — GET /support is not scoped to the logged-in
            user, so listing it would expose other people's support tickets. */}

        {/* COMMON ISSUES SECTION */}
        <Text style={styles.sectionTitle}>Common Issues</Text>

        <TouchableOpacity
          style={styles.issueCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("EarningsHistory")}
        >
          <View style={styles.issueAccentBar} />
          <View style={styles.issueIconBox}>
            <AppIcon name="salary" size={20} color="#114B3E" />
          </View>
          <View style={styles.issueTextCol}>
            <Text style={styles.issueTitle}>Payout status</Text>
            <Text style={styles.issueSub}>Track your earnings and transfers</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.issueCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("SubmitLeave")}
        >
          <View style={styles.issueAccentBar} />
          <View style={styles.issueIconBox}>
            <AppIcon name="calendar" size={20} color="#114B3E" />
          </View>
          <View style={styles.issueTextCol}>
            <Text style={styles.issueTitle}>Leave submission</Text>
            <Text style={styles.issueSub}>Manage your time off requests</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.issueCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("MyServices")}
        >
          <View style={styles.issueAccentBar} />
          <View style={styles.issueIconBox}>
            <AppIcon name="services" size={20} color="#114B3E" />
          </View>
          <View style={styles.issueTextCol}>
            <Text style={styles.issueTitle}>Extra services</Text>
            <Text style={styles.issueSub}>Add-ons and specialized requests</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* RAISE A SUPPORT REQUEST */}
        <View style={styles.privacyTeamCard}>
          <Text style={styles.privacyTeamTitle}>Raise a Support Request</Text>
          <Text style={styles.privacyTeamSub}>Our team replies on the number registered to your account</Text>

          <TextInput
            style={styles.ticketInput}
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject"
            placeholderTextColor="#94A3B8"
            maxLength={120}
          />
          <TextInput
            style={[styles.ticketInput, styles.ticketTextArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue…"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
          <TouchableOpacity
            style={styles.ticketBtn}
            activeOpacity={0.85}
            disabled={createTicket.isPending}
            onPress={handleSubmitTicket}>
            <Text style={styles.ticketBtnText}>
              {createTicket.isPending ? "Sending…" : "Submit Request"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FOR MORE QUERY CARD */}
        <View style={styles.moreQueryCard}>
          <Text style={styles.moreQueryTitle}>For More Query</Text>
          <Text style={styles.moreQuerySub}>
            {company?.workingHours ?? "Our support team is here to help"}
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.callOutlineBtn}
              activeOpacity={0.8}
              onPress={handleCall}
            >
              <AppIcon name="phone" size={16} color="#114B3E" />
              <Text style={styles.callOutlineText}>Call Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappSolidBtn}
              activeOpacity={0.8}
              onPress={handleWhatsapp}
            >
              <AppIcon name="whatsapp" size={16} color="#FFFFFF" />
              <Text style={styles.whatsappSolidText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  quickHeadRow: {flexDirection: "row", justifyContent: "space-between", alignItems: "center"},
  viewAll: {fontSize: 12, fontWeight: "700", color: "#114B3E"},
  qaBlockLast: {marginBottom: 0},
  ticketInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 10,
    backgroundColor: "#F8FAFC",
  },
  ticketTextArea: {height: 92},
  ticketBtn: {backgroundColor: "#114B3E", paddingVertical: 12, borderRadius: 14, alignItems: "center"},
  ticketBtnText: {color: "#FFFFFF", fontSize: 14, fontWeight: "700"},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topCardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  contactTopCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  topIconCircleGreen: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  topIconCircleRose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  topIconText: {
    fontSize: 16,
  },
  topCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  topCardSub: {
    fontSize: 11,
    color: "#64748B",
  },
  quickAnswersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  quickHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  qaBlock: {
    marginBottom: 12,
  },
  qaQuestion: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  qaAnswer: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  issueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
    overflow: "hidden",
    marginBottom: 10,
  },
  issueAccentBar: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3.5,
    backgroundColor: "#114B3E",
    borderRadius: 2,
  },
  issueIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    marginRight: 12,
  },
  issueIcon: {
    fontSize: 18,
  },
  issueTextCol: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  issueSub: {
    fontSize: 11.5,
    color: "#64748B",
  },
  chevron: {
    fontSize: 18,
    color: "#94A3B8",
  },
  privacyTeamCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginVertical: 14,
  },
  privacyTeamTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  privacyTeamSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginBottom: 10,
  },
  privacyContactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  contactIcon: {
    fontSize: 13,
    marginRight: 8,
  },
  privacyContactText: {
    fontSize: 12,
    color: "#475569",
    flex: 1,
  },
  moreQueryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    marginBottom: 20,
  },
  moreQueryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  moreQuerySub: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 14,
  },
  btnRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  callOutlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  btnIcon: {
    fontSize: 14,
  },
  callOutlineText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#114B3E",
  },
  whatsappSolidBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#114B3E",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  whatsappSolidText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
