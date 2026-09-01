import type { BuildingZone } from "@/lib/db/types";

const BUILDING_IMAGES: Record<BuildingZone, string> = {
  "Central Library":
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80",
  "Amrita Nagar Block":
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
  "CSE Block":
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
  "Cafeteria Wing":
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80",
  "Open Air Theatre Lawns":
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
  "Hostel Common Room":
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop&q=80",
};

export function getSpotImageUrl(
  building: BuildingZone,
  photos: string[]
): string {
  if (photos[0]) return photos[0];
  return BUILDING_IMAGES[building];
}
