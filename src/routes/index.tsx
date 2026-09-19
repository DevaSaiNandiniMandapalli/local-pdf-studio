import { useEffect, useMemo, useState } from "react";
import { Check, Download, FilePlus2, Files, LoaderCircle, LockKeyhole, RotateCw, Scissors, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { FileList } from "@/components/pdf/FileList";
import { FileUploader } from "@/components/pdf/FileUploader";
import { PdfPreview } from "@/components/pdf/PdfPreview";
import { mergePdfFiles } from "@/services/pdf/merge";
import { readPdfFile, parsePageRange } from "@/services/pdf/reader";
import { rotatePdfFile } from "@/services/pdf/rotate";
import { splitPdfFile } from "@/services/pdf/split";
import type { PdfMode, UploadedPdf } from "@/types/pdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PDF Utility — Private, local PDF tools" },
      { name: "description", content: "Merge, split, and rotate PDF files locally in your browser. Your documents never leave your device." },
      { property: "og:title", content: "PDF Utility — Private, local PDF tools" },
      { property: "og:description", content: "Merge, split, and rotate PDF files locally in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PdfUtility,
});

const modes: Array<{ id: PdfMode; label: string; description: string; icon: typeof Files }> = [
  { id: "merge", label: "Merge", description: "Join files in order", icon: Files },
  { id: "split", label: "Split", description: "Extract selected pages", icon: Scissors },
  { id: "rotate", label: "Rotate", description: "Turn pages precisely", icon: RotateCw },
];

const rotateOptions = [90, 180, 270] as const;

function PdfUtility() {
  const [mode, setMode] = useState<PdfMode>("merge");
  const [files, setFiles] = useState<UploadedPdf[]>([]);
  const [splitRange, setSplitRange] = useState("1-1");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rotation, setRotation] = useState<(typeof rotateOptions)[number]>(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeFile = files[0];
  const totalPages = useMemo(() => files.reduce((total, item) => total + item.pageCount, 0), [files]);

  useEffect(() => {
    setError("");
    setSuccess("");
    if (mode === "merge") {
      setSelectedPages(new Set());
    } else if (activeFile) {
      setSplitRange(`1-${activeFile.pageCount}`);
      setSelectedPages(new Set());
    }
  }, [mode, activeFile?.id, activeFile?.pageCount]);

  const resetWorkspace = () => {
    setFiles([]);
    setSelectedPages(new Set());
    setError("");
    setSuccess("");
  };

  const handleModeChange = (nextMode: PdfMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    resetWorkspace();
  };

  const addFiles = async (incoming: File[]) => {
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const pdfFiles = incoming.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
      if (pdfFiles.length !== incoming.length) throw new Error("Only PDF files are supported.");
      if (mode !== "merge" && pdfFiles.length > 1) throw new Error("Choose one PDF for this operation.");

      const loaded: UploadedPdf[] = [];
      for (const file of pdfFiles) {
        const { bytes, pageCount } = await readPdfFile(file);
        loaded.push({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file, bytes, pageCount });
      }

      setFiles((current) => mode === "merge" ? [...current, ...loaded] : loaded);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "This PDF could not be opened. Try another file.");
    } finally {
      setBusy(false);
    }
  };

  const processPdf = async () => {
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      let output: Uint8Array;
      let filename: string;

      if (mode === "merge") {
        if (files.length < 2) throw new Error("Add at least two PDFs to merge.");
        output = await mergePdfFiles(files.map((file) => file.bytes));
        filename = "merged-document.pdf";
      } else if (mode === "split") {
        if (!activeFile) throw new Error("Choose a PDF first.");
        output = await splitPdfFile(activeFile.bytes, parsePageRange(splitRange, activeFile.pageCount));
        filename = `${activeFile.file.name.replace(/\.pdf$/i, "")}-split.pdf`;
      } else {
        if (!activeFile) throw new Error("Choose a PDF first.");
        if (selectedPages.size === 0) throw new Error("Select at least one page to rotate.");
        const rotations = new Map([...selectedPages].map((page) => [page, rotation]));
        output = await rotatePdfFile(activeFile.bytes, rotations);
        filename = `${activeFile.file.name.replace(/\.pdf$/i, "")}-rotated.pdf`;
      }

      downloadPdf(output, filename);
      setSuccess("Your processed PDF is ready to download.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong while processing this PDF.");
    } finally {
      setBusy(false);
    }
  };

  const reorderFiles = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    setFiles((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
  };

  const togglePage = (page: number) => {
    setSelectedPages((current) => {
      const next = new Set(current);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const selectAllPages = () => {
    if (!activeFile) return;
    setSelectedPages(selectedPages.size === activeFile.pageCount ? new Set() : new Set(Array.from({ length: activeFile.pageCount }, (_, index) => index)));
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-border py-5 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <WandSparkles className="size-4" />
            </div>
            <div>
              <p className="font-display text-base font-bold leading-none tracking-tight">PDF Utility</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Private by default</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
            <LockKeyhole className="size-3.5 text-primary" /> Nothing leaves your device
          </div>
        </header>

        <section className="grid gap-8 pb-8 pt-10 lg:grid-cols-[1fr_0.82fr] lg:items-end lg:gap-16 lg:pt-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="size-3.5" /> Simple tools. Local processing.
            </div>
            <h1 className="max-w-xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Make PDFs <span className="text-primary">work harder.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              A focused set of PDF tools that keeps your documents private. No upload, no account, no clutter.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 border-l-0 border-border sm:gap-6 lg:border-l lg:pl-8">
            <TrustStat value="100%" label="in browser" />
            <TrustStat value="0" label="uploads" />
            <TrustStat value="3" label="core tools" />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_50px_-34px_var(--color-foreground)]">
          <div className="grid border-b border-border sm:grid-cols-3">
            {modes.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleModeChange(id)}
                className={`relative flex cursor-pointer items-center gap-3 border-b px-4 py-4 text-left transition-colors sm:border-b-0 sm:border-r last:border-r-0 sm:px-6 ${mode === id ? "border-primary bg-primary/6 text-foreground" : "border-border text-muted-foreground hover:bg-muted/50"}`}
                aria-pressed={mode === id}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${mode === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
                </span>
                {mode === id && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-7 lg:p-9">
            {!files.length && <FileUploader mode={mode} disabled={busy} onFiles={addFiles} />}

            {files.length > 0 && (
              <div className="space-y-6">
                {mode === "merge" && (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Merge order</p>
                      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">Arrange your files</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Drag a row or use the arrows to set the final order.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => document.querySelector<HTMLInputElement>('input[aria-label="Select PDF files"]')?.click()} disabled={busy}>
                      <FilePlus2 /> Add PDFs
                    </Button>
                  </div>
                )}

                {mode === "split" && activeFile && (
                  <div className="flex flex-col gap-5 rounded-xl bg-muted/45 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Files className="size-5" /></div>
                      <div className="min-w-0"><p className="truncate text-sm font-semibold">{activeFile.file.name}</p><p className="text-xs text-muted-foreground">{activeFile.pageCount} pages available</p></div>
                    </div>
                    <label className="flex shrink-0 items-center gap-3 text-sm font-medium">
                      Pages to extract
                      <input value={splitRange} onChange={(event) => setSplitRange(event.target.value)} placeholder="1-3, 5" className="h-10 w-32 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" aria-label="Pages to extract" />
                    </label>
                  </div>
                )}

                {mode === "rotate" && activeFile && (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 rounded-xl bg-muted/45 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div><p className="text-sm font-semibold">Select pages to rotate</p><p className="mt-1 text-xs text-muted-foreground">{selectedPages.size} of {activeFile.pageCount} pages selected</p></div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={selectAllPages}>{selectedPages.size === activeFile.pageCount ? "Clear selection" : "Rotate all pages"}</Button>
                        {rotateOptions.map((value) => <Button key={value} variant={rotation === value ? "default" : "outline"} size="sm" onClick={() => setRotation(value)} aria-pressed={rotation === value}>{value}°</Button>)}
                      </div>
                    </div>
                    <PdfPreview bytes={activeFile.bytes} pageCount={activeFile.pageCount} selectedPages={selectedPages} onTogglePage={togglePage} />
                  </div>
                )}

                {mode === "merge" && <FileList files={files} onReorder={reorderFiles} onRemove={removeFile} />}

                {mode !== "rotate" && <div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-primary" /><span>{mode === "merge" ? `${files.length} files ready · ${totalPages} pages total` : "Your original stays untouched"}</span></div>}

                {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
                {success && <div role="status" className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/8 px-4 py-3 text-sm font-medium text-primary"><Check className="size-4" />{success}</div>}

                <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" onClick={resetWorkspace} disabled={busy}>Start over</Button>
                  <Button size="lg" onClick={processPdf} disabled={busy || (mode === "merge" && files.length < 2)}>
                    {busy ? <LoaderCircle className="animate-spin" /> : <Download />}
                    {busy ? "Processing…" : mode === "merge" ? "Merge & download" : mode === "split" ? "Split & download" : `Rotate ${rotation}° & download`}
                  </Button>
                </div>
              </div>
            )}

            {!files.length && error && <div role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
          </div>
        </section>

        <footer className="flex flex-col gap-3 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Built for the quiet moments between download and done.</p>
          <p className="flex items-center gap-1.5"><LockKeyhole className="size-3.5 text-primary" /> Files are processed in memory and never uploaded.</p>
        </footer>
      </div>
    </main>
  );
}

function TrustStat({ value, label }: { value: string; label: string }) {
  return <div><p className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</p><p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p></div>;
}

function downloadPdf(bytes: Uint8Array, filename: string) {
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}