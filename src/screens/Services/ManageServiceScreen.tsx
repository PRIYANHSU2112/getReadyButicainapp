import React, {useState, useEffect} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";
import {DetailedServiceItem} from "../../types";
import {useMyServices, useServiceDetail} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "ManageService">;

const {width} = Dimensions.get("window");
const heroImageHeight = Math.round(width * 0.62);

export const ManageServiceScreen: React.FC<Props> = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const serviceId = route.params?.serviceId;

  // Instant render from the cached list; fetch full detail only if not cached.
  const listed = useMyServices().data?.find(s => s.id === serviceId);
  const detail = useServiceDetail(listed ? undefined : serviceId);
  const service: DetailedServiceItem | undefined = listed ?? detail.data;

  const [isEnabled, setIsEnabled] = useState(service?.isEnabled ?? true);
  useEffect(() => { if (service) setIsEnabled(service.isEnabled); }, [service?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!service) {
    return (
      <View style={[styles.screenContainer, {justifyContent: "center", alignItems: "center"}]}>
        {detail.isLoading ? <ActivityIndicator color="#114B3E" /> : <Text>Service not found</Text>}
      </View>
    );
  }

  const handleEdit = () => {
    Alert.alert(
      "Edit Service",
      `Editing options for "${service.title}" including pricing, duration, and inclusions.`,
      [{text: "Got It"}]
    );
  };

  const handleToggleActive = () => {
    setIsEnabled(!isEnabled);
    Alert.alert(
      isEnabled ? "Service Paused" : "Service Activated",
      isEnabled
        ? `"${service.title}" is now hidden from new incoming bookings.`
        : `"${service.title}" is now active and ready to receive client requests.`
    );
  };

  return (
    <View style={styles.screenContainer}>
      {/* Header matching Image 3: < Manage Service ... Edit */}
      <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top + 6, 16)}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backCircleBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>

        <Text maxFontSizeMultiplier={1.3} style={styles.headerTitle}>
          Manage Service
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit service"
          style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 40, 56)},
        ]}>
        {/* ========================================================================= */}
        {/* HERO IMAGE matching Image 3 (Gold Facial Model) */}
        {/* ========================================================================= */}
        <View style={styles.heroImageWrapper}>
          <Image
            source={service.thumbnailUrl ? {uri: service.thumbnailUrl} : IMAGES.SERVICE_HERO_FACIAL}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Most Popular Badge matching Image 3 */}
        {service.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}

        {/* Title */}
        <Text maxFontSizeMultiplier={1.3} style={styles.serviceTitle}>
          {service.title}
        </Text>

        {/* Meta Row: Duration & Rating matching Image 3 */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaClockIcon}>⏱</Text>
            <Text style={styles.metaText}>{service.duration}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Text style={styles.metaStarIcon}>⭐</Text>
            <Text style={styles.metaText}>
              {service.reviewsCount > 0
                ? `${service.rating.toFixed(1)} (${service.reviewsCount} ${service.reviewsCount === 1 ? "review" : "reviews"})`
                : "No ratings yet"}
            </Text>
          </View>
        </View>

        {/* Description matching Image 3 */}
        <Text style={styles.descriptionText}>{service.description}</Text>

        {/* Price Row: ₹200 (₹350) matching Image 3 */}
        <View style={styles.priceContainer}>
          <Text style={styles.discountPrice}>₹{service.discountPrice}</Text>
          <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>
        </View>

        <View style={styles.divider} />

        {/* ========================================================================= */}
        {/* WHAT'S INCLUDED SECTION matching Image 3 */}
        {/* ========================================================================= */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>What's Included</Text>

          <View style={styles.inclusionsList}>
            {service.whatsIncluded.map((item, index) => (
              <View key={index} style={styles.inclusionItemRow}>
                {/* Light Mint Circular Checkmark Icon matching Image 3 */}
                <View style={styles.checkCircle}>
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </View>
                <Text style={styles.inclusionItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* SERVICE REVIEW SECTION matching Image 3 — only when real reviews exist     */}
        {/* ========================================================================= */}
        {(service.reviews ?? []).length > 0 && (
        <>
        <View style={styles.divider} />
        <View style={styles.sectionBlock}>
          <View style={styles.reviewsHeaderRow}>
            <View style={styles.reviewHeadingWithAccent}>
              <View style={styles.greenAccentBar} />
              <Text style={styles.sectionHeading}>Service Review</Text>
            </View>
          </View>

          {/* Horizontal Review Cards Carousel matching Image 3 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScroll}>
            {(service.reviews ?? []).map(rev => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewAuthorRow}>
                  <View style={styles.authorAvatarCircle}>
                    <Text style={styles.authorAvatarLetter}>{rev.avatarLetter}</Text>
                  </View>
                  <View style={styles.authorDetails}>
                    <Text style={styles.authorName}>{rev.author}</Text>
                    <Text style={styles.authorLocation}>{rev.location}</Text>
                  </View>
                  <View style={styles.starsRow}>
                    <Text style={styles.starsText}>{"★".repeat(rev.rating)}</Text>
                  </View>
                </View>

                <Text style={styles.reviewCommentText} numberOfLines={4}>
                  {rev.comment}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
        </>
        )}

        {/* Active Toggle Action Card */}
        <View style={styles.statusToggleCard}>
          <View style={styles.statusToggleTextCol}>
            <Text style={styles.statusToggleTitle}>
              {isEnabled ? "Service is Live" : "Service is Paused"}
            </Text>
            <Text style={styles.statusToggleSub}>
              {isEnabled
                ? "Clients in your working radius can book this service."
                : "Clients cannot see or book this service right now."}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleToggleActive}
            style={[
              styles.toggleActionBtn,
              isEnabled ? styles.pauseBtn : styles.activateBtn,
            ]}>
            <Text
              style={[
                styles.toggleActionBtnText,
                isEnabled ? styles.pauseBtnText : styles.activateBtnText,
              ]}>
              {isEnabled ? "Pause" : "Activate"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FAEDF1",
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#B02B58",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#114B3E",
    backgroundColor: "#FFFFFF",
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroImageWrapper: {
    width: "100%",
    height: heroImageHeight,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    marginBottom: 14,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E11D48", // Pink accent matching Image 3
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaClockIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metaStarIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#6B7280",
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  descriptionText: {
    fontSize: 13.5,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 14,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  discountPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 15,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },
  inclusionsList: {
    gap: 12,
  },
  inclusionItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E6F4EA", // Soft mint green circle matching Image 3
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkmarkIcon: {
    fontSize: 12,
    fontWeight: "800",
    color: "#114B3E",
  },
  inclusionItemText: {
    fontSize: 13.5,
    fontWeight: "500",
    color: "#374151",
  },
  reviewsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewHeadingWithAccent: {
    flexDirection: "row",
    alignItems: "center",
  },
  greenAccentBar: {
    width: 3.5,
    height: 16,
    backgroundColor: "#114B3E",
    borderRadius: 2,
    marginRight: 8,
    marginBottom: 14,
  },
  viewAllReviewsText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
    marginBottom: 14,
  },
  reviewsScroll: {
    paddingBottom: 4,
    gap: 12,
  },
  reviewCard: {
    width: width * 0.76,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 12,
  },
  reviewAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  authorAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  authorAvatarLetter: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  authorLocation: {
    fontSize: 10.5,
    color: "#6B7280",
  },
  starsRow: {
    marginLeft: 6,
  },
  starsText: {
    fontSize: 12,
    color: "#F59E0B", // Gold stars
    letterSpacing: 1,
  },
  reviewCommentText: {
    fontSize: 12.5,
    color: "#4B5563",
    lineHeight: 18,
  },
  statusToggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginTop: 8,
  },
  statusToggleTextCol: {
    flex: 1,
    marginRight: 12,
  },
  statusToggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 2,
  },
  statusToggleSub: {
    fontSize: 11.5,
    color: "#4B5563",
  },
  toggleActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleActionBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  pauseBtn: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  pauseBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#DC2626",
  },
  activateBtn: {
    backgroundColor: "#114B3E",
  },
  activateBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
