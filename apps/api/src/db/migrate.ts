import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });
console.log("Migrations applied successfully.");
