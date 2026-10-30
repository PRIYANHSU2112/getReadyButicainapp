import React, {memo, useEffect, useMemo, useRef} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {useLocation} from "../../context/LocationContext";
import {DEFAULT_REGION, GOOGLE_MAP_ID} from "../../config/maps";

interface WorkingRadiusMapProps {
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  minKm?: number;
  maxKm?: number;
}

const WorkingRadiusMapBase: React.FC<WorkingRadiusMapProps> = ({
  radiusKm,
  onRadiusChange,
  minKm = 1,
  maxKm = 15,
}) => {
  const {currentLocation, refreshLocation} = useLocation();
  const mapRef = useRef<MapView>(null);
  const trackWidth = useRef(280);

  useEffect(() => { if (!currentLocation) refreshLocation(); }, [currentLocation, refreshLocation]);

  const center = currentLocation ?? DEFAULT_REGION;

  // Fit the whole radius circle in view whenever center or radius changes.
  useEffect(() => {
    const delta = (radiusKm / 111) * 2.6; // ~111 km per degree latitude, plus padding
    mapRef.current?.animateToRegion(
      {latitude: center.latitude, longitude: center.longitude, latitudeDelta: delta, longitudeDelta: delta},
      300,
    );
  }, [center.latitude, center.longitude, radiusKm]);

  const percentage = Math.min(
    Math.max(((radiusKm - minKm) / (maxKm - minKm)) * 100, 0),
    100
  );

  const handleSliderTouch = (evt: any) => {
    const {locationX} = evt.nativeEvent;
    const w = trackWidth.current;
    const clamped = Math.min(Math.max(locationX, 0), w);
    onRadiusChange(Math.round(minKm + (clamped / w) * (maxKm - minKm)));
  };

  const coord = useMemo(() => ({latitude: center.latitude, longitude: center.longitude}), [center.latitude, center.longitude]);

  return (
    <View style={styles.container}>
      <View style={styles.mapCard}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          {...(GOOGLE_MAP_ID ? {googleMapId: GOOGLE_MAP_ID} : {})}
          style={styles.mapBackground}
          initialRegion={{...DEFAULT_REGION, ...coord}}
          showsUserLocation
          showsMyLocationButton={false}
          toolbarEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}>
          <Circle
            center={coord}
            radius={radiusKm * 1000}
            strokeWidth={2}
            strokeColor="rgba(17, 75, 62, 0.6)"
            fillColor="rgba(17, 75, 62, 0.12)"
          />
          <Marker coordinate={coord} pinColor="#114B3E" />
        </MapView>

        {/* Floating Radius Badge in Dark Teal */}
        <View style={styles.radiusBadge}>
          <Text style={styles.radiusBadgeText}>{radiusKm} km</Text>
        </View>

        {/* Interactive Slider Area */}
        <View style={styles.sliderSection}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleSliderTouch}
            onLayout={e => { trackWidth.current = e.nativeEvent.layout.width || 280; }}
            style={styles.sliderTrackTouch}>
            <View style={styles.sliderTrackBackground}>
              <View
                style={[
                  styles.sliderTrackFill,
                  {width: `${percentage}%`},
                ]}
              />
            </View>

            {/* Slider Thumb */}
            <View
              style={[
                styles.sliderThumb,
                {left: `${Math.min(Math.max(percentage - 4, 0), 92)}%`},
              ]}
            />
          </TouchableOpacity>

          {/* Min & Max Labels */}
          <View style={styles.sliderLabelsRow}>
            <Text style={styles.sliderLabelText}>{minKm} km</Text>
            <Text style={styles.sliderLabelText}>{maxKm} km</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export const WorkingRadiusMap = memo(WorkingRadiusMapBase);

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  mapCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  mapBackground: {
    height: 150,
    backgroundColor: "#EBF3EE",
  },
  radiusBadge: {
    position: "absolute",
    top: 98,
    right: 14,
    backgroundColor: "#114B3E", // Deep emerald
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  radiusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  sliderSection: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  sliderTrackTouch: {
    height: 28,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrackBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C5E6D7",
    overflow: "hidden",
  },
  sliderTrackFill: {
    height: "100%",
    backgroundColor: "#114B3E",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#114B3E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  sliderLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  sliderLabelText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
});
