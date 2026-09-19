import { degrees, PDFDocument } from "pdf-lib";

export async function rotatePdfFile(bytes: Uint8Array, rotations: Map<number, number>) {
  const document = await PDFDocument.load(bytes);

  document.getPages().forEach((page, index) => {
    const rotation = rotations.get(index) ?? 0;
    if (rotation === 0) return;

    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  });

  return document.save();
}