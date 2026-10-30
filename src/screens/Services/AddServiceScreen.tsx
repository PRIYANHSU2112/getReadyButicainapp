import React, {useState, useMemo} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {ServiceUnderReviewModal, AppIcon} from "../../components/common";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {catalogService} from "../../services/catalogService";
import {mediaService} from "../../services/mediaService";

type Props = NativeStackScreenProps<RootStackParamList, "AddService">;

export const AddServiceScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();

  // Cover Image State
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Categories from catalog (name → id)
  const qc = useQueryClient();
  const {data: categories = []} = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: catalogService.getCategories,
    staleTime: 30 * 60_000,
  });
  const CATEGORY_OPTIONS: string[] = categories.map((c: any) => c.name);
  const submit = useMutation({
    mutationFn: (v: {fields: Record<string, string | number | undefined>; thumb?: string; images: string[]}) =>
      catalogService.submitService(v.fields, v.thumb, v.images),
    onSuccess: () => qc.invalidateQueries({queryKey: ["catalog"]}),
  });

  // Category Selection State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Service Details State
  const [serviceTitle, setServiceTitle] = useState("");
  const [description, setDescription] = useState("");

  // Duration State
  const [hours, setHours] = useState("01");
  const [minutes, setMinutes] = useState("20");

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Price State
  const [servicePrice, setServicePrice] = useState("");
  const [fixedPrice, setFixedPrice] = useState("");

  // Additional Information State
  const [additionalDetails, setAdditionalDetails] = useState("");

  // What's Included Dynamic Checklist State
  const [inclusions, setInclusions] = useState<string[]>([""]);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Live ±10% band from the entered price, instead of a hardcoded example.
  const priceRange = useMemo(() => {
    const p = parseFloat(servicePrice);
    if (!(p > 0)) return null;
    return {min: Math.round(p * 0.9).toLocaleString("en-IN"), max: Math.round(p * 1.1).toLocaleString("en-IN")};
  }, [servicePrice]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleAddInclusion = () => {
    setInclusions([...inclusions, ""]);
  };

  const handleUpdateInclusion = (text: string, index: number) => {
    const updated = [...inclusions];
    updated[index] = text;
    setInclusions(updated);
  };

  const handleRemoveInclusion = (index: number) => {
    if (inclusions.length <= 1) {
      Alert.alert("Notice", "Service must contain at least one inclusion.");
      return;
    }
    setInclusions(inclusions.filter((_, i) => i !== index));
  };

  const pickCover = async () => {
    const m = await mediaService.openGallery({width: 1200, height: 800, cropping: true});
    if (m?.path) setCoverImage(m.path);
  };

  const handlePickCoverImage = () => {
    if (!coverImage) {
      pickCover();
    } else {
      Alert.alert(
        "Cover Image",
        "Change or remove cover image?",
        [
          {text: "Cancel", style: "cancel"},
          {text: "Remove", style: "destructive", onPress: () => setCoverImage(null)},
          {text: "Change", onPress: pickCover},
        ]
      );
    }
  };

  const handleAddGalleryImage = async () => {
    if (galleryImages.length >= 5) {
      Alert.alert("Limit Reached", "You can upload up to 5 gallery photos.");
      return;
    }
    const m = await mediaService.openGallery({cropping: false});
    if (m?.path) setGalleryImages(prev => [...prev, m.path]);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (submit.isPending) return;
    const price = parseFloat(servicePrice);
    const discounted = parseFloat(fixedPrice);
    const totalMins = (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);
    const category = categories.find((c: any) => c.name === selectedCategories[0]);
    if (!serviceTitle.trim() || !category || !(price > 0) || totalMins < 5) {
      Alert.alert("Missing details", "Please add a title, category, price and duration (min 5 minutes).");
      return;
    }
    const included = inclusions.map(s => s.trim()).filter(Boolean);
    const details = [description.trim(), additionalDetails.trim(), included.length ? `Includes: ${included.join(", ")}` : ""]
      .filter(Boolean)
      .join("\n\n");
    submit.mutate(
      {
        fields: {
          name: serviceTitle.trim(),
          categoryId: category._id ?? category.id,
          description: details,
          shortDescription: description.trim().slice(0, 140),
          price,
          discountedPrice: discounted > 0 && discounted < price ? discounted : undefined,
          durationMinMinutes: totalMins,
          durationMaxMinutes: totalMins,
          status: "PENDING_APPROVAL",
        },
        thumb: coverImage ?? undefined,
        images: galleryImages,
      },
      {onSuccess: () => setShowReviewModal(true)},
    );
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Uploaded Add Service Screen */}
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
          Add service
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom + 90, 110)},
        ]}
        keyboardShouldPersistTaps="handled">
        {/* ========================================================================= */}
        {/* 1. COVER IMAGE UPLOAD CONTAINER matching Image 1 & 2 */}
        {/* ========================================================================= */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handlePickCoverImage}
          style={styles.coverImagePlaceholderBox}>
          {coverImage ? (
            <View style={styles.coverImagePreviewWrapper}>
              <Image
                source={{uri: coverImage}}
                style={styles.coverImagePreview}
                resizeMode="cover"
              />
              <View style={styles.coverImageBadgeOverlay}>
                <Text style={styles.coverImageBadgeOverlayText}>Cover Image</Text>
              </View>
              <View style={styles.editPencilBadge}>
                <AppIcon name="edit-profile" size={14} color="#FFFFFF" />
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholderCenter}>
              <View style={styles.uploadFilePillBtn}>
                <AppIcon name="camera" size={14} color="#4B5563" style={styles.pillIcon} />
                <Text style={styles.uploadFilePillText}>Upload File</Text>
              </View>
              <Text style={styles.coverImageText}>Cover Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ========================================================================= */}
        {/* 2. SELECT CATEGORIES DROPDOWN matching Image 1 & 2 */}
        {/* ========================================================================= */}
        <View style={styles.sectionBlock}>
          <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
            Select Categories
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            style={[
              styles.dropdownSelectorBox,
              isCategoryDropdownOpen && styles.dropdownSelectorBoxOpen,
            ]}>
            <Text
              style={[
                styles.dropdownSelectorValue,
                selectedCategories.length === 0 && styles.dropdownSelectorPlaceholder,
              ]}>
              {selectedCategories.length > 0
                ? selectedCategories.join(", ")
                : "Choose categories"}
            </Text>
            <Text style={styles.dropdownChevronIcon}>
              {isCategoryDropdownOpen ? "⌃" : "⌄"}
            </Text>
          </TouchableOpacity>

          {/* Inline Multi-Select Checklist matching Image 2 */}
          {isCategoryDropdownOpen && (
            <View style={styles.categoryDropdownList}>
              {CATEGORY_OPTIONS.map(cat => {
                const isChecked = selectedCategories.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.7}
                    onPress={() => toggleCategory(cat)}
                    style={styles.categoryCheckRow}>
                    <View
                      style={[
                        styles.categoryCheckbox,
                        isChecked && styles.categoryCheckboxChecked,
                      ]}>
                      {isChecked && <Text style={styles.categoryCheckMark}>✓</Text>}
                    </View>
                    <Text
                      style={[
                        styles.categoryCheckLabel,
                        isChecked && styles.categoryCheckLabelChecked,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* 3. SERVICE DETAILS matching Image 1 */}
        {/* ========================================================================= */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              Service Details
            </Text>
            <AppIcon name="edit-profile" size={14} color="#6B7280" />
          </View>

          <View style={styles.inputCard}>
            <TextInput
              value={serviceTitle}
              onChangeText={setServiceTitle}
              placeholder="Service title"
              placeholderTextColor="#9CA3AF"
              style={styles.singleLineInput}
            />
          </View>

          <View style={[styles.inputCard, styles.multiLineInputCard]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              style={styles.multiLineInput}
            />
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 4. DURATION matching Image 1 */}
        {/* ========================================================================= */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              Duration
            </Text>
            <View style={styles.fixedBadge}>
              <Text style={styles.fixedBadgeText}>Fixed</Text>
            </View>
          </View>

          <View style={styles.durationContainer}>
            {/* Left: Clock Icon + Duration Computed Label */}
            <View style={styles.durationDisplaySide}>
              <View style={styles.durationClockCircle}>
                <AppIcon name="clock" size={18} color="#4B5563" />
              </View>
              <View style={styles.durationDisplayTexts}>
                <Text style={styles.durationSublabel}>Duration</Text>
                <Text style={styles.durationValueText}>
                  {parseInt(hours || "0", 10)}h {parseInt(minutes || "0", 10)}min
                </Text>
              </View>
            </View>

            {/* Right: Hour and Mints Inputs matching Image 1 */}
            <View style={styles.durationInputsSide}>
              <View style={styles.durationInputItem}>
                <Text style={styles.durationInputHeader}>Hour</Text>
                <View style={styles.durationSmallBox}>
                  <TextInput
                    value={hours}
                    onChangeText={setHours}
                    keyboardType="numeric"
                    maxLength={2}
                    style={styles.durationNumberInput}
                  />
                </View>
              </View>

              <View style={styles.durationInputItem}>
                <Text style={styles.durationInputHeader}>Mins</Text>
                <View style={styles.durationSmallBox}>
                  <TextInput
                    value={minutes}
                    onChangeText={setMinutes}
                    keyboardType="numeric"
                    maxLength={2}
                    style={styles.durationNumberInput}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 5. GALLERY matching Image 1 */}
        {/* ========================================================================= */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              Gallery
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddGalleryImage}
              style={styles.galleryUploadBtn}>
              <AppIcon name="camera" size={14} color="#4B5563" style={styles.pillIcon} />
              <Text style={styles.galleryUploadBtnText}>Upload File</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.galleryGrid}>
            {/* Add Plus Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddGalleryImage}
              style={styles.galleryAddBox}>
              <Text style={styles.galleryAddPlus}>+</Text>
            </TouchableOpacity>

            {/* Uploaded Gallery Thumbnails */}
            {galleryImages.map((img, index) => (
              <View key={`gallery-${index}`} style={styles.galleryThumbWrapper}>
                <Image
                  source={{uri: img}}
                  style={styles.galleryThumb}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveGalleryImage(index)}
                  style={styles.galleryRemoveBadge}>
                  <Text style={styles.galleryRemoveBadgeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 6. SERVICE PRICE matching Image 1 */}
        {/* ========================================================================= */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              Service Price
            </Text>
            <View style={styles.fixedBadge}>
              <Text style={styles.fixedBadgeText}>Fixed</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceFieldBox}>
              <Text style={styles.rupeePrefix}>₹</Text>
              <TextInput
                value={servicePrice}
                onChangeText={setServicePrice}
                placeholder="Service price"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>

            <View style={styles.priceFieldBox}>
              <Text style={styles.rupeePrefix}>₹</Text>
              <TextInput
                value={fixedPrice}
                onChangeText={setFixedPrice}
                placeholder="Offer price"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>
          </View>

          <View style={styles.adminNoteBox}>
            <AppIcon name="info" size={13} color="#6B7280" style={styles.adminNoteIcon} />
            <Text style={styles.adminNoteText}>
              {priceRange
                ? `Admin allows ±10% adjustment. Price can range from ₹${priceRange.min} to ₹${priceRange.max}.`
                : "Enter your service price. Admin allows ±10% adjustment on approval."}
            </Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 7. ADDITIONAL INFORMATION matching Image 1 */}
        {/* ========================================================================= */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              Additional Information
            </Text>
            <Text style={styles.pencilActionIcon}>✏️</Text>
          </View>

          <View style={[styles.inputCard, styles.multiLineInputCard]}>
            <TextInput
              value={additionalDetails}
              onChangeText={setAdditionalDetails}
              placeholder="Additional Details"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              style={styles.multiLineInput}
            />
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 8. WHAT'S INCLUDED matching Image 1 */}
        {/* ========================================================================= */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              What's Included
            </Text>
            <TouchableOpacity onPress={handleAddInclusion}>
              <Text style={styles.addInclusionTextBtn}>Add</Text>
            </TouchableOpacity>
          </View>

          {inclusions.map((item, index) => (
            <View key={`inc-item-${index}`} style={styles.inclusionItemRow}>
              <View style={styles.inclusionCheckCircle}>
                <AppIcon name="check" size={12} color="#059669" />
              </View>
              <TextInput
                value={item}
                onChangeText={text => handleUpdateInclusion(text, index)}
                placeholder="Enter text"
                placeholderTextColor="#9CA3AF"
                style={styles.inclusionInput}
              />
              <TouchableOpacity
                onPress={() => handleRemoveInclusion(index)}
                style={styles.trashActionBtn}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <AppIcon name="trash" size={15} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* BOTTOM ACTION BAR matching Image 1 */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.bottomActionBar,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.cancelOutlineBtn}>
          <Text style={styles.cancelOutlineBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          style={styles.addSolidBtn}>
          <Text style={styles.addSolidBtnText}>Add</Text>
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
  removeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "#114B3E",
    backgroundColor: "#FFFFFF",
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#114B3E",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  coverImagePlaceholderBox: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  uploadPlaceholderCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadFilePillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadCloudIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  uploadFilePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  coverImageText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  coverImagePreviewWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  coverImagePreview: {
    width: "100%",
    height: "100%",
  },
  coverImageBadgeOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coverImageBadgeOverlayText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  editPencilBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  editPencilBadgeIcon: {
    fontSize: 14,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  pencilActionIcon: {
    fontSize: 14,
  },
  dropdownSelectorBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownSelectorBoxOpen: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderColor: "#114B3E",
  },
  dropdownSelectorValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  dropdownSelectorPlaceholder: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
  dropdownChevronIcon: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 8,
  },
  categoryDropdownList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  categoryCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },
  categoryCheckboxChecked: {
    backgroundColor: "#114B3E",
    borderColor: "#114B3E",
  },
  categoryCheckMark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14,
  },
  categoryCheckLabel: {
    fontSize: 13.5,
    fontWeight: "500",
    color: "#4B5563",
  },
  categoryCheckLabelChecked: {
    color: "#111827",
    fontWeight: "700",
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 8,
  },
  singleLineInput: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  multiLineInputCard: {
    minHeight: 80,
  },
  multiLineInput: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    minHeight: 60,
  },
  fixedBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fixedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  durationDisplaySide: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  durationClockCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  durationClockIcon: {
    fontSize: 16,
  },
  durationDisplayTexts: {
    flex: 1,
  },
  durationSublabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  durationValueText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  durationInputsSide: {
    flexDirection: "row",
    gap: 8,
  },
  durationInputItem: {
    alignItems: "center",
  },
  durationInputHeader: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 3,
  },
  durationSmallBox: {
    width: 44,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  durationNumberInput: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    padding: 0,
    // Fill the box so Android doesn't clip the digits vertically.
    width: "100%",
    height: "100%",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  pillIcon: {marginRight: 6},
  galleryUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  galleryUploadCloud: {
    fontSize: 11,
    marginRight: 4,
  },
  galleryUploadBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  galleryAddBox: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryAddPlus: {
    fontSize: 24,
    lineHeight: 24,
    color: "#9CA3AF",
    fontWeight: "300",
  },
  galleryThumbWrapper: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  galleryThumb: {
    width: "100%",
    height: "100%",
  },
  galleryRemoveBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryRemoveBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  priceFieldBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rupeePrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  adminNoteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  adminNoteIcon: {
    fontSize: 12,
    marginRight: 6,
    marginTop: 1,
  },
  adminNoteText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#6B7280",
    flex: 1,
  },
  addInclusionTextBtn: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  inclusionItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  inclusionCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  inclusionCheckIcon: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "800",
  },
  inclusionInput: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  trashActionBtn: {
    padding: 6,
  },
  trashActionIcon: {
    fontSize: 14,
    color: "#9CA3AF",
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
  cancelOutlineBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelOutlineBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#114B3E",
  },
  addSolidBtn: {
    flex: 1,
    backgroundColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addSolidBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
