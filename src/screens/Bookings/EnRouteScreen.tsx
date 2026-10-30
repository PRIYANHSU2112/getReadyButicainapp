import React, {useEffect, useMemo, useRef} from "react";
import {ActivityIndicator, Linking, Platform, StyleSheet, Text, View} from "react-native";
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from "react-native-maps";
import {useTheme} from "../../theme";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {ScreenContainer, Header, Button, Card, toast} from "../../components/common";
import {useBookingDetail} from "../../hooks/queries";
import {useLocation} from "../../context/LocationContext";
import {useBooking} from "../../context/BookingContext";
import {DEFAULT_REGION, GOOGLE_MAP_ID} from "../../config/maps";
import {distanceKm} from "../../utils/geo";

type Props = NativeStackScreenProps<RootStackParamList, "EnRoute">;

const AVG_CITY_SPEED_KMPH = 22;

export const EnRouteScreen: React.FC<Props> = ({route, navigation}) => {
  const {bookingId} = route.params;
  const {theme} = useTheme();
  const {data: booking, isLoading} = useBookingDetail(bookingId);
  const {currentLocation, startTracking, stopTracking, permissionDenied} = useLocation();
  const {updateBookingStatus} = useBooking();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    startTracking();
    updateBookingStatus(bookingId, "en_route");
    return stopTracking;
  }, [bookingId, startTracking, stopTracking, updateBookingStatus]);

  useEffect(() => {
    if (permissionDenied) toast.warning("Enable location access to share live navigation");
  }, [permissionDenied]);

  const dest = useMemo(() => {
    const a = booking?.address;
    return a && (a.latitude || a.longitude) ? {latitude: a.latitude, longitude: a.longitude} : null;
  }, [booking?.address]);

  const eta = useMemo(() => {
    if (!dest || !currentLocation) return null;
    const km = distanceKm(currentLocation, dest);
    return {km: km.toFixed(1), mins: Math.max(1, Math.round((km / AVG_CITY_SPEED_KMPH) * 60))};
  }, [currentLocation, dest]);

  // Keep both pins in view as the beautician moves.
  useEffect(() => {
    const pts = [currentLocation, dest].filter(Boolean) as {latitude: number; longitude: number}[];
    if (pts.length) {
      mapRef.current?.fitToCoordinates(pts, {edgePadding: {top: 60, right: 60, bottom: 60, left: 60}, animated: true});
    }
  }, [currentLocation, dest]);

  const openDirections = () => {
    if (!dest) return;
    const q = `${dest.latitude},${dest.longitude}`;
    const url = Platform.select({
      android: `google.navigation:q=${q}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`,
    });
    Linking.openURL(url!).catch(() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${q}`));
  };

  const callClient = () => {
    if (booking?.customerPhone) Linking.openURL(`tel:${booking.customerPhone}`);
  };

  return (
    <ScreenContainer>
      <Header title="En Route to Client" showBack onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={[styles.mapWrap, {backgroundColor: theme.colors.surfaceVariant}]}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            {...(GOOGLE_MAP_ID ? {googleMapId: GOOGLE_MAP_ID} : {})}
            style={StyleSheet.absoluteFill}
            initialRegion={{...DEFAULT_REGION, ...(dest ?? currentLocation ?? {})}}
            showsUserLocation
            showsMyLocationButton
            toolbarEnabled={false}>
            {dest && <Marker coordinate={dest} title={booking?.customerName} description={booking?.address.fullAddress} pinColor="#114B3E" />}
            {dest && currentLocation && (
              <Polyline coordinates={[currentLocation, dest]} strokeColor={theme.colors.primary} strokeWidth={3} lineDashPattern={[8, 6]} />
            )}
          </MapView>
          {eta && (
            <View style={[styles.etaPill, {backgroundColor: theme.colors.emerald[900]}]}>
              <Text style={styles.etaText}>{eta.mins} min • {eta.km} km</Text>
            </View>
          )}
        </View>

        <Card style={styles.card}>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <Text style={[theme.typography.h4, {color: theme.colors.textPrimary}]}>{booking?.customerName ?? "Client"}</Text>
              <Text style={[theme.typography.body2, {color: theme.colors.textSecondary, marginTop: 4}]}>
                {booking?.address.fullAddress || "Address unavailable"}
              </Text>
              <View style={styles.actions}>
                <Button title="Navigate" onPress={openDirections} disabled={!dest} style={styles.actionBtn} />
                <Button title="Call" variant="outline" onPress={callClient} disabled={!booking?.customerPhone} style={styles.actionBtn} />
              </View>
            </>
          )}
        </Card>

        <Button
          title="I Have Reached Location"
          onPress={() => {
            updateBookingStatus(bookingId, "reached");
            navigation.navigate("StartOtp", {bookingId});
          }}
          size="large"
          style={styles.btn}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {flex: 1, padding: 16, justifyContent: "space-between"},
  mapWrap: {flex: 1, borderRadius: 16, overflow: "hidden"},
  etaPill: {position: "absolute", top: 12, alignSelf: "center", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16},
  etaText: {color: "#FFFFFF", fontWeight: "700", fontSize: 13},
  card: {marginVertical: 16},
  actions: {flexDirection: "row", gap: 10, marginTop: 12},
  actionBtn: {flex: 1},
  btn: {marginBottom: 16},
});
