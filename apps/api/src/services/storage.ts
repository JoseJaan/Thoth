import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { generateId } from "../utils/id.js";

export function ensureUploadDirs() {
  fs.mkdirSync(config.pdfsDir, { recursive: true });
}

export function savePdf(buffer: Buffer, originalName: string): { filePath: string; fileName: string } {
  ensureUploadDirs();
  const ext = path.extname(originalName) || ".pdf";
  const fileName = `${generateId()}${ext}`;
  const filePath = path.join(config.pdfsDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return { filePath: `pdfs/${fileName}`, fileName };
}

export function deletePdf(relativePath: string): boolean {
  const fullPath = path.join(config.uploadsDir, relativePath);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch {}
  return false;
}

export function getPdfFullPath(relativePath: string): string {
  return path.join(config.uploadsDir, relativePath);
}

export function listPdfsInFolder(folderPath: string): Array<{ name: string; fullPath: string }> {
  const results: Array<{ name: string; fullPath: string }> = [];

  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder not found: ${folderPath}`);
  }

  function scanDir(dirPath: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(entryPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
        results.push({ name: entry.name, fullPath: entryPath });
      }
    }
  }

  scanDir(folderPath);
  return results;
}

export function readPdfFile(fullPath: string): { buffer: Buffer; size: number } {
  const buffer = fs.readFileSync(fullPath);
  return { buffer, size: buffer.length };
}
