import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type PdfPreviewProps = {
  bytes: Uint8Array;
  pageCount: number;
  selectedPages: Set<number>;
  onTogglePage: (page: number) => void;
};

export function PdfPreview({ bytes, pageCount, selectedPages, onTogglePage }: PdfPreviewProps) {
  const [rendered, setRendered] = useState(false);
  const canvases = useRef<Array<HTMLCanvasElement | null>>([]);

  useEffect(() => {
    let cancelled = false;
    setRendered(false);

    async function renderPages() {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const document = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;

      await Promise.all(
        Array.from({ length: pageCount }, async (_, index) => {
          const page = await document.getPage(index + 1);
          const viewport = page.getViewport({ scale: 0.42 });
          const canvas = canvases.current[index];
          if (!canvas || cancelled) return;

          const context = canvas.getContext("2d");
          if (!context) return;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvas, canvasContext: context, viewport }).promise;
        }),
      );

      if (!cancelled) setRendered(true);
    }

    void renderPages().catch(() => {
      if (!cancelled) setRendered(true);
    });

    return () => {
      cancelled = true;
    };
  }, [bytes, pageCount]);

  return (
    <div className="relative">
      {!rendered && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
          <LoaderCircle className="size-5 animate-spin text-primary" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: pageCount }, (_, index) => (
          <Button
            key={index}
            type="button"
            variant={selectedPages.has(index) ? "default" : "outline"}
            className="group relative h-auto min-h-40 flex-col justify-start gap-2 overflow-hidden p-2"
            onClick={() => onTogglePage(index)}
            aria-pressed={selectedPages.has(index)}
            aria-label={`Page ${index + 1}, ${selectedPages.has(index) ? "selected" : "not selected"}`}
          >
            <canvas ref={(node) => { canvases.current[index] = node; }} className="h-auto w-full rounded-md bg-card shadow-sm" />
            <span className="flex w-full items-center justify-between px-1 text-xs font-semibold">
              <span>Page {index + 1}</span>
              {selectedPages.has(index) && <Check className="size-3.5" />}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}