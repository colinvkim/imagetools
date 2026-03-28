import {
  Crop,
  CircleDashed,
  Expand,
  FileImage,
  Scan,
  type LucideIcon,
  ScanFace,
  Scaling,
} from "lucide-react"

export type ToolDefinition = {
  href: string
  title: string
  description: string
  shortDescription: string
  icon: LucideIcon
  accent: string
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    href: "/resize-image",
    title: "Resize Image",
    description:
      "Resize PNG, JPG, and WebP images with exact dimensions and quick scale presets.",
    shortDescription: "Resize raster images with precise dimensions.",
    icon: Expand,
    accent: "oklch(0.74 0.09 248 / 0.24)",
  },
  {
    href: "/raster-convert",
    title: "Image Converter",
    description:
      "Convert PNG, JPG, and WebP images into PNG or WebP locally, with instant preview and batch download.",
    shortDescription: "Convert PNG, JPG, and WebP images locally.",
    icon: FileImage,
    accent: "oklch(0.78 0.08 190 / 0.24)",
  },
  {
    href: "/circle-crop",
    title: "Circle Crop",
    description:
      "Position a square crop, preview the result, and export a transparent circular PNG.",
    shortDescription: "Crop to a transparent circular PNG.",
    icon: CircleDashed,
    accent: "oklch(0.76 0.09 8 / 0.22)",
  },
  {
    href: "/aspect-ratio-crop",
    title: "Crop by Aspect Ratio",
    description:
      "Crop PNG, JPG, and WebP images with presets like 1:1, 4:5, 3:2, 16:9, or freeform.",
    shortDescription: "Crop images to common aspect ratios.",
    icon: Crop,
    accent: "oklch(0.82 0.08 92 / 0.24)",
  },
  {
    href: "/rounded-corners",
    title: "Rounded Corners",
    description:
      "Apply rounded corners with presets or a custom radius while preserving any aspect ratio.",
    shortDescription: "Add rounded corners to any image shape.",
    icon: ScanFace,
    accent: "oklch(0.78 0.08 32 / 0.22)",
  },
  {
    href: "/trim-transparent-pixels",
    title: "Trim Transparent Pixels",
    description:
      "Detect transparent padding around PNG and WebP images, preview the tighter bounds, and export the trimmed result locally.",
    shortDescription: "Auto-crop transparent edges.",
    icon: Scan,
    accent: "oklch(0.78 0.08 152 / 0.24)",
  },
  {
    href: "/svg-to-png",
    title: "SVG to PNG Converter",
    description:
      "Rasterize SVGs as PNG or WebP at the size you want without sending artwork to a server.",
    shortDescription: "Convert SVG files to PNG or WebP.",
    icon: Scaling,
    accent: "oklch(0.8 0.08 220 / 0.24)",
  },
]

export function getToolDefinition(href: string): ToolDefinition {
  const tool = TOOL_DEFINITIONS.find((entry) => entry.href === href)

  if (!tool) {
    throw new Error(`Unknown tool definition for href: ${href}`)
  }

  return tool
}
