import { RIDE_TYPES, type RideType } from "@/types";

/**
 * Deterministic pseudo-distance from the pickup/destination strings so the
 * demo behaves consistently without a maps API. Swap with a real distance
 * matrix call in production.
 */
export function estimateDistanceKm(pickup: string, destination: string): number {
  const text = `${pickup.trim().toLowerCase()}|${destination.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return Math.round((2 + (hash % 180) / 10) * 10) / 10; // 2.0 - 19.9 km
}

export function calculateFare(rideType: RideType, distanceKm: number): number {
  const cfg = RIDE_TYPES.find((t) => t.id === rideType) ?? RIDE_TYPES[1];
  return Math.round(cfg.baseFare + cfg.perKm * distanceKm);
}
