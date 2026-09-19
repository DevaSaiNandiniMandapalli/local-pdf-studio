import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { FileUp, LockKeyhole, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PdfMode } from "@/types/pdf";

type FileUploaderProps = {
  mode: PdfMode;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
};

export function FileUploader({ mode, disabled, onFiles }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptFiles = (files: File[]) => {
    if (files.length > 0) onFiles(files);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setIsDragging(false);
      }}
      onDrop={handleDrop}
      className={`group relative flex min-h-56 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-10 text-center transition-colors sm:min-h-64 ${
        isDragging ? "border-primary bg-primary/8" : "border-border bg-muted/35 hover:border-primary/45"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <div className="absolute inset-x-10 top-0 h-px bg-primary/25" />
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border">
        {isDragging ? <UploadCloud className="size-6" /> : <FileUp className="size-6" />}
      </div>
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        Drop {mode === "merge" ? "your PDFs" : "a PDF"} here
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {mode === "merge" ? "Add two or more files, then arrange them in the order you need." : "Your file stays in this browser tab while you work."}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple={mode === "merge"}
        onChange={handleChange}
        className="sr-only"
        aria-label={mode === "merge" ? "Select PDF files" : "Select a PDF file"}
      />
      <Button type="button" className="mt-6" onClick={() => inputRef.current?.click()} disabled={disabled}>
        <FileUp />
        Select {mode === "merge" ? "PDFs" : "PDF"}
      </Button>
      <div className="mt-5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <LockKeyhole className="size-3" /> Local processing only
      </div>
    </div>
  );
}