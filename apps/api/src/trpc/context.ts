import { db } from "../db/index.js";
import type { DB } from "../db/index.js";

export interface Context {
  db: DB;
}

export function createContext(): Context {
  return { db };
}
