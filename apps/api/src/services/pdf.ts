import pdfParse from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (err) {
    console.error("Erro ao extrair texto do PDF:", err);
    return "";
  }
}

export async function getPdfPageCount(buffer: Buffer): Promise<number> {
  try {
    const data = await pdfParse(buffer);
    return data.numpages || 0;
  } catch {
    return 0;
  }
}
