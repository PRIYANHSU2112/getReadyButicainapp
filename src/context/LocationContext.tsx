import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode} from "react";
import {PermissionsAndroid, Platform} from "react-native";
import Geolocation from "@react-native-community/geolocation";

export interface Coordinates { latitude: number; longitude: number; }

interface LocationContextType {
  currentLocation: Coordinates | null;
  setCurrentLocation: (coords: Coordinates) => void;
  isTracking: boolean;
  permissionDenied: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  refreshLocation: () => Promise<Coordinates | null>;
}

const LocationContext = createContext<LocationContextType>({
  currentLocation: null, setCurrentLocation: () => {},
  isTracking: false, permissionDenied: false,
  startTracking: () => {}, stopTracking: () => {}, refreshLocation: async () => null,
});

Geolocation.setRNConfiguration({skipPermissionRequests: false, authorizationLevel: "whenInUse", locationProvider: "auto"});

const requestPermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android") return true;
  const res = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);
  return Object.values(res).some(r => r === PermissionsAndroid.RESULTS.GRANTED);
};

export const LocationProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const watchId = useRef<number | null>(null);

  const refreshLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (!(await requestPermission())) { setPermissionDenied(true); return null; }
    setPermissionDenied(false);
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        ({coords}) => {
          const c = {latitude: coords.latitude, longitude: coords.longitude};
          setCurrentLocation(c);
          resolve(c);
        },
        () => resolve(null),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) Geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setIsTracking(false);
  }, []);

  const startTracking = useCallback(async () => {
    if (watchId.current !== null) return;
    if (!(await requestPermission())) { setPermissionDenied(true); return; }
    // distanceFilter keeps re-renders low: only update after ~25 m of movement.
    watchId.current = Geolocation.watchPosition(
      ({coords}) => setCurrentLocation({latitude: coords.latitude, longitude: coords.longitude}),
      () => undefined,
      {enableHighAccuracy: true, distanceFilter: 25, interval: 10000, fastestInterval: 5000},
    );
    setIsTracking(true);
  }, []);

  useEffect(() => stopTracking, [stopTracking]);

  const value = useMemo(
    () => ({currentLocation, setCurrentLocation, isTracking, permissionDenied, startTracking, stopTracking, refreshLocation}),
    [currentLocation, isTracking, permissionDenied, startTracking, stopTracking, refreshLocation],
  );
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => useContext(LocationContext);
