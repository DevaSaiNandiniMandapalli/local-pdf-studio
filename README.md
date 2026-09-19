# Local PDF Studio

Build a PaperKnife-Inspired PDF Utility — MVP

Objective

Build a clean, responsive, privacy-first PDF utility web application inspired by PaperKnife.

The MVP must implement 3 fully functional PDF operations:

Merge PDF

Split PDF

Rotate PDF pages

All PDF processing should happen locally in the browser. Do not upload PDF files to a backend or store user documents on a server.

Reference Repository

Use the following open-source project as a technical reference for architecture and implementation patterns:

PaperKnife:
https://github.com/potatameister/PaperKnife

Note: PaperKnife is licensed under AGPL-3.0-or-later, so review and comply with its license before copying or redistributing code.

Technical Stack

Frontend: React 18

Language: TypeScript

Build Tool: Vite

Styling: Tailwind CSS

PDF manipulation: pdf-lib

PDF rendering/reading: pdfjs-dist

Drag & drop: dnd-kit

Icons: Lucide React

PWA: vite-plugin-pwa

Optional mobile packaging: Capacitor

These technologies closely match the current PaperKnife stack.

Application Flow

User opens application
        ↓
Selects PDF file(s)
        ↓
PDF is loaded locally
        ↓
User selects an operation
        ↓
PDF is processed locally
        ↓
Preview/result is displayed
        ↓
User downloads the processed PDF


Feature 1 — Merge PDF

Flow:

Select multiple PDFs
        ↓
Display selected files
        ↓
Allow drag-and-drop reordering
        ↓
Click "Merge"
        ↓
Use pdf-lib to combine pages
        ↓
Generate final PDF
        ↓
Download merged PDF


Requirements:

Multiple PDF upload

File list

Reordering

Remove individual files

Merge button

Download result

Handle invalid files gracefully

Feature 2 — Split PDF

Flow:

Select PDF
    ↓
Read total page count
    ↓
Show page range/input
    ↓
User selects pages or range
    ↓
Extract selected pages
    ↓
Generate new PDF
    ↓
Download result


Requirements:

Display page count

Support page ranges such as 1-3

Validate page numbers

Generate a separate PDF

Provide clear error messages

Feature 3 — Rotate PDF

Flow:

Select PDF
    ↓
Render/show page previews
    ↓
Choose page(s)
    ↓
Rotate 90° / 180° / 270°
    ↓
Apply rotation with pdf-lib
    ↓
Generate updated PDF
    ↓
Download result


Requirements:

Page preview

Rotate selected pages

Rotate all pages

90° rotation controls

Save/download processed PDF

UI Requirements

Create a simple professional interface:

┌──────────────────────────────────────┐
│              PDF Utility             │
│     Private • Fast • Local           │
├──────────────────────────────────────┤
│                                      │
│       Drag & Drop PDF Files          │
│             or                       │
│          [ Select Files ]            │
│                                      │
├──────────────────────────────────────┤
│  Merge  │  Split  │  Rotate          │
├──────────────────────────────────────┤
│                                      │
│        PDF workspace / preview       │
│                                      │
├──────────────────────────────────────┤
│          [ Process PDF ]             │
│                                      │
│          [ Download ]                │
└──────────────────────────────────────┘


The UI should be:

Responsive

Mobile-friendly

Accessible

Minimal and professional

Clear about local/private processing

Equipped with loading/progress states

Equipped with useful error messages

Architecture

Use a modular structure:

src/
├── components/
│   ├── FileUploader
│   ├── PdfPreview
│   ├── FileList
│   └── Toolbar
│
├── features/
│   ├── merge/
│   ├── split/
│   └── rotate/
│
├── services/
│   └── pdf/
│       ├── merge.ts
│       ├── split.ts
│       └── rotate.ts
│
├── utils/
├── types/
├── App.tsx
└── main.tsx


Keep PDF-processing logic separate from UI components.

Important Constraints

No backend required for the MVP.

Never upload PDFs to a server.

Process files in browser memory.

Do not persist sensitive PDF contents unnecessarily.

Validate file types and page ranges.

Handle large/invalid PDFs gracefully.

Keep the implementation extensible for future features such as compression, PDF-to-image, encryption, signing, OCR, and metadata cleaning.

Definition of Done

The MVP is complete when a user can:

Select multiple PDFs → reorder → merge → download.

Select a PDF → choose pages/range → split → download.

Select a PDF → rotate pages → download.

All three workflows must work end-to-end using real PDF files with local browser processing.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bae91775-9688-4917-963b-9ad2969252bc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
