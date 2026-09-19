import { PDFDocument } from "pdf-lib";

export async function readPdfFile(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const document = await PDFDocument.load(bytes);

  return { bytes, pageCount: document.getPageCount() };
}

export function parsePageRange(value: string, pageCount: number) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Enter at least one page number or range.");

  const pages = new Set<number>();
  for (const token of trimmed.split(",").map((part) => part.trim()).filter(Boolean)) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(token);
    if (!match) throw new Error(`“${token}” is not a valid page range.`);

    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end > pageCount || start > end) {
      throw new Error(`Pages must be between 1 and ${pageCount}.`);
    }

    for (let page = start; page <= end; page += 1) pages.add(page - 1);
  }

  return [...pages].sort((a, b) => a - b);
}