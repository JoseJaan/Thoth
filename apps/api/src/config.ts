import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../../../");

export const config = {
  port: 3001,
  host: "0.0.0.0",
  dataDir: path.join(ROOT_DIR, "data"),
  dbPath: path.join(ROOT_DIR, "data", "thoth.db"),
  uploadsDir: path.join(ROOT_DIR, "data", "uploads"),
  pdfsDir: path.join(ROOT_DIR, "data", "uploads", "pdfs"),
};
