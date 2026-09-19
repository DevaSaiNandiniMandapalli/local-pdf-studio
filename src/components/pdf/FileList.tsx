import { useState } from "react";
import { ArrowDown, ArrowUp, FileText, GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UploadedPdf } from "@/types/pdf";

type FileListProps = {
  files: UploadedPdf[];
  onReorder: (from: number, to: number) => void;
  onRemove: (id: string) => void;
};

export function FileList({ files, onReorder, onRemove }: FileListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div className="space-y-2" aria-label="Selected PDF files">
      {files.map((pdf, index) => (
        <div
          key={pdf.id}
          draggable
          onDragStart={() => setDraggingId(pdf.id)}
          onDragEnd={() => setDraggingId(null)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const from = files.findIndex((item) => item.id === draggingId);
            if (from >= 0 && from !== index) onReorder(from, index);
            setDraggingId(null);
          }}
          className={`flex items-center gap-3 rounded-xl border bg-card px-3 py-3 transition-opacity ${
            draggingId === pdf.id ? "opacity-45" : "border-border"
          }`}
        >
          <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" aria-label="Drag to reorder" />
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{pdf.file.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {pdf.pageCount} {pdf.pageCount === 1 ? "page" : "pages"} · {(pdf.file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button variant="ghost" size="icon" onClick={() => onReorder(index, index - 1)} disabled={index === 0} aria-label={`Move ${pdf.file.name} up`} title="Move up">
              <ArrowUp />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onReorder(index, index + 1)} disabled={index === files.length - 1} aria-label={`Move ${pdf.file.name} down`} title="Move down">
              <ArrowDown />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onRemove(pdf.id)} aria-label={`Remove ${pdf.file.name}`} title="Remove file">
              <Trash2 className="text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}