// Core domain types for the Study Spot Finder.
// Scales below are all 1–5 unless noted, so the UI can render them as
// consistent 5-segment gauges ("readouts") across the whole app.

export type BuildingZone =
  | "Central Library"
  | "Amrita Nagar Block"
  | "CSE Block"
  | "Cafeteria Wing"
  | "Open Air Theatre Lawns"
  | "Hostel Common Room";

export interface Spot {
  id: string;
  name: string;
  building: BuildingZone;
  floorOrArea: string;
  description: string;
  capacity: number;
  photos: string[]; // relative paths under /uploads
  createdAt: string; // ISO timestamp
}

export interface Rating {
  id: string;
  spotId: string;
  studentName: string;
  noiseLevel: number; // 1 = silent ... 5 = very loud
  wifiQuality: number; // 1 = unusable ... 5 = excellent
  outletAccess: number; // 1 = none free ... 5 = plenty free
  crowdLevel: number; // 1 = empty ... 5 = packed
  comment: string;
  photo: string | null; // relative path under /uploads
  createdAt: string; // ISO timestamp
}

// A Spot enriched with aggregate stats derived from its Ratings.
// This is what list/detail views actually render.
export interface SpotWithStats extends Spot {
  ratingCount: number;
  avgNoise: number | null;
  avgWifi: number | null;
  avgOutlets: number | null;
  avgCrowd: number | null;
  lastRatedAt: string | null;
  status: "AVAILABLE" | "FILLING UP" | "BUSY" | "UNRATED";
}

export interface DbShape {
  spots: Spot[];
  ratings: Rating[];
}
