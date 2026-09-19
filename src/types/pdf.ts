export type PdfMode = "merge" | "split" | "rotate";

export type UploadedPdf = {
  id: string;
  file: File;
  bytes: Uint8Array;
  pageCount: number;
};