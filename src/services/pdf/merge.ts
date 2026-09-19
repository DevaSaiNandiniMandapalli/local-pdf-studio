import { PDFDocument } from "pdf-lib";

export async function mergePdfFiles(files: Uint8Array[]) {
  const merged = await PDFDocument.create();

  for (const bytes of files) {
    const source = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return merged.save();
}