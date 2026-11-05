import React, {useState, useCallback, useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {
  ScreenContainer,
  Header,
  DeleteAccountModal,
  AppIcon,
} from "../../components/common";
import {useAuth} from "../../context/AuthContext";
import {useCompany, useCreateTicket, useFaqs} from "../../hooks/queries";

const digits = (s?: string) => (s ?? "").replace(/\D/g, "");

export const FaqScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {partner} = useAuth();
  const createTicket = useCreateTicket();
  const faqQuery = useFaqs();
  const company = useCompany().data;

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const faqs = useMemo(
    () => (faqQuery.data ?? []).map(f => ({id: f._id, question: f.question, answer: f.answer})),
    [faqQuery.data],
  );

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [faqs, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const open = (url?: string, label?: string) => {
    if (!url) {
      Alert.alert("Not available", label ?? "Support details are still loading.");
      return;
    }
    Linking.openURL(url).catch(() => Alert.alert("Couldn't open", label ?? url));
  };

  const handleCallUs = () => open(company?.supportPhone && `tel:${digits(company.supportPhone)}`, company?.supportPhone);

  const handleWhatsapp = () => {
    const n = company?.whatsappNumber ?? company?.supportPhone;
    open(n && `https://wa.me/${digits(n)}`, n);
  };

  // There is no self-service delete endpoint yet, so this files a real support ticket that
  // the team processes. We say exactly that, and never log the partner out or claim the
  // account is already scheduled for deletion.
  const handleConfirmDelete = useCallback(() => {
    setShowDeleteModal(false);
    if (createTicket.isPending) return;
    createTicket.mutate(
      {
        subject: "Account deletion request",
        description: "The partner has asked for their account and data to be permanently deleted.",
        category: "Partner",
        userName: partner?.fullName,
        userPhone: partner?.phoneNumber,
        userId: partner?.userId,
      },
      {
        onSuccess: () =>
          Alert.alert(
            "Deletion request sent",
            "Our team will verify your request and confirm with you before your account is removed. You can keep using the app until then.",
          ),
      },
    );
  }, [createTicket, partner]);

  return (
    <ScreenContainer scrollable={false}>
      <Header title="FAQs" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 40, 60)},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH BAR */}
        <View style={styles.searchBox}>
          <AppIcon name="search" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your question"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* FAQ ACCORDION CONTAINER */}
        <View style={styles.faqCard}>
          {faqQuery.isLoading && <ActivityIndicator color="#114B3E" style={styles.faqLoader} />}
          {!faqQuery.isLoading && filteredFaqs.length === 0 && (
            <Text style={styles.faqEmpty}>
              {searchQuery ? "No FAQs match your search." : "No FAQs available right now."}
            </Text>
          )}
          {filteredFaqs.map((faq, index) => {
            const isExpanded = expandedId === faq.id;
            return (
              <View
                key={faq.id}
                style={[
                  styles.faqItem,
                  index === filteredFaqs.length - 1 && styles.lastFaqItem,
                ]}
              >
                <TouchableOpacity
                  style={styles.faqHeader}
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(faq.id)}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text
                    style={[
                      styles.faqChevron,
                      isExpanded && styles.faqChevronExpanded,
                    ]}
                  >
                    {isExpanded ? "⌃" : "⌄"}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* STILL HAVE QUESTIONS CARD */}
        <View style={styles.stillQuestionsCard}>
          <View style={styles.bubbleIconBox}>
            <AppIcon name="chat" size={24} color="#114B3E" />
          </View>
          <Text style={styles.stillTitle}>Still have questions?</Text>
          <Text style={styles.stillSub}>
            Our support team is here 9 AM – 9 PM, every day
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.callBtn}
              activeOpacity={0.8}
              onPress={handleCallUs}
            >
              <AppIcon name="phone" size={16} color="#FFFFFF" />
              <Text style={styles.callBtnText}>Call Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappBtn}
              activeOpacity={0.8}
              onPress={handleWhatsapp}
            >
              <AppIcon name="whatsapp" size={16} color="#FFFFFF" />
              <Text style={styles.whatsappBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DELETE ACCOUNT ROW */}
        <TouchableOpacity
          style={styles.deleteRowCard}
          activeOpacity={0.7}
          onPress={() => setShowDeleteModal(true)}
        >
          <View style={styles.deleteLeft}>
            <Text style={styles.globeIcon}>🌐</Text>
            <Text style={styles.deleteRowTitle}>Delete Account</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* DELETE ACCOUNT MODAL */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirmDelete={handleConfirmDelete}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  faqLoader: {marginVertical: 20},
  faqEmpty: {textAlign: "center", color: "#64748B", fontSize: 13, paddingVertical: 20},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 0,
  },
  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    marginBottom: 18,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  lastFaqItem: {
    borderBottomWidth: 0,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  faqQuestion: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    paddingRight: 10,
  },
  faqChevron: {
    fontSize: 16,
    color: "#94A3B8",
    fontWeight: "800",
  },
  faqChevronExpanded: {
    color: "#E11D48",
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 18,
  },
  stillQuestionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  bubbleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  bubbleIcon: {
    fontSize: 22,
  },
  stillTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  stillSub: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  callBtn: {
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
  callBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#114B3E",
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#114B3E",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  whatsappBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  deleteRowCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 20,
  },
  deleteLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  globeIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  deleteRowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  chevron: {
    fontSize: 18,
    color: "#94A3B8",
  },
});
