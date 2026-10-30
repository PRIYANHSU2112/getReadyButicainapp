export interface LatLng { latitude: number; longitude: number; }

// Great-circle (haversine) distance in km.
export const distanceKm = (a: LatLng, b: LatLng) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const hasCoords = (c?: Partial<LatLng> | null): boolean => !!c && !!(c.latitude || c.longitude);
