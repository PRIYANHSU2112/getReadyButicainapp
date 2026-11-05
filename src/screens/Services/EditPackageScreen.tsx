import React, {useMemo, useState} from "react";
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
  ActivityIndicator,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {IMAGES} from "../../constants/images";
import {PackageItem} from "../../types";
import {usePackage} from "../../hooks/queries";
import {ServiceUnderReviewModal} from "../../components/common";

type Props = NativeStackScreenProps<RootStackParamList, "EditPackage">;

export const EditPackageScreen: React.FC<Props> = props => {
  const {pkg, isLoading} = usePackage(props.route.params?.packageId);
  if (!pkg) {
    return (
      <View style={[styles.screenContainer, {justifyContent: "center", alignItems: "center"}]}>
        {isLoading ? <ActivityIndicator color="#114B3E" /> : <Text>Package not found</Text>}
      </View>
    );
  }
  return <EditPackageForm {...props} pkg={pkg} />;
};

// Form is mounted only once the package is loaded, so initial state is real data.
const EditPackageForm: React.FC<Props & {pkg: PackageItem}> = ({navigation, pkg}) => {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState(pkg.title);
  const [description, setDescription] = useState(pkg.description ?? "");

  const [inclusions, setInclusions] = useState<string[]>(
    pkg.inclusionsList?.length ? pkg.inclusionsList : [""]
  );

  const [additionalInfo, setAdditionalInfo] = useState("");

  const [partnerPrice, setPartnerPrice] = useState(String(pkg.discountPrice ?? ""));
  const [originalPrice, setOriginalPrice] = useState(String(pkg.originalPrice ?? ""));
  const [duration] = useState(pkg.duration ?? "");
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Live ±10% band around the fixed price, not a hardcoded example.
  const priceBand = useMemo(() => {
    const fixed = parseFloat(originalPrice);
    if (!(fixed > 0)) return null;
    const fmt = (n: number) => n.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return {min: fmt(fixed * 0.9), max: fmt(fixed * 1.1)};
  }, [originalPrice]);

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
      Alert.alert("Notice", "Package must contain at least one inclusion.");
      return;
    }
    setInclusions(inclusions.filter((_, i) => i !== index));
  };

  const handleRemovePackage = () => {
    Alert.alert(
      "Remove Package",
      "Are you sure you want to remove this package from your active listings?",
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Image 4 */}
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
          Edit package
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleRemovePackage}
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
        {/* Cover Image with edit icon matching Image 4 */}
        <View style={styles.coverImageContainer}>
          <Image
            source={IMAGES.SERVICE_HERO_BRIDAL}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverImageBadge}>
            <Text style={styles.coverImageBadgeText}>Cover Image</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Alert.alert("Upload Photo", "Choose a new cover image from gallery.")}
            style={styles.editPencilBtn}>
            <Text style={styles.editPencilText}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Service Details matching Image 4 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              Service Details
            </Text>
            <Text style={styles.headerPencilIcon}>✏️</Text>
          </View>

          <View style={styles.inputBoxContainer}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
              placeholder="Package Title"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={[styles.inputBoxContainer, styles.descBoxContainer]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.descInput}
              placeholder="Package Description"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* What's Included matching Image 4 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              What's Included
            </Text>
            <TouchableOpacity onPress={handleAddInclusion}>
              <Text style={styles.addTextBtn}>Add</Text>
            </TouchableOpacity>
          </View>

          {inclusions.map((item, index) => (
            <View key={`inc-item-${index}`} style={styles.inclusionInputRow}>
              <Text style={styles.inclusionCheckIcon}>✓</Text>
              <TextInput
                value={item}
                onChangeText={text => handleUpdateInclusion(text, index)}
                placeholder="Enter service inclusion..."
                placeholderTextColor="#9CA3AF"
                style={styles.inclusionInput}
              />
              <TouchableOpacity
                onPress={() => handleRemoveInclusion(index)}
                style={styles.trashBtn}>
                <Text style={styles.trashIcon}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Additional Information matching Image 4 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              Additional Information
            </Text>
            <Text style={styles.headerPencilIcon}>✏️</Text>
          </View>

          <View style={[styles.inputBoxContainer, styles.descBoxContainer]}>
            <TextInput
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              multiline
              style={styles.descInput}
              placeholder="Additional terms or details..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Duration matching Image 4 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              Duration
            </Text>
            <View style={styles.fixedBadge}>
              <Text style={styles.fixedBadgeText}>Fixed</Text>
            </View>
          </View>

          <View style={styles.durationCard}>
            <Text style={styles.durationClockIcon}>⏱</Text>
            <View style={styles.durationTextGroup}>
              <Text style={styles.durationSublabel}>Duration</Text>
              <Text style={styles.durationValue}>{duration}</Text>
            </View>
          </View>
        </View>

        {/* Service Price matching Image 4 */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text maxFontSizeMultiplier={1.3} style={styles.sectionLabel}>
              Service Price
            </Text>
            <View style={styles.fixedBadge}>
              <Text style={styles.fixedBadgeText}>Fixed</Text>
            </View>
          </View>

          <View style={styles.priceInputsRow}>
            <View style={styles.priceInputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                value={partnerPrice}
                onChangeText={setPartnerPrice}
                keyboardType="numeric"
                style={styles.priceInputField}
              />
            </View>

            <View style={styles.priceInputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                value={originalPrice}
                onChangeText={setOriginalPrice}
                keyboardType="numeric"
                style={styles.priceInputField}
              />
            </View>
          </View>

          {priceBand && (
            <View style={styles.infoNoteBox}>
              <Text style={styles.infoNoteIcon}>ℹ️</Text>
              <Text style={styles.infoNoteText}>
                Admin allows ±10% adjustment. Price can range from ₹{priceBand.min} to ₹
                {priceBand.max} based on your expertise level.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar matching Image 4 */}
      <View
        style={[
          styles.bottomActionBar,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.outlineCancelBtn}>
          <Text style={styles.outlineCancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowReviewModal(true)}
          style={styles.filledSendBtn}>
          <Text style={styles.filledSendBtnText}>Send Request</Text>
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
  coverImageContainer: {
    width: "100%",
    height: 190,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F3F4F6",
    marginBottom: 20,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverImageBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coverImageBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  editPencilBtn: {
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
  editPencilText: {
    fontSize: 14,
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  headerPencilIcon: {
    fontSize: 13,
  },
  addTextBtn: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  inputBoxContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  descBoxContainer: {
    minHeight: 80,
  },
  titleInput: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  descInput: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  inclusionInputRow: {
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
  inclusionCheckIcon: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "800",
    marginRight: 8,
  },
  inclusionInput: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  trashBtn: {
    padding: 6,
  },
  trashIcon: {
    fontSize: 14,
    color: "#9CA3AF",
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
  durationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  durationClockIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  durationTextGroup: {
    flex: 1,
  },
  durationSublabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  durationValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  priceInputsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  priceInputBox: {
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
  currencyPrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    marginRight: 4,
  },
  priceInputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  infoNoteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  infoNoteIcon: {
    fontSize: 13,
    marginRight: 6,
    marginTop: 1,
  },
  infoNoteText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#6B7280",
    flex: 1,
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
  outlineCancelBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineCancelBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#114B3E",
  },
  filledSendBtn: {
    flex: 1,
    backgroundColor: "#114B3E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filledSendBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
