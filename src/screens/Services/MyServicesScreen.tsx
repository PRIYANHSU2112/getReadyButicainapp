import React, {useState, useMemo, useEffect} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Platform,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";
import {CatalogStatus, DetailedServiceItem, PackageItem} from "../../types";
import {palette} from "../../theme";
import {useMyServices, usePackages} from "../../hooks/queries";

import {Badge, ServiceUnderReviewModal} from "../../components/common";

type Props = NativeStackScreenProps<RootStackParamList, "MyServices">;

type ActiveTab = "individual" | "package";

const CATEGORIES = [
  "All",
  "Facial",
  "Hair coloring",
  "Makeup",
  "Waxing",
  "Nails",
];

// Admin review state, shown so a partner can tell a live listing from a submitted one.
const STATUS_BADGE: Record<CatalogStatus, {label: string; variant: "success" | "warning" | "error"} | null> = {
  approved: null,
  pending: {label: "Under review", variant: "warning"},
  rejected: {label: "Rejected", variant: "error"},
};

const StatusBadge: React.FC<{status: CatalogStatus}> = ({status}) => {
  const badge = STATUS_BADGE[status];
  return badge ? <Badge label={badge.label} variant={badge.variant} size="small" /> : null;
};

const ratingLabel = (rating?: number, count?: number) =>
  count && rating ? `⭐ ${rating.toFixed(1)} (${count} ${count === 1 ? "review" : "reviews"})` : "⭐ No ratings yet";

export const MyServicesScreen: React.FC<Props> = ({navigation, route}) => {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<ActiveTab>(
    route.params?.initialTab || "individual"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Server data seeds local state; on/off toggles stay on-device (no beautician toggle endpoint).
  const servicesQuery = useMyServices();
  const packagesQuery = usePackages();
  const [services, setServices] = useState<DetailedServiceItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);

  useEffect(() => { if (servicesQuery.data) setServices(servicesQuery.data); }, [servicesQuery.data]);
  useEffect(() => { if (packagesQuery.data) setPackages(packagesQuery.data); }, [packagesQuery.data]);

  const toggleServiceStatus = (id: string) => {
    setServices(prev =>
      prev.map(srv => (srv.id === id ? {...srv, isEnabled: !srv.isEnabled} : srv))
    );
  };

  // Only listings the admin has approved can be live, so only those are counted.
  const summary = useMemo(() => {
    const list: Array<{status: CatalogStatus; isEnabled: boolean}> = activeTab === "individual" ? services : packages;
    const live = list.filter(i => i.status === "approved");
    const active = live.filter(i => i.isEnabled).length;
    return {active, paused: live.length - active, total: live.length};
  }, [activeTab, services, packages]);

  const isLoading = servicesQuery.isLoading || packagesQuery.isLoading;
  const loadError = servicesQuery.error ?? packagesQuery.error;

  // Category chips come from the services actually offered.
  const categories = useMemo(() => {
    const found = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
    return ["All", ...(found.length ? found : CATEGORIES.slice(1))];
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter(srv => {
      const matchesCategory =
        selectedCategory === "All" || srv.category === selectedCategory;
      const matchesSearch =
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg =>
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [packages, searchQuery]);

  // Grouped by category when "All" is selected and no search query
  const groupedCategories = useMemo(() => {
    if (selectedCategory !== "All" || searchQuery.trim().length > 0) return null;
    const cats = categories.filter(c => c !== "All");
    return cats
      .map(cat => ({
        category: cat,
        items: services.filter(s => s.category === cat),
      }))
      .filter(group => group.items.length > 0);
  }, [services, selectedCategory, searchQuery, categories]);

  const handleOpenService = (service: DetailedServiceItem) => {
    navigation.navigate("ManageService", {
      serviceId: service.id,
      serviceTitle: service.title,
    });
  };

  const getImageSource = (item: {imageKey?: string; thumbnailUrl?: string}) => {
    if (item.thumbnailUrl) return {uri: item.thumbnailUrl};
    const key = item.imageKey;
    if (key === "SERVICE_HERO_FACIAL") return IMAGES.SERVICE_HERO_FACIAL;
    if (key === "SERVICE_HERO_BRIDAL") return IMAGES.SERVICE_HERO_BRIDAL;
    if (key === "SERVICE_HERO_BLISS") return IMAGES.SERVICE_HERO_BLISS;
    if (key === "SERVICE_PEDICURE") return IMAGES.SERVICE_PEDICURE;
    return IMAGES.SERVICE_FACIAL;
  };

  const renderServiceCard = (item: DetailedServiceItem) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.88}
      onPress={() => handleOpenService(item)}
      accessibilityRole="button"
      accessibilityLabel={`Service ${item.title}, priced at ₹${item.discountPrice}`}
      style={styles.serviceCard}>
      {/* Thumbnail */}
      <Image
        source={getImageSource(item)}
        style={styles.serviceThumb}
        resizeMode="cover"
      />

      {/* Center Details */}
      <View style={styles.cardInfoColumn}>
        <Text numberOfLines={1} style={styles.serviceTitle}>
          {item.title}
        </Text>

        <View style={styles.tagsRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.tag}</Text>
          </View>
          {!!item.duration && (
            <View style={styles.durationRow}>
              <Text style={styles.durationClockIcon}>⏱</Text>
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          )}
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.discountPrice}>₹{item.discountPrice.toFixed(2)}</Text>
          {item.originalPrice > item.discountPrice && (
            <Text style={styles.originalPrice}>₹{item.originalPrice.toFixed(2)}</Text>
          )}
        </View>
      </View>

      {/* Right Controls: Switch & Chevron. A listing awaiting review can't be served yet. */}
      <View style={styles.cardRightColumn}>
        <Switch
          value={item.isEnabled && item.status === "approved"}
          disabled={item.status !== "approved"}
          onValueChange={() => toggleServiceStatus(item.id)}
          trackColor={{false: "#D1D5DB", true: "#114B3E"}} // Deep emerald when ON matching Image 1
          thumbColor="#FFFFFF"
          style={styles.cardSwitch}
        />
        <TouchableOpacity
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          onPress={() => handleOpenService(item)}
          style={styles.chevronBtn}>
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screenContainer}>
      {/* Header matching Images 1 & 5 */}
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
          {activeTab === "package" ? "My Package" : "My Services"}
        </Text>

        {/* Top Right: "+ Add services" pill button matching Images 1 & 5 */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddService")}
          accessibilityRole="button"
          accessibilityLabel="Add services"
          style={styles.addServiceTopBtn}>
          <Text style={styles.addServiceTopBtnText}>+ Add services</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 80, 96)},
        ]}
        keyboardShouldPersistTaps="handled">
        {/* ========================================================================= */}
        {/* SEGMENTED CONTROL: Individual service vs Packages matching Images 1 & 5 */}
        {/* ========================================================================= */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setActiveTab("individual")}
            style={[
              styles.segmentTab,
              activeTab === "individual" && styles.segmentTabActive,
            ]}>
            <Text
              style={[
                styles.segmentTabText,
                activeTab === "individual" && styles.segmentTabTextActive,
              ]}>
              Individual service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setActiveTab("package")}
            style={[
              styles.segmentTab,
              activeTab === "package" && styles.segmentTabActive,
            ]}>
            <Text
              style={[
                styles.segmentTabText,
                activeTab === "package" && styles.segmentTabTextActive,
              ]}>
              Packages
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active / Paused summary for whichever tab is showing */}
        {!isLoading && !loadError && summary.total > 0 && (
          <View style={styles.summaryRow} accessible accessibilityLabel={`${summary.active} active, ${summary.paused} paused`}>
            <View style={[styles.summaryCard, styles.summaryCardActive]}>
              <Text style={styles.summaryLabel}>Active</Text>
              <Text style={styles.summaryValue}>{summary.active}</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardPaused]}>
              <Text style={styles.summaryLabel}>Paused</Text>
              <Text style={styles.summaryValue}>{summary.paused}</Text>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* SEARCH BAR matching Images 1 & 5 */}
        {/* ========================================================================= */}
        <View style={styles.searchBarWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search services..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ========================================================================= */}
        {/* CATEGORY FILTER PILLS (Horizontal Scroll) matching Images 1 & 5 */}
        {/* ========================================================================= */}
        {activeTab === "individual" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsScroll}>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryPill,
                    isSelected && styles.categoryPillActive,
                  ]}>
                  <Text
                    style={[
                      styles.categoryPillText,
                      isSelected && styles.categoryPillTextActive,
                    ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* SERVICES LIST CONTENT */}
        {/* ========================================================================= */}
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color="#114B3E" />
          </View>
        ) : loadError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>⚠️</Text>
            <Text style={styles.emptyStateTitle}>Couldn't load your catalogue</Text>
            <Text style={styles.emptyStateSubtitle}>{(loadError as Error).message}</Text>
            <TouchableOpacity
              onPress={() => {
                servicesQuery.refetch();
                packagesQuery.refetch();
              }}
              style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === "individual" ? (
          groupedCategories ? (
            // Grouped by Category Section with "View all" link matching Image 5
            groupedCategories.map(group => (
              <View key={group.category} style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{group.category}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(group.category)}>
                    <Text style={styles.viewAllText}>View all</Text>
                  </TouchableOpacity>
                </View>

                {group.items.map(item => renderServiceCard(item))}
              </View>
            ))
          ) : filteredServices.length > 0 ? (
            // Direct filtered list matching Image 1
            <View style={styles.flatListBlock}>
              {filteredServices.map(item => renderServiceCard(item))}
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>💅</Text>
              <Text style={styles.emptyStateTitle}>No services yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add a service and it will appear here as soon as it's submitted for review.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AddService")}
                style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>+ Add services</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🔍</Text>
              <Text style={styles.emptyStateTitle}>No services found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try adjusting your search query or category filter.
              </Text>
            </View>
          )
        ) : filteredPackages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎁</Text>
            <Text style={styles.emptyStateTitle}>
              {packages.length === 0 ? "No packages yet" : "No packages found"}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {packages.length === 0
                ? "Bundle your services into a package to offer them together."
                : "Try a different search term."}
            </Text>
          </View>
        ) : (
          // =======================================================================
          // PACKAGES TAB CONTENT matching Image 5
          // =======================================================================
          <View style={styles.flatListBlock}>
            {filteredPackages.map(pkg => {
              const inclusions = pkg.servicesIncluded ?? [];

              return (
                <View key={pkg.id} style={styles.packageCardBig}>
                  {/* Top Cover Banner Image */}
                  <View style={styles.packageBannerWrapper}>
                    <Image
                      source={getImageSource(pkg)}
                      style={styles.packageBannerImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Body Content matching Image 5 */}
                  <View style={styles.packageBody}>
                    <View style={styles.packageTitlePriceRow}>
                      <Text maxFontSizeMultiplier={1.3} style={styles.packageTitleBig}>
                        {pkg.title}
                      </Text>
                      <Text style={styles.packagePriceBig}>₹{pkg.discountPrice}</Text>
                    </View>

                    <View style={styles.packageMetaRow}>
                      {!!pkg.duration && (
                        <>
                          <Text style={styles.packageMetaText}>⏱ {pkg.duration}</Text>
                          <Text style={styles.packageMetaDot}>•</Text>
                        </>
                      )}
                      <Text style={styles.packageMetaText}>
                        {ratingLabel(pkg.rating, pkg.reviewsCount)}
                      </Text>
                    </View>

                    {pkg.status !== "approved" && (
                      <View style={styles.packageStatusRow}>
                        <StatusBadge status={pkg.status} />
                        {!!pkg.rejectionReason && (
                          <Text style={styles.rejectionReasonText}>{pkg.rejectionReason}</Text>
                        )}
                      </View>
                    )}

                    {!!pkg.description && (
                      <Text maxFontSizeMultiplier={1.3} style={styles.packageDescBig}>
                        {pkg.description}
                      </Text>
                    )}

                    {/* What's included matching Image 5 */}
                    {inclusions.length > 0 && (
                      <>
                        <Text style={styles.whatsIncludedHeader}>What's included</Text>
                        <View style={styles.inclusionsBigList}>
                          {inclusions.map((inc, i) => (
                            <View key={`pkg-inc-${i}`} style={styles.inclusionBigRow}>
                              <View style={styles.incNumberCircle}>
                                <Text style={styles.incNumberText}>{i + 1}</Text>
                              </View>
                              <Text style={styles.incItemText}>{inc}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}

                    {/* A package awaiting review is read-only until admin decides. */}
                    <View style={styles.packageActionBtnsRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          navigation.navigate(pkg.status === "pending" ? "PackageDetails" : "EditPackage", {
                            packageId: pkg.id,
                            packageTitle: pkg.title,
                          })
                        }
                        style={styles.outlineDetailBtn}>
                        <Text style={styles.outlineDetailBtnText}>
                          {pkg.status === "pending" ? "View Details" : "Edit Details"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() =>
                          pkg.status === "pending"
                            ? setShowReviewModal(true)
                            : navigation.navigate("AddService")
                        }
                        style={styles.filledAddServiceBtn}>
                        <Text style={styles.filledAddServiceBtnText}>Add Service</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Service Under Review Modal matching Image 3 */}
      <ServiceUnderReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    color: "#B02B58", // Rose red accent matching Image 1 & 5
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  addServiceTopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "#114B3E", // Deep emerald border matching Image 1
    backgroundColor: "#FFFFFF",
  },
  addServiceTopBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#6B7280",
  },
  segmentTabTextActive: {
    color: "#114B3E",
    fontWeight: "800",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  categoryPillsScroll: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: "#E6F4EA", // Mint soft background matching Image 1
    borderColor: "#114B3E",
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  categoryPillTextActive: {
    color: "#114B3E",
    fontWeight: "800",
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#374151",
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#114B3E",
  },
  flatListBlock: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceThumb: {
    width: 66,
    height: 66,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  cardInfoColumn: {
    flex: 1,
    justifyContent: "center",
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#166534",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationClockIcon: {
    fontSize: 11,
    marginRight: 3,
  },
  durationText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountPrice: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#111827",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12.5,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  cardRightColumn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  cardSwitch: {
    transform: Platform.OS === "ios" ? [{scaleX: 0.85}, {scaleY: 0.85}] : [{scaleX: 1}, {scaleY: 1}],
  },
  chevronBtn: {
    paddingLeft: 6,
    paddingVertical: 6,
  },
  chevronText: {
    fontSize: 22,
    lineHeight: 22,
    color: "#111827",
    fontWeight: "700",
  },
  packageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  packageThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  packageInfoColumn: {
    flex: 1,
  },
  packageTagPill: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  packageTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#E11D48",
  },
  packageTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 3,
  },
  packageIncludedText: {
    fontSize: 11.5,
    color: "#6B7280",
    marginBottom: 6,
  },
  packagePriceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  packageDuration: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 10,
  },
  packageCardBig: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  packageBannerWrapper: {
    width: "100%",
    height: 180,
    backgroundColor: "#F3F4F6",
  },
  packageBannerImage: {
    width: "100%",
    height: "100%",
  },
  packageBody: {
    padding: 16,
  },
  packageTitlePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  packageTitleBig: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  packagePriceBig: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  packageMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  packageMetaText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#6B7280",
  },
  packageMetaDot: {
    fontSize: 12,
    color: "#9CA3AF",
    marginHorizontal: 6,
  },
  packageDescBig: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#4B5563",
    marginBottom: 12,
  },
  whatsIncludedHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  inclusionsBigList: {
    marginBottom: 16,
  },
  inclusionBigRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  incNumberCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#114B3E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  incNumberText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  incItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  packageActionBtnsRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 4,
  },
  outlineDetailBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineDetailBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  filledAddServiceBtn: {
    flex: 1,
    backgroundColor: "#114B3E",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  filledAddServiceBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  summaryCardActive: {
    borderLeftColor: palette.brand.green,
  },
  summaryCardPaused: {
    borderLeftColor: palette.brand.crimson,
  },
  summaryLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  packageStatusRow: {
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
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "#114B3E",
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyStateEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
