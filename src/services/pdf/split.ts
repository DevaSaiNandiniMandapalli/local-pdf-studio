import { PDFDocument } from "pdf-lib";

export async function splitPdfFile(bytes: Uint8Array, pageIndices: number[]) {
  const source = await PDFDocument.load(bytes);
  const split = await PDFDocument.create();
  const pages = await split.copyPages(source, pageIndices);
  pages.forEach((page) => split.addPage(page));
  return split.save();
}