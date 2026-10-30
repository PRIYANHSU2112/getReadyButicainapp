import React, {useState, useCallback} from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {ScreenContainer, Header, toast} from "../../components/common";
import {useAuth} from "../../context/AuthContext";
import {useLocation} from "../../context/LocationContext";
import {useSaveAddress} from "../../hooks/queries";

export const PrimaryAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {partner, updatePartner} = useAuth();
  const {currentLocation, refreshLocation} = useLocation();
  const saveAddress = useSaveAddress();

  const [addressLine1, setAddressLine1] = useState(partner?.addressLine1 ?? "");
  const [city, setCity] = useState(partner?.city ?? "");
  const [stateName, setStateName] = useState(partner?.state ?? "");
  const [pincode, setPincode] = useState(partner?.pincode ?? "");
  const [radiusKm, setRadiusKm] = useState(partner?.workingRadiusKm ?? 8);

  const handleUseCurrent = useCallback(async () => {
    const c = await refreshLocation();
    if (c) toast.success("Location detected. Please confirm your address details.");
    else Alert.alert("Location unavailable", "Please enable location access in Settings.");
  }, [refreshLocation]);

  const handleSave = useCallback(() => {
    if (saveAddress.isPending) return;
    const pin = pincode.replace(/\s/g, "");
    if (!addressLine1.trim() || !city.trim() || !stateName.trim() || !/^\d{6}$/.test(pin)) {
      Alert.alert("Invalid address", "Please enter address, state, city and a valid 6-digit pincode.");
      return;
    }
    saveAddress.mutate(
      {
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pin,
        ...(currentLocation
          ? {location: {type: "Point" as const, coordinates: [currentLocation.longitude, currentLocation.latitude] as [number, number]}}
          : {}),
      },
      {
        onSuccess: () => {
          updatePartner({addressLine1, city, state: stateName.trim(), pincode: pin, workingRadiusKm: radiusKm});
          toast.success("Address saved");
          navigation.goBack();
        },
      },
    );
  }, [saveAddress, addressLine1, city, stateName, pincode, radiusKm, currentLocation, updatePartner, navigation]);

  return (
    <ScreenContainer scrollable={false}>
      <Header
        title="Profile Creation"
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
        {/* PRIMARY ADDRESS & USE CURRENT HEADER */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Primary Address</Text>
          <TouchableOpacity
            style={styles.useCurrentRow}
            activeOpacity={0.7}
            onPress={handleUseCurrent}
          >
            <Text style={styles.gpsIcon}>🎯</Text>
            <Text style={styles.useCurrentText}>Use Current</Text>
          </TouchableOpacity>
        </View>

        {/* ADDRESS LINE 1 */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Address Line 1</Text>
          <TextInput
            style={styles.textInput}
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Flat, House no., Building"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* STATE */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>State</Text>
          <TextInput
            style={styles.textInput}
            value={stateName}
            onChangeText={setStateName}
            placeholder="e.g. Madhya Pradesh"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* CITY & PINCODE ROW */}
        <View style={styles.twoColRow}>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>City</Text>
            <TextInput
              style={styles.textInput}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Mumbai"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Pincode</Text>
            <TextInput
              style={styles.textInput}
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
              placeholder="123 456"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* WORKING RADIUS SECTION */}
        <Text style={[styles.sectionTitle, {marginTop: 18}]}>
          Working Radius
        </Text>
        <Text style={styles.sectionSub}>
          Set the distance you're willing to travel for clients.
        </Text>

        {/* MAP PREVIEW CONTAINER */}
        <View style={styles.mapCard}>
          <View style={styles.mapBackgroundPlaceholder}>
            <Text style={styles.mapGridIcon}>🗺️</Text>
            <View style={styles.mapCenterPin}>
              <Text style={styles.pinIcon}>📍</Text>
            </View>
            <View style={styles.radiusPillBadge}>
              <Text style={styles.radiusBadgeText}>{radiusKm} km</Text>
            </View>
          </View>

          {/* SLIDER CONTROLS */}
          <View style={styles.sliderControls}>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFilled,
                  {width: `${((radiusKm - 1) / 14) * 100}%`},
                ]}
              />
              <View
                style={[
                  styles.sliderThumb,
                  {left: `${((radiusKm - 1) / 14) * 100}%`},
                ]}
              />
            </View>
            <View style={styles.sliderLimitsRow}>
              <TouchableOpacity onPress={() => setRadiusKm(1)}>
                <Text style={styles.sliderLimitText}>1 km</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRadiusKm(8)}>
                <Text style={styles.sliderMidText}>8 km (Optimal)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRadiusKm(15)}>
                <Text style={styles.sliderLimitText}>15 km</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CANCEL & SAVE BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 12,
  },
  useCurrentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  gpsIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  useCurrentText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#114B3E",
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: "#0F172A",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  col: {
    flex: 1,
  },
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
  },
  mapBackgroundPlaceholder: {
    height: 190,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  mapGridIcon: {
    fontSize: 60,
    opacity: 0.15,
  },
  mapCenterPin: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pinIcon: {
    fontSize: 32,
  },
  radiusPillBadge: {
    position: "absolute",
    bottom: 12,
    right: 14,
    backgroundColor: "#0F172A",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  radiusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  sliderControls: {
    padding: 16,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CCFBF1",
    position: "relative",
    justifyContent: "center",
    marginBottom: 6,
  },
  sliderFilled: {
    position: "absolute",
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#114B3E",
  },
  sliderThumb: {
    position: "absolute",
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#114B3E",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 3,
  },
  sliderLimitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderLimitText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  sliderMidText: {
    fontSize: 11,
    color: "#114B3E",
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#114B3E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#114B3E",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#114B3E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
