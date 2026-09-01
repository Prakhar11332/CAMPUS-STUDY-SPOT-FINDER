import { randomUUID } from "crypto";
import { readDb, mutateDb } from "./store";
import type { Spot, Rating, SpotWithStats, BuildingZone } from "./types";
import { BUILDING_ZONES } from "./constants";

export { BUILDING_ZONES };

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

// Turns raw ratings into the aggregate fields the UI renders, including
// a derived "how busy is it right now" status. Recency matters for
// busy-ness specifically (a rating from 3 hours ago says little about
// right now), so crowd status only looks at ratings from the last 2 hours;
// the other averages use the spot's full rating history since noise/wifi/
// outlets are structural properties that don't change hour to hour.
const RECENT_WINDOW_MS = 2 * 60 * 60 * 1000;

export function attachStats(spot: Spot, allRatings: Rating[]): SpotWithStats {
  const ratings = allRatings.filter((r) => r.spotId === spot.id);
  const now = Date.now();
  const recentCrowdRatings = ratings.filter(
    (r) => now - new Date(r.createdAt).getTime() <= RECENT_WINDOW_MS
  );
  const crowdSource = recentCrowdRatings.length > 0 ? recentCrowdRatings : ratings;

  const avgCrowd = average(crowdSource.map((r) => r.crowdLevel));
  let status: SpotWithStats["status"] = "UNRATED";
  if (avgCrowd !== null) {
    if (avgCrowd <= 2) status = "AVAILABLE";
    else if (avgCrowd <= 3.5) status = "FILLING UP";
    else status = "BUSY";
  }

  const lastRatedAt = ratings.length
    ? ratings
        .map((r) => r.createdAt)
        .sort()
        .reverse()[0]
    : null;

  return {
    ...spot,
    ratingCount: ratings.length,
    avgNoise: average(ratings.map((r) => r.noiseLevel)),
    avgWifi: average(ratings.map((r) => r.wifiQuality)),
    avgOutlets: average(ratings.map((r) => r.outletAccess)),
    avgCrowd,
    lastRatedAt,
    status,
  };
}

export interface SpotFilters {
  q?: string;
  building?: BuildingZone | "all";
  maxNoise?: number; // show spots with avg noise <= this
  minWifi?: number; // show spots with avg wifi >= this
  minOutlets?: number; // show spots with avg outlets >= this
  status?: SpotWithStats["status"] | "all";
  sort?: "quietest" | "best_wifi" | "most_outlets" | "least_busy" | "newest";
}

export async function listSpots(filters: SpotFilters = {}): Promise<SpotWithStats[]> {
  const db = await readDb();
  let spots = db.spots.map((s) => attachStats(s, db.ratings));

  if (filters.q) {
    const q = filters.q.toLowerCase();
    spots = spots.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.floorOrArea.toLowerCase().includes(q)
    );
  }
  if (filters.building && filters.building !== "all") {
    spots = spots.filter((s) => s.building === filters.building);
  }
  if (filters.maxNoise !== undefined) {
    spots = spots.filter((s) => s.avgNoise === null || s.avgNoise <= filters.maxNoise!);
  }
  if (filters.minWifi !== undefined) {
    spots = spots.filter((s) => s.avgWifi === null || s.avgWifi >= filters.minWifi!);
  }
  if (filters.minOutlets !== undefined) {
    spots = spots.filter((s) => s.avgOutlets === null || s.avgOutlets >= filters.minOutlets!);
  }
  if (filters.status && filters.status !== "all") {
    spots = spots.filter((s) => s.status === filters.status);
  }

  switch (filters.sort) {
    case "quietest":
      spots.sort((a, b) => (a.avgNoise ?? 99) - (b.avgNoise ?? 99));
      break;
    case "best_wifi":
      spots.sort((a, b) => (b.avgWifi ?? -1) - (a.avgWifi ?? -1));
      break;
    case "most_outlets":
      spots.sort((a, b) => (b.avgOutlets ?? -1) - (a.avgOutlets ?? -1));
      break;
    case "least_busy":
      spots.sort((a, b) => (a.avgCrowd ?? -1) - (b.avgCrowd ?? -1));
      break;
    case "newest":
    default:
      spots.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  return spots;
}

export async function getSpotById(id: string): Promise<SpotWithStats | null> {
  const db = await readDb();
  const spot = db.spots.find((s) => s.id === id);
  if (!spot) return null;
  return attachStats(spot, db.ratings);
}

export async function getRatingsForSpot(id: string): Promise<Rating[]> {
  const db = await readDb();
  return db.ratings
    .filter((r) => r.spotId === id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createSpot(input: {
  name: string;
  building: BuildingZone;
  floorOrArea: string;
  description: string;
  capacity: number;
  photos: string[];
}): Promise<Spot> {
  return mutateDb((db) => {
    const spot: Spot = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    db.spots.push(spot);
    return spot;
  });
}

export async function createRating(input: {
  spotId: string;
  studentName: string;
  noiseLevel: number;
  wifiQuality: number;
  outletAccess: number;
  crowdLevel: number;
  comment: string;
  photo: string | null;
}): Promise<Rating> {
  return mutateDb((db) => {
    if (!db.spots.some((s) => s.id === input.spotId)) {
      throw new Error("SPOT_NOT_FOUND");
    }
    const rating: Rating = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    db.ratings.push(rating);
    return rating;
  });
}

