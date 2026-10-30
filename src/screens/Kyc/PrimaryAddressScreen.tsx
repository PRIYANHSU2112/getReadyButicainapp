import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {KycStackParamList} from "../../navigation/types";
import {useAuth} from "../../context/AuthContext";
import {
  OnboardingHeader,
  WorkingRadiusMap,
  PreferredHoursCard,
} from "../../components/onboarding";

import {useLocation} from "../../context/LocationContext";
import {useSaveAddress} from "../../hooks/queries";
import {toast} from "../../components/common/Toast";

type Props = NativeStackScreenProps<KycStackParamList, "PrimaryAddress">;

export const PrimaryAddressScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {partner, updatePartner} = useAuth();

  // Address State
  const {refreshLocation, currentLocation} = useLocation();
  const saveAddress = useSaveAddress();
  const [addressLine1, setAddressLine1] = useState(partner?.addressLine1 || "");
  const [city, setCity] = useState(partner?.city || "");
  const [stateName, setStateName] = useState(partner?.state || "");
  const [pincode, setPincode] = useState(partner?.pincode || "");
  const [radiusKm, setRadiusKm] = useState<number>(
    partner?.workingRadiusKm || 8
  );
  const [startTime, setStartTime] = useState(
    partner?.preferredHours?.start || "09:00 AM"
  );
  const [endTime, setEndTime] = useState(
    partner?.preferredHours?.end || "06:00 PM"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Centers the working-radius map on the real GPS position.
  const handleUseCurrentLocation = async () => {
    const coords = await refreshLocation();
    if (coords) toast.success("Location detected — map updated. Please confirm your address below.");
    else Alert.alert("Location unavailable", "Please enable location access in Settings and try again.");
  };

  const handleSaveAndContinue = () => {
    if (saveAddress.isPending) return;
    const newErrors: Record<string, string> = {};
    if (!addressLine1.trim()) newErrors.addressLine1 = "Please enter your address";
    if (!city.trim()) newErrors.city = "Please enter city";
    if (!stateName.trim()) newErrors.state = "Please enter state";
    if (!/^\d{6}$/.test(pincode.replace(/\s/g, ""))) newErrors.pincode = "Please enter a valid 6-digit pincode";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    saveAddress.mutate(
      {
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.replace(/\s/g, ""),
        ...(currentLocation
          ? {location: {type: "Point" as const, coordinates: [currentLocation.longitude, currentLocation.latitude] as [number, number]}}
          : {}),
      },
      {
        onSuccess: () => {
          updatePartner({addressLine1, city, state: stateName.trim(), pincode, workingRadiusKm: radiusKm, preferredHours: {start: startTime, end: endTime}});
          navigation.navigate("IdUpload");
        },
      },
    );
  };

  return (
    <View style={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}>
        {/* Onboarding Header with Step 2 of 7 */}
        <OnboardingHeader
          title="Profile Creation"
          stepNumber={2}
          totalSteps={7}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: Math.max(insets.bottom + 20, 32)},
          ]}
          keyboardShouldPersistTaps="handled">
          {/* Section 1: Primary Address */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Primary Address</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleUseCurrentLocation}
              style={styles.useCurrentBtn}>
              <Text style={styles.useCurrentIcon}>🎯</Text>
              <Text style={styles.useCurrentText}>Use Current</Text>
            </TouchableOpacity>
          </View>

          {/* Address Line 1 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address Line 1</Text>
            <TextInput
              value={addressLine1}
              onChangeText={t => {
                setAddressLine1(t);
                if (errors.addressLine1) setErrors(prev => ({...prev, addressLine1: ""}));
              }}
              placeholder="Flat, House no., Building"
              placeholderTextColor="#9CA3AF"
              style={[
                styles.textInput,
                Boolean(errors.addressLine1) && styles.inputErrorBorder,
              ]}
            />
            {errors.addressLine1 ? (
              <Text style={styles.errorText}>{errors.addressLine1}</Text>
            ) : null}
          </View>

          {/* State */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>State</Text>
            <TextInput
              value={stateName}
              onChangeText={t => {
                setStateName(t);
                if (errors.state) setErrors(prev => ({...prev, state: ""}));
              }}
              placeholder="e.g. Madhya Pradesh"
              placeholderTextColor="#9CA3AF"
              style={[styles.textInput, Boolean(errors.state) && styles.inputErrorBorder]}
            />
            {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
          </View>

          {/* City and Pincode Horizontal Row */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                value={city}
                onChangeText={t => {
                  setCity(t);
                  if (errors.city) setErrors(prev => ({...prev, city: ""}));
                }}
                placeholder="e.g. London"
                placeholderTextColor="#9CA3AF"
                style={[
                  styles.textInput,
                  Boolean(errors.city) && styles.inputErrorBorder,
                ]}
              />
              {errors.city ? (
                <Text style={styles.errorText}>{errors.city}</Text>
              ) : null}
            </View>

            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput
                value={pincode}
                onChangeText={t => {
                  setPincode(t);
                  if (errors.pincode) setErrors(prev => ({...prev, pincode: ""}));
                }}
                placeholder="123 456"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={7}
                style={[
                  styles.textInput,
                  Boolean(errors.pincode) && styles.inputErrorBorder,
                ]}
              />
              {errors.pincode ? (
                <Text style={styles.errorText}>{errors.pincode}</Text>
              ) : null}
            </View>
          </View>

          {/* Section 2: Working Radius */}
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionTitle}>Working Radius</Text>
            <Text style={styles.sectionSubtitle}>
              Set the distance you're willing to travel for clients.
            </Text>
          </View>

          {/* Interactive Working Radius Map Slider */}
          <WorkingRadiusMap
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
            minKm={1}
            maxKm={15}
          />

          {/* Section 3: Preferred Hours */}
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionTitle}>Preferred Hours</Text>
            <Text style={styles.sectionSubtitle}>
              Clients will only be able to book you during these times.
            </Text>
          </View>

          {/* Preferred Hours Selector Card */}
          <PreferredHoursCard
            startTime={startTime}
            endTime={endTime}
            onTimeChange={(start, end) => {
              setStartTime(start);
              setEndTime(end);
            }}
          />

          {/* Action Buttons */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSaveAndContinue}
              accessibilityRole="button"
              accessibilityLabel="Save and Continue"
              style={styles.saveContinueBtn}>
              <Text style={styles.saveContinueText}>Save and Continue →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 17,
  },
  sectionTitleBlock: {
    marginTop: 18,
    marginBottom: 6,
  },
  useCurrentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  useCurrentIcon: {
    fontSize: 14,
  },
  useCurrentText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#114B3E", // Deep emerald
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1F2937",
  },
  inputErrorBorder: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  bottomActions: {
    marginTop: 24,
    alignItems: "center",
  },
  saveContinueBtn: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#114B3E", // Deep emerald
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveContinueText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  backBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  backBtnText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#4B5563",
  },
});
