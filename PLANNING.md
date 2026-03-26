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

## Tool Roadmap

### 1. Circle Crop

Goal:

- User uploads an image.
- User crops to a square in a dialog.
- The selected square is rendered as a circle.
- Result downloads as PNG with transparent corners.

Planned behavior:

- Square crop UI with draggable/resizable selection
- Live preview of final circle result
- Export as PNG

Notes:

- This should define our reusable crop flow.
- The crop dialog and crop math should be reusable for rounded-corner work.

### 2. Rounded Corners / Border Radius

Goal:

- User uploads an image.
- User applies rounded corners with preset options and a custom value.

Planned behavior:

- Reuse the same crop/preview flow where appropriate
- Presets such as `8`, `16`, `24`, `32`, `64`
- Custom radius input/slider
- Transparent output by default
- Optional background controls can be added if needed later

Notes:

- This likely belongs in the same editor system as circle crop, with different output masks.

### 3. WebP to PNG

Goal:

- User uploads a `.webp` image and downloads a `.png`.

Planned behavior:

- Very simple flow: upload, preview, convert, download
- No crop UI needed
- Preserve original dimensions

Notes:

- This is the simplest tool and a good candidate for validating the shared upload/export pipeline.

### 4. SVG to PNG

Goal:

- User uploads an `.svg`.
- User chooses PNG output size.
- App rasterizes the SVG client-side and downloads PNG.

Planned behavior:

- Read raw SVG text in the browser
- Parse dimensions from `width`/`height` or `viewBox`
- Allow scale presets and/or direct width/height input
- Render to canvas and export PNG

Notes:

- This is the tool most similar to `quickpic`.
- We should make the sizing controls clearer and more robust than a bare multiplier-only flow.

## Recommended Build Order

1. Build the shared tool foundation:
   - uploader
   - drag-and-drop
   - clipboard paste
   - preview area
   - metadata extraction
   - blob-based download helper
2. Build WebP to PNG first:
   - fastest path to prove the pipeline
3. Build SVG to PNG second:
   - introduces SVG parsing and rasterization
4. Build the shared crop editor:
   - square crop interaction
   - preview modal/dialog
5. Build Circle Crop:
   - crop output with circular mask
6. Build Rounded Corners:
   - reuse crop/editor system with rectangular rounded mask
7. Build the homepage/presentation layer after the tools are solid

## Inspiration from quickpic

`quickpic` is useful inspiration for structure, not something we should copy exactly.

Ideas worth borrowing:

- Browser-native image processing
- Simple per-tool pages/components
- Shared upload + dropzone flow
- Canvas-based export logic per tool

Things we should improve on:

- Use `toBlob()` instead of relying heavily on `toDataURL()`
- Support SVG `viewBox` properly
- Avoid unsafe SVG preview patterns where possible
- Build a stronger crop experience for crop-based tools

## Initial File/Architecture Direction

Likely areas to create as we implement:

- `app/` routes for tools and later homepage/presentation
- `components/tools/` for tool UIs and shared editor pieces
- `components/shared/` for upload, preview, dropzone, and download UI
- `lib/image/` for processing helpers
- `hooks/` for upload state and clipboard/drop behavior

Possible shared modules:

- `lib/image/load-image.ts`
- `lib/image/export-blob.ts`
- `lib/image/svg.ts`
- `lib/image/crop.ts`
- `hooks/use-file-upload.ts`

## V1 Non-Goals

- Server-side image processing
- User accounts or saved projects
- Batch processing
- Offline/PWA support at launch
- Heavy “editor app” complexity beyond what the roadmap needs

## Open Questions for Later

- Final product name
- Exact homepage tone and visual direction
- Whether rounded-corner export needs non-transparent background options in v1
- Whether SVG sizing should be scale-based, width/height-based, or both
