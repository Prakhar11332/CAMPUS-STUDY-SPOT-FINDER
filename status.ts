import type { SpotWithStats } from "@/lib/db/types";

export type QuietStatus = "Quiet" | "Moderate" | "Busy" | "Unknown";

export function getQuietStatus(spot: SpotWithStats): QuietStatus {
  if (spot.status === "AVAILABLE") return "Quiet";
  if (spot.status === "FILLING UP") return "Moderate";
  if (spot.status === "BUSY") return "Busy";
  if (spot.avgNoise !== null) {
    if (spot.avgNoise <= 2) return "Quiet";
    if (spot.avgNoise <= 3.5) return "Moderate";
    return "Busy";
  }
  return "Unknown";
}

export const STATUS_COLORS: Record<QuietStatus, string> = {
  Quiet: "#34d399",
  Moderate: "#fbbf24",
  Busy: "#f87171",
  Unknown: "#94a3b8",
};
