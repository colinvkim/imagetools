# imagetools Planning

## Product Direction

`imagetools` is a simple, fast set of image utilities that run entirely in the browser.

Core principles:

- Client-side only. No uploads, no server-side image processing.
- Fast to use. Minimal steps between upload and download.
- Nice-looking UI. Clean, modern, and pleasant on desktop and mobile.
- Cross-platform. Should work well in modern browsers on Mac, Windows, Linux, iPhone, and Android.
- Privacy-friendly. User files stay on the device.

## Current Stack

- Next.js App Router
- React + TypeScript
- shadcn/ui for reusable UI primitives
- Tailwind CSS via the current app setup

We should use Next.js as a client-heavy app:

- Keep image processing inside client components and browser APIs.
- Avoid API routes or server actions for the actual tool logic.
- Treat the app as a static-style utility site, even though it is built with Next.js.

## Technical Approach

We will build a shared browser image pipeline and then layer each tool on top of it.

Shared pieces:

- File intake: upload, drag-and-drop, and paste from clipboard
- File metadata extraction: width, height, type, file name
- Preview source handling:
  - regular images via object URL or data URL
  - SVGs via raw text + object URL
- Canvas export helpers using `canvas.toBlob()` instead of `toDataURL()` where possible
- Download helper for saving processed files
- Reusable tool shell with upload state, preview, controls, and export action

Important implementation notes:

- Prefer `toBlob()` for better memory behavior on large files.
- Revoke object URLs when they are no longer needed.
- Handle transparency correctly for circle crop and rounded-corner exports.
- For SVG support, parse dimensions carefully and support `viewBox`, not just `width`/`height`.
- Use a real crop interaction for crop-based tools instead of hard-coded centering.
