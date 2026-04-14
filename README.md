<p align="center">
    <img src="./app/icon.svg" alt="imagetools" width="120">
</p>

# imagetools

A collection of fast, client-side image utilities that run directly in your browser. Resize, crop, convert, trim, and rasterize — no uploads, no servers, no waiting.

![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind%20v4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

## Why imagetools?

Most online image tools send your files to a server. That means waiting for uploads, trusting someone else with your images, and hitting rate limits. imagetools runs everything client-side using Canvas APIs and browser-native processing. Drop a file, make the change, export immediately. Your images never leave your machine.

## Features

### Tools

| Tool                        | Description                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| **Resize Image**            | Resize PNG, JPG, and WebP with exact dimensions and scale presets |
| **Image Converter**         | Convert between PNG, JPG, and WebP with batch download support    |
| **Circle Crop**             | Export a circular crop as a transparent PNG                       |
| **Crop by Aspect Ratio**    | Presets like 1:1, 4:5, 3:2, 16:9, plus freeform                   |
| **Rounded Corners**         | Rounded corners with presets or custom radius                     |
| **Trim Transparent Pixels** | Auto-detect and crop transparent padding from PNG/WebP            |
| **SVG to PNG**              | Rasterize SVGs to PNG or WebP at any size                         |

- **Runs on-device** — core tool flows use Canvas APIs, no backend processing
- **No uploads** — files are read locally via `FileReader` and object URLs
- **Object URL lifecycle** — URLs created for previews are revoked when no longer needed
- **Worker-backed processing** — heavy operations like transparent boundary detection run in dedicated workers to keep the UI responsive
- **Works on desktop and mobile** — responsive layout, PWA manifest included

## Requirements

- **Node.js 20+**
- **pnpm**
- **Modern browser** — Chrome, Firefox, Safari, or Edge (Canvas API required)

## Installation

```bash
git clone https://github.com/colinvkim/imagetools.git
cd imagetools
pnpm install
```

## Development

Start the dev server (with Turbopack):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:

```bash
pnpm build
pnpm start
```

Run quality checks:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Format code:

```bash
pnpm format
```

## Project Structure

```
imagetools/
├── app/
│   ├── layout.tsx                    # Root layout (theme, metadata)
│   ├── page.tsx                      # Homepage — tool grid
│   ├── globals.css                   # Theme tokens, base styles
│   ├── (tools)/
│   │   ├── resize-image/
│   │   ├── raster-convert/
│   │   ├── circle-crop/
│   │   ├── aspect-ratio-crop/
│   │   ├── rounded-corners/
│   │   ├── trim-transparent-pixels/
│   │   ├── svg-to-png/
│   │   └── webp-to-png/              # Compatibility route → /raster-convert
│   └── manifest.ts                   # PWA manifest
├── components/
│   ├── tools/                        # Per-tool UI and controls
│   ├── site/                         # Shared layout (PageShell, tool definitions)
│   └── ui/                           # shadcn/ui-style primitives
├── hooks/                            # Upload lifecycle and file state hooks
├── lib/
│   ├── image/                        # Format- and operation-specific logic
│   ├── file-input.ts                 # File validation and normalization
│   ├── image/export.ts               # Export helpers and filename generation
│   └── site-metadata.ts              # OpenGraph, canonical URLs, metadata
├── public/
├── components.json                   # shadcn configuration
└── next.config.mjs
```

## Adding a New Tool

1. Define the tool in `components/site/tool-data.tsx`
2. Create a route directory under `app/<tool-name>/page.tsx`
3. Follow the shared pattern: file input → preview → settings → transform → export
4. Keep image processing logic in `lib/image/`, not in page components
5. Reuse existing upload, preview, and export flows
6. Preserve object URL cleanup and file validation behavior

## Architecture Notes

- **File inputs** are handled through shared hooks that manage object URL creation and revocation
- **Canvas-based operations** power all raster transformations — no external image processing libraries
- **SVG rasterization** parses SVG content in the browser and renders it onto a Canvas element
- **Transparent boundary detection** uses worker-backed code to avoid blocking the main thread
- **No custom API layer** — everything runs client-side
- **PWA support** — installable on desktop and mobile via `manifest.ts`

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui-style** component primitives
- **Lucide React** — icons
- **@vercel/analytics** — usage analytics
- **next-themes** — dark mode support
- **Prettier** — code formatting

## Contributing

Contributions are easier to review when they stay aligned with the existing structure.

General guidance:

- Prefer extending shared tool primitives before adding one-off UI patterns
- Keep image processing logic in `lib/` rather than burying it inside page components
- Reuse the existing upload, preview, and export flow where possible
- Preserve object URL cleanup and file validation when touching upload paths
- Run `pnpm typecheck`, `pnpm lint`, and `pnpm build` before submitting changes
- Focus PRs on one tool or one shared concern — avoid mixing multiple unrelated changes

## License

MIT. See [LICENSE](LICENSE) for details.
