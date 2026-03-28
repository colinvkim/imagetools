# imagetools

**imagetools** is a Next.js website that provides various image utilities. The project is focused on local, client-side workflows for common image editing and conversion tasks. There is no backend service or server-side processing involved.

## Contents

- [Getting Started](#getting-started)
- [Included Tools](#included-tools)
- [How It Works](#how-it-works)
- [Development Notes](#development-notes)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The app will be available at:

```text
http://localhost:3000
```

Create a production build:

```bash
pnpm build
```

Run the production server locally:

```bash
pnpm start
```

## Included Tools

The current tool set is defined in `components/site/tool-data.tsx`.

| Tool                    | Route                      | Notes                                                           |
| ----------------------- | -------------------------- | --------------------------------------------------------------- |
| Resize Image            | `/resize-image`            | Resize PNG, JPG, and WebP images                                |
| Raster Convert          | `/raster-convert`          | Convert raster images to PNG or WebP, including batch workflows |
| Circle Crop             | `/circle-crop`             | Export a circular crop as a transparent PNG                     |
| Aspect Ratio Crop       | `/aspect-ratio-crop`       | Crop to preset or freeform aspect ratios                        |
| Rounded Corners         | `/rounded-corners`         | Apply rounded corners and export a transparent PNG              |
| Trim Transparent Pixels | `/trim-transparent-pixels` | Detect and remove transparent padding                           |
| SVG Export              | `/svg-to-png`              | Rasterize SVG input to PNG or WebP                              |

There is also a compatibility route:

- `/webp-to-png` redirects to `/raster-convert`

## How It Works

This application is primarily a client-rendered interface around browser APIs:

- File inputs and paste handlers provide local files to the UI.
- Object URLs are created for previews and revoked when no longer needed.
- Canvas-based operations handle raster export and image transformations.
- SVG workflows parse SVG content in the browser and rasterize it on demand.
- Some heavy image analysis work, such as transparent-boundary detection, is split into dedicated utility modules and worker-backed code where appropriate.

There is no custom API layer in this repository for image editing. If you are tracing a tool behavior, the implementation usually lives in one of these places:

- UI state and controls: `components/tools/*`
- Upload lifecycle: `hooks/*`
- File validation and normalization: `lib/file-input.ts`
- Export helpers and filename generation: `lib/image/export.ts`
- Format- or operation-specific logic: `lib/image/*`

## Development Notes

### Tool implementation pattern

Most tools follow the same structure:

1. Accept a file through `FileDropzone` or shared upload hooks.
2. Store the selected file and derived metadata in client state.
3. Render a preview panel and a settings panel inside `ToolWorkspace`.
4. Run the transformation in the browser.
5. Export the result with a generated filename.

This pattern keeps the tools consistent and makes it easier to add new ones without rethinking the surrounding UX each time.

### Quality checks

Before opening a change, run at least:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

### Styling

The UI is built with:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style component primitives

Shared styling and theme tokens live in `app/globals.css`.

## Contributing

Contributions are easier to review when they stay aligned with the existing structure.

General guidance:

- Prefer extending shared tool primitives before adding one-off UI patterns.
- Keep image processing logic in `lib/` rather than burying it inside page components.
- Reuse the existing upload, preview, and export flow where possible.
- Preserve object URL cleanup and file validation behavior when touching upload paths.
- Run `pnpm typecheck`, `pnpm lint`, and `pnpm build` before submitting changes.
