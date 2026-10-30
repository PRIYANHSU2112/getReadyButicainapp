import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";
import {PackageItem} from "../../types";
import {usePackage} from "../../hooks/queries";
import {Badge, ServiceUnderReviewModal} from "../../components/common";

type Props = NativeStackScreenProps<RootStackParamList, "PackageDetails">;

const {width: SCREEN_WIDTH} = Dimensions.get("window");

export const PackageDetailsScreen: React.FC<Props> = props => {
  const {pkg, isLoading} = usePackage(props.route.params?.packageId);
  if (!pkg) {
    return (
      <View style={[styles.screenContainer, {justifyContent: "center", alignItems: "center"}]}>
        {isLoading ? <ActivityIndicator color="#114B3E" /> : <Text>Package not found</Text>}
      </View>
    );
  }
  return <PackageDetailsContent {...props} pkg={pkg} />;
};

const PackageDetailsContent: React.FC<Props & {pkg: PackageItem}> = ({navigation, pkg}) => {
  const insets = useSafeAreaInsets();

  const [showReviewModal, setShowReviewModal] = useState(false);

  const inclusions = pkg.inclusionsList ?? pkg.servicesIncluded ?? [];
  const reviews = pkg.reviews ?? [];

  const getImageSource = () => {
    if (pkg.thumbnailUrl) return {uri: pkg.thumbnailUrl};
    switch (pkg.imageKey) {
      case "SERVICE_HERO_BRIDAL":
        return IMAGES.SERVICE_HERO_BRIDAL;
      case "SERVICE_HERO_BLISS":
        return IMAGES.SERVICE_HERO_BLISS;
      case "SERVICE_HERO_FACIAL":
        return IMAGES.SERVICE_HERO_FACIAL;
      case "SERVICE_PEDICURE":
        return IMAGES.SERVICE_PEDICURE;
      default:
        return IMAGES.SERVICE_HERO_BRIDAL;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Image 2 */}
      <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top, 14)}]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backCircleBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>

        <Text maxFontSizeMultiplier={1.3} style={styles.headerTitle}>
          Package Details
        </Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 90, 110)},
        ]}>
        {/* Hero Image Card with Most Popular Badge matching Image 2 */}
        <View style={styles.heroCardContainer}>
          <Image
            source={getImageSource()}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {pkg.isPopular && (
            <View style={styles.mostPopularBadgeTop}>
              <Text style={styles.mostPopularText}>Most Popular</Text>
            </View>
          )}
        </View>

        {/* Package Title & Details matching Image 2 */}
        <View style={styles.infoSection}>
          {pkg.isPopular && (
            <View style={styles.popularTagPill}>
              <Text style={styles.popularTagPillText}>Most Popular</Text>
            </View>
          )}

          <Text maxFontSizeMultiplier={1.3} style={styles.packageTitle}>
            {pkg.title}
          </Text>

          <View style={styles.metaRow}>
            {!!pkg.duration && (
              <>
                <Text style={styles.metaText}>⏱ {pkg.duration}</Text>
                <Text style={styles.metaDot}>•</Text>
              </>
            )}
            <Text style={styles.metaText}>
              {pkg.reviewsCount && pkg.rating
                ? `⭐ ${pkg.rating.toFixed(1)} (${pkg.reviewsCount} ${pkg.reviewsCount === 1 ? "review" : "reviews"})`
                : "⭐ No ratings yet"}
            </Text>
          </View>

          {pkg.status !== "approved" && (
            <View style={styles.statusRow}>
              <Badge
                label={pkg.status === "pending" ? "Under review" : "Rejected"}
                variant={pkg.status === "pending" ? "warning" : "error"}
                size="small"
              />
              {!!pkg.rejectionReason && (
                <Text style={styles.rejectionReasonText}>{pkg.rejectionReason}</Text>
              )}
            </View>
          )}

          {!!pkg.description && (
            <Text maxFontSizeMultiplier={1.3} style={styles.descriptionText}>
              {pkg.description}
            </Text>
          )}

          {/* Pricing Row matching Image 2 */}
          <View style={styles.pricingRow}>
            <View style={styles.discountPriceBlock}>
              <Text style={styles.discountPriceText}>
                ₹{pkg.discountPrice.toLocaleString("en-IN")}
              </Text>
              <View style={styles.discountTagPill}>
                <Text style={styles.discountTagText}>Discounted Price</Text>
              </View>
            </View>

            <View style={styles.fixedPriceBlock}>
              <Text style={styles.fixedPriceLabel}>Fixed price</Text>
              <Text style={styles.fixedPriceValue}>
                ₹{(pkg.fixedPrice || pkg.originalPrice).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </View>

        {/* What's Included matching Image 2 */}
        <View style={styles.sectionContainer}>
          <Text maxFontSizeMultiplier={1.3} style={styles.sectionHeading}>
            What's Included
          </Text>

          <View style={styles.inclusionsList}>
            {inclusions.map((item, index) => (
              <View key={`inc-${index}`} style={styles.inclusionRow}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberBadgeText}>{index + 1}</Text>
                </View>
                <Text maxFontSizeMultiplier={1.3} style={styles.inclusionText}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Service Review matching Image 2 */}
        <View style={styles.sectionContainer}>
          <View style={styles.reviewHeaderRow}>
            <View style={styles.reviewTitleGroup}>
              <View style={styles.redBarIndicator} />
              <Text maxFontSizeMultiplier={1.3} style={styles.sectionHeading}>
                Service Review
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("RatingsReviews")}>
              <Text style={styles.viewAllText}>View All ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScroll}>
            {reviews.map(rev => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewUserRow}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{rev.avatarLetter}</Text>
                  </View>
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewAuthor}>{rev.author}</Text>
                    <Text style={styles.reviewLocation}>{rev.location}</Text>
                  </View>
                  <View style={styles.starRow}>
                    {Array.from({length: rev.rating}).map((_, i) => (
                      <Text key={i} style={styles.starIcon}>
                        ★
                      </Text>
                    ))}
                  </View>
                </View>

                <Text
                  maxFontSizeMultiplier={1.3}
                  numberOfLines={4}
                  style={styles.reviewComment}>
                  {rev.comment}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Action Bar matching Image 2 */}
      <View
        style={[
          styles.bottomActionBar,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("EditPackage", {
              packageId: pkg.id,
              packageTitle: pkg.title,
            })
          }
          style={styles.outlineEditBtn}>
          <Text style={styles.outlineEditBtnText}>Edit Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowReviewModal(true)}
          style={styles.filledAddBtn}>
          <Text style={styles.filledAddBtnText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      {/* Service Under Review Modal matching Image 3 */}
      <ServiceUnderReviewModal
        visible={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          (navigation as any).navigate("MainTabs");
        }}
      />
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
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#E11D48", // Rose red accent matching design
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCardContainer: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  mostPopularBadgeTop: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FFE4E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  mostPopularText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E11D48",
  },
  infoSection: {
    marginTop: 16,
  },
  popularTagPill: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE4E6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  popularTagPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#E11D48",
  },
  packageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  metaDot: {
    fontSize: 12,
    color: "#9CA3AF",
    marginHorizontal: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  rejectionReasonText: {
    flex: 1,
    fontSize: 11.5,
    color: "#B91C1C",
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563",
    marginBottom: 16,
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  discountPriceBlock: {
    flexDirection: "column",
  },
  discountPriceText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  discountTagPill: {
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 3,
  },
  discountTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803D",
  },
  fixedPriceBlock: {
    alignItems: "flex-end",
  },
  fixedPriceLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  fixedPriceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.2,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  inclusionsList: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inclusionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#114B3E", // Deep emerald circle matching Image 2
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  inclusionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  reviewTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  redBarIndicator: {
    width: 3,
    height: 16,
    backgroundColor: "#BE185D", // Accent bar matching Image 2
    borderRadius: 2,
    marginRight: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#BE185D",
  },
  reviewsScroll: {
    paddingRight: 16,
  },
  reviewCard: {
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  reviewUserRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#881337", // Deep burgundy circle matching Image 2
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  reviewAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  reviewLocation: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  starRow: {
    flexDirection: "row",
  },
  starIcon: {
    fontSize: 12,
    color: "#F59E0B",
  },
  reviewComment: {
    fontSize: 11,
    lineHeight: 16,
    color: "#4B5563",
  },
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  outlineEditBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineEditBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#114B3E",
  },
  filledAddBtn: {
    flex: 1,
    backgroundColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filledAddBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
