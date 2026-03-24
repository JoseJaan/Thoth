import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import { config } from "../config.js";
import * as schema from "./schema.js";

fs.mkdirSync(config.dataDir, { recursive: true });

const sqlite = new Database(config.dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Manual migrations for schema changes without drizzle migration files
try {
  sqlite.exec("ALTER TABLE document_folders ADD COLUMN source_path TEXT");
} catch {
  // Column already exists
}

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
