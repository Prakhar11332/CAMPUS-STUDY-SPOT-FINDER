import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { DbShape, Spot, Rating } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function daysAgo(n: number, hour = 14): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}
function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n, 0, 0, 0);
  return d.toISOString();
}

const spots: Spot[] = [
  {
    id: randomUUID(),
    name: "Silent Reading Hall",
    building: "Central Library",
    floorOrArea: "2nd Floor, East Wing",
    description:
      "Enforced no-talking zone with individual carrel desks. Strictest silence policy on campus — a good default when you need to actually get through a chapter.",
    capacity: 60,
    photos: [],
    createdAt: daysAgo(40),
  },
  {
    id: randomUUID(),
    name: "Group Discussion Pods",
    building: "Central Library",
    floorOrArea: "Ground Floor, Pod Cluster B",
    description:
      "Glass-walled bookable pods meant for project discussions. Whiteboards on the wall. Gets loud when two adjacent pods are both presenting.",
    capacity: 8,
    photos: [],
    createdAt: daysAgo(38),
  },
  {
    id: randomUUID(),
    name: "CSE Block Lab Corridor Seating",
    building: "CSE Block",
    floorOrArea: "3rd Floor, outside Lab 3",
    description:
      "Bench seating right outside the AI/ML lab. Convenient between classes, close to every CS elective, but corridor traffic noise picks up between periods.",
    capacity: 20,
    photos: [],
    createdAt: daysAgo(35),
  },
  {
    id: randomUUID(),
    name: "Amrita Nagar Rooftop Nook",
    building: "Amrita Nagar Block",
    floorOrArea: "Rooftop, Block C",
    description:
      "Open-air rooftop seating with a campus view. No AC, so evenings are better than afternoons. Great when you need sun and headspace over sockets.",
    capacity: 15,
    photos: [],
    createdAt: daysAgo(30),
  },
  {
    id: randomUUID(),
    name: "Cafeteria Wing Window Counter",
    building: "Cafeteria Wing",
    floorOrArea: "1st Floor, window-side bar seating",
    description:
      "Bar-height counter seats along the windows. Best coffee-and-laptop combo on campus, but expect meal-time crowds around 1pm and 8pm.",
    capacity: 24,
    photos: [],
    createdAt: daysAgo(28),
  },
  {
    id: randomUUID(),
    name: "OAT Lawn Steps",
    building: "Open Air Theatre Lawns",
    floorOrArea: "Amphitheatre steps, north side",
    description:
      "Stone steps facing the open-air theatre lawn. Popular for casual reading between classes and club rehearsals in the evening — check what's scheduled before settling in.",
    capacity: 40,
    photos: [],
    createdAt: daysAgo(20),
  },
  {
    id: randomUUID(),
    name: "Hostel Common Room Desks",
    building: "Hostel Common Room",
    floorOrArea: "Block D, Ground Floor",
    description:
      "Shared desks with the TV usually on. Fine for light revision or waiting out a group call; not the move for deep work before an exam.",
    capacity: 12,
    photos: [],
    createdAt: daysAgo(15),
  },
  {
    id: randomUUID(),
    name: "Library Periodicals Corner",
    building: "Central Library",
    floorOrArea: "1st Floor, Journals Section",
    description:
      "Quiet corner near the journal racks, underused compared to the main reading hall. Fewer plug points, but almost always has free seating.",
    capacity: 18,
    photos: [],
    createdAt: daysAgo(10),
  },
];

const names = [
  "Ananya",
  "Rohan",
  "Meera",
  "Kabir",
  "Sneha",
  "Arjun",
  "Divya",
  "Vikram",
  "Priya",
  "Nikhil",
  "Sanjana",
  "Aditya",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const commentsBySpot: Record<string, string[]> = {
  "Silent Reading Hall": [
    "Actually silent. Someone got shushed for a whisper and I respect it.",
    "Best desks for focused revision before finals.",
    "Wifi is weaker at the back rows, sit near the entrance if you need it.",
  ],
  "Group Discussion Pods": [
    "Great for project standups, book ahead though.",
    "Pod 4's soundproofing is worse than the others, you'll hear the next pod.",
  ],
  "CSE Block Lab Corridor Seating": [
    "Convenient between back-to-back classes but loud when period changes.",
    "Good for quick doubt-clearing sessions with lab TAs.",
  ],
  "Amrita Nagar Rooftop Nook": [
    "Beautiful in the evening, no outlets though so charge up first.",
    "Peaceful before 5pm, gets breezy and loud with wind after.",
  ],
  "Cafeteria Wing Window Counter": [
    "Perfect for a working coffee break, avoid 1-2pm lunch rush.",
    "Outlets under the counter are a nice touch, wifi holds up fine.",
  ],
  "OAT Lawn Steps": [
    "Lovely for casual reading, but dance practice some evenings gets loud.",
    "No outlets and wifi is patchy this far from the building.",
  ],
  "Hostel Common Room Desks": [
    "TV noise makes it hard to focus during IPL season.",
    "Fine late at night once everyone clears out.",
  ],
  "Library Periodicals Corner": [
    "Hidden gem, way less crowded than the main hall.",
    "Bring a power bank, only two sockets in the whole corner.",
  ],
};

function makeRatingsForSpot(spot: Spot, baseline: {
  noise: [number, number];
  wifi: [number, number];
  outlets: [number, number];
  crowd: [number, number];
}): Rating[] {
  const count = randInt(4, 7);
  const ratings: Rating[] = [];
  for (let i = 0; i < count; i++) {
    // Make the most recent one or two ratings fall within the last 2 hours
    // so the "current status" logic in repository.ts has something recent
    // to compute from for every seeded spot.
    const createdAt = i < 2 ? hoursAgo(randInt(0, 2)) : daysAgo(randInt(1, 25), randInt(8, 21));
    ratings.push({
      id: randomUUID(),
      spotId: spot.id,
      studentName: pick(names),
      noiseLevel: randInt(baseline.noise[0], baseline.noise[1]),
      wifiQuality: randInt(baseline.wifi[0], baseline.wifi[1]),
      outletAccess: randInt(baseline.outlets[0], baseline.outlets[1]),
      crowdLevel: randInt(baseline.crowd[0], baseline.crowd[1]),
      comment: pick(commentsBySpot[spot.name] ?? ["Solid spot, would come back."]),
      photo: null,
      createdAt,
    });
  }
  return ratings;
}

const baselines: Record<string, Parameters<typeof makeRatingsForSpot>[1]> = {
  "Silent Reading Hall": { noise: [1, 2], wifi: [2, 4], outlets: [2, 4], crowd: [2, 4] },
  "Group Discussion Pods": { noise: [3, 5], wifi: [4, 5], outlets: [4, 5], crowd: [2, 4] },
  "CSE Block Lab Corridor Seating": { noise: [3, 4], wifi: [4, 5], outlets: [3, 5], crowd: [2, 4] },
  "Amrita Nagar Rooftop Nook": { noise: [1, 3], wifi: [1, 3], outlets: [1, 2], crowd: [1, 3] },
  "Cafeteria Wing Window Counter": { noise: [2, 4], wifi: [3, 5], outlets: [3, 5], crowd: [2, 5] },
  "OAT Lawn Steps": { noise: [2, 4], wifi: [1, 2], outlets: [1, 1], crowd: [1, 4] },
  "Hostel Common Room Desks": { noise: [3, 5], wifi: [3, 4], outlets: [3, 5], crowd: [2, 4] },
  "Library Periodicals Corner": { noise: [1, 2], wifi: [2, 3], outlets: [1, 3], crowd: [1, 2] },
};

async function main() {
  const ratings: Rating[] = spots.flatMap((s) => makeRatingsForSpot(s, baselines[s.name]));
  const db: DbShape = { spots, ratings };
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  console.log(`Seeded ${spots.length} spots and ${ratings.length} ratings -> ${DB_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
