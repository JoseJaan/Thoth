import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { generateId } from "../utils/id.js";
export function ensureUploadDirs() {
    fs.mkdirSync(config.pdfsDir, { recursive: true });
}
export function savePdf(buffer, originalName) {
    ensureUploadDirs();
    const ext = path.extname(originalName) || ".pdf";
    const fileName = `${generateId()}${ext}`;
    const filePath = path.join(config.pdfsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return { filePath: `pdfs/${fileName}`, fileName };
}
export function deletePdf(relativePath) {
    const fullPath = path.join(config.uploadsDir, relativePath);
    try {
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return true;
        }
    }
    catch { }
    return false;
}
export function getPdfFullPath(relativePath) {
    return path.join(config.uploadsDir, relativePath);
}
export async function importFolder(folderPath) {
    const files = [];
    if (!fs.existsSync(folderPath)) {
        throw new Error(`Pasta nao encontrada: ${folderPath}`);
    }
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
            const fullPath = path.join(folderPath, entry.name);
            const buffer = fs.readFileSync(fullPath);
            files.push({ name: entry.name, buffer, size: buffer.length });
        }
    }
    return files;
}
//# sourceMappingURL=storage.js.map