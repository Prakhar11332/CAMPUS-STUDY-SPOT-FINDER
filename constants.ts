import type { BuildingZone } from "./types";

// Lives in its own file (separate from repository.ts) so client components
// can import it without pulling in the fs-based store.
export const BUILDING_ZONES: BuildingZone[] = [
  "Central Library",
  "Amrita Nagar Block",
  "CSE Block",
  "Cafeteria Wing",
  "Open Air Theatre Lawns",
  "Hostel Common Room",
];
