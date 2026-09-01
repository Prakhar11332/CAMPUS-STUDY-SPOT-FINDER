import { promises as fs } from "fs";
import path from "path";
import type { DbShape } from "./types";

// --------------------------------------------------------------------------
// Persistence layer.
//
// Why a JSON file instead of Postgres/SQLite here: this sandbox's outbound
// network allowlist blocks both Prisma's engine-binary download host and
// node-gyp's header download (needed to compile better-sqlite3), so neither
// a client-server DB nor a native SQLite binding can be installed here.
// This module isolates all persistence behind an async repository API
// (readDb/writeDb + the functions in repository.ts) so swapping in real
// Postgres via Prisma later is a matter of rewriting this one file — no
// API route or component needs to change. See STUDY_SPOT_FINDER.md.
// --------------------------------------------------------------------------

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const EMPTY_DB: DbShape = { spots: [], ratings: [] };

// Simple in-process write queue so concurrent API requests don't
// interleave read-modify-write cycles and clobber each other's writes.
let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureDbFile(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), "utf-8");
  }
}

export async function readDb(): Promise<DbShape> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  try {
    return JSON.parse(raw) as DbShape;
  } catch {
    return { ...EMPTY_DB };
  }
}

async function writeDb(data: DbShape): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// All mutations go through this so they're serialized on writeQueue.
export async function mutateDb<T>(
  fn: (db: DbShape) => T | Promise<T>
): Promise<T> {
  const task = writeQueue.then(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
  // Swallow errors for queue continuation purposes only; the caller still
  // sees the real rejection via `task`.
  writeQueue = task.catch(() => undefined);
  return task;
}
