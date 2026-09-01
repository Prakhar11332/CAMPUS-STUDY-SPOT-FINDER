import type { BuildingZone, Spot } from "@/lib/db/types";

export interface Coordinates {
  lat: number;
  lng: number;
}

/** Approximate center of campus — used when geolocation is denied. */
export const CAMPUS_CENTER: Coordinates = { lat: 10.8994, lng: 76.9038 };

const BUILDING_COORDS: Record<BuildingZone, Coordinates> = {
  "Central Library": { lat: 10.9002, lng: 76.903 },
  "Amrita Nagar Block": { lat: 10.8988, lng: 76.9052 },
  "CSE Block": { lat: 10.8996, lng: 76.9045 },
  "Cafeteria Wing": { lat: 10.899, lng: 76.9028 },
  "Open Air Theatre Lawns": { lat: 10.8982, lng: 76.9035 },
  "Hostel Common Room": { lat: 10.9008, lng: 76.905 },
};

function hashOffset(id: string): { lat: number; lng: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return {
    lat: ((hash % 100) - 50) * 0.00004,
    lng: (((hash >> 8) % 100) - 50) * 0.00004,
  };
}

export function getSpotCoordinates(spot: Pick<Spot, "id" | "building">): Coordinates {
  const base = BUILDING_COORDS[spot.building];
  const offset = hashOffset(spot.id);
  return { lat: base.lat + offset.lat, lng: base.lng + offset.lng };
}

const EARTH_RADIUS_KM = 6371;

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Average campus walking speed ~5 km/h */
export function walkMinutes(distanceKm: number): number {
  return Math.max(1, Math.round((distanceKm / 5) * 60));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export async function fetchWalkingRoute(
  from: Coordinates,
  to: Coordinates
): Promise<[number, number][] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/walking/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (!coords) return null;
    return coords.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
  } catch {
    return null;
  }
}
