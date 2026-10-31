import React, {useState, useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";
import {useBookableServices, useProposeAddOns} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "AddExtraService">;

export const AddExtraServiceScreen: React.FC<Props> = ({route, navigation}) => {
  const insets = useSafeAreaInsets();
  const {bookingId} = route.params;

  const [activeTab, setActiveTab] = useState<"individual" | "package">("individual");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  // Only approved services the partner actually offers can be added mid-session.
  const allItems = useBookableServices().bookable;
  const CATEGORIES = useMemo(
    () => ["All", ...Array.from(new Set(allItems.map(s => s.category).filter(Boolean)))],
    [allItems],
  );

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchCat =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [allItems, selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    if (addedItemIds.includes(id)) {
      setAddedItemIds(addedItemIds.filter(i => i !== id));
    } else {
      setAddedItemIds([...addedItemIds, id]);
    }
  };

  const selectedCount = addedItemIds.length;
  // Shown for reference only; the server prices the request from the catalog.
  const selectedTotal = addedItemIds.reduce((sum, id) => {
    const item = allItems.find(i => i.id === id);
    return sum + (item ? item.discountPrice : 0);
  }, 0);

  const proposeAddOns = useProposeAddOns();
  const handleSendRequest = async () => {
    if (proposeAddOns.isPending) return;
    const selectedItems = allItems.filter(i => addedItemIds.includes(i.id));
    try {
      await proposeAddOns.mutateAsync({id: bookingId, serviceIds: addedItemIds});
      navigation.replace("AwaitingApproval", {bookingId, requestedItems: selectedItems});
    } catch (error) {
      Alert.alert("Request not sent", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Home-4.png & Home-5.png */}
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
          Add Extra Service
        </Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: selectedCount > 0 ? insets.bottom + 110 : insets.bottom + 40},
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Segmented Control matching Home-4 & Home-5 */}
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
              Individual Service
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
              Package
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar matching Home-5 */}
        <View style={styles.searchBarWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search services..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}>
          {CATEGORIES.map(category => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}>
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Services List matching Home-4 & Home-5 */}
        <View style={styles.servicesList}>
          {filteredItems.map(item => {
            const isAdded = addedItemIds.includes(item.id);
            return (
              <View key={item.id} style={styles.serviceCard}>
                <Image
                  source={
                    item.category === "Nails"
                      ? IMAGES.SERVICE_PEDICURE
                      : IMAGES.SERVICE_FACIAL
                  }
                  style={styles.serviceThumb}
                  resizeMode="cover"
                />

                <View style={styles.serviceInfoColumn}>
                  <Text maxFontSizeMultiplier={1.3} style={styles.serviceTitle}>
                    {item.title}
                  </Text>
                  <View style={styles.tagsRow}>
                    <View style={styles.pillTag}>
                      <Text style={styles.pillTagText}>{item.category}</Text>
                    </View>
                    <Text style={styles.durationText}>⏱ {item.duration}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.discountPrice}>₹{item.discountPrice}.00</Text>
                    <Text style={styles.originalPrice}>₹{item.originalPrice}.00</Text>
                  </View>
                </View>

                {/* Right Action Button: + Add or Added Badge matching Home-5 */}
                {isAdded ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleItem(item.id)}
                    style={styles.addedBadgeBtn}>
                    <Text style={styles.addedBadgeText}>Added</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleItem(item.id)}
                    style={styles.addBtnOutline}>
                    <Text style={styles.addBtnOutlineText}>+ Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Summary matching Home-5.png */}
      {selectedCount > 0 && (
        <View
          style={[
            styles.floatingCartBar,
            {paddingBottom: Math.max(insets.bottom, 14)},
          ]}>
          <View style={styles.cartMetaRow}>
            <View style={styles.cartIconTextGroup}>
              <Text style={styles.cartBagIcon}>🛍</Text>
              <Text style={styles.cartSelectedText}>
                {selectedCount} Item Selected
              </Text>
            </View>
            <Text style={styles.cartTotalAmount}>+₹{selectedTotal}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSendRequest}
            disabled={proposeAddOns.isPending || selectedCount > 5}
            style={styles.sendRequestBtn}>
            {proposeAddOns.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendRequestBtnText}>
                {selectedCount > 5 ? "Select up to 5 services" : "Send Addition Request to Customer ▷"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#E11D48",
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
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  segmentTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 13,
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
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#111827",
  },
  categoriesScroll: {
    paddingBottom: 14,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryChipActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#114B3E",
  },
  categoryChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#4B5563",
  },
  categoryChipTextActive: {
    color: "#114B3E",
    fontWeight: "800",
  },
  servicesList: {
    marginTop: 4,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  serviceThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  serviceInfoColumn: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  pillTag: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pillTagText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#059669",
  },
  durationText: {
    fontSize: 11,
    color: "#6B7280",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  discountPrice: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#111827",
  },
  originalPrice: {
    fontSize: 11.5,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  addedBadgeBtn: {
    borderWidth: 1.2,
    borderColor: "#0D9488",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F0FDFA",
  },
  addedBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0D9488",
  },
  addBtnOutline: {
    borderWidth: 1.2,
    borderColor: "#0D9488",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  addBtnOutlineText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0D9488",
  },
  floatingCartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cartMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cartIconTextGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartBagIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  cartSelectedText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
  },
  cartTotalAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: "#114B3E",
  },
  sendRequestBtn: {
    backgroundColor: "#114B3E",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendRequestBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
