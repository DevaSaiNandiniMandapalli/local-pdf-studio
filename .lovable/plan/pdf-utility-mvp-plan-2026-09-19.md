# PDF Utility MVP Plan

## Outcome
Build the first screen as a privacy-first PDF workspace with three local browser operations: Merge, Split, and Rotate.

## User-facing work
- Replace the placeholder with a responsive PaperKnife-inspired workspace.
- Add drag-and-drop PDF selection with file validation, local-only messaging, and loading/error states.
- Add Merge mode with reorderable file rows, remove controls, page counts, and download.
- Add Split mode with page-count display, range parsing/validation, and download.
- Add Rotate mode with rendered page thumbnails, page selection, 90/180/270 controls, rotate-all, and download.

## Technical details
- Add browser-safe PDF services using pdf-lib for manipulation and pdfjs-dist for previews/page counts.
- Keep PDF bytes in component memory only; create and revoke download URLs.
- Use existing semantic design tokens and Lucide icons; add a Google font link in the root head.
- Keep the route at / and add route-specific metadata.

## Validation
- Run the project build and inspect build diagnostics.
- Drive the live preview at desktop and mobile widths.
- Use generated real PDFs to verify merge, split, rotate, and downloaded page counts.
