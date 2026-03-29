import type { City } from "@/lib/types/city";

const R = 6371;

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

/** Great-circle distance in km between two lat/lng points. */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(Math.min(1, a)));
}

export function distanceToCity(
  userLat: number,
  userLng: number,
  city: City,
): number {
  return distanceKm(userLat, userLng, city.latitude, city.longitude);
}
