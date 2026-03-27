import {
  CircleDashed,
  Expand,
  FileImage,
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
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    href: "/resize-image",
    title: "Resize Image",
    description:
      "Resize PNG, JPG, and WebP images with exact dimensions and quick scale presets.",
    shortDescription: "Resize raster images with precise dimensions.",
    icon: Expand,
  },
  {
    href: "/raster-convert",
    title: "Raster Convert",
    description:
      "Convert PNG, JPG, and WebP assets into PNG or WebP locally, with instant preview and batch download.",
    shortDescription: "Convert raster images into PNG or WebP.",
    icon: FileImage,
  },
  {
    href: "/circle-crop",
    title: "Circle Crop",
    description:
      "Position a square crop, preview the result, and export a transparent circular PNG.",
    shortDescription: "Crop to a transparent circular PNG.",
    icon: CircleDashed,
  },
  {
    href: "/rounded-corners",
    title: "Rounded Corners",
    description:
      "Apply rounded corners with presets or a custom radius while preserving any aspect ratio.",
    shortDescription: "Add rounded corners to any image shape.",
    icon: ScanFace,
  },
  {
    href: "/svg-to-png",
    title: "SVG Export",
    description:
      "Rasterize SVGs as PNG or WebP at the size you want without sending artwork to a server.",
    shortDescription: "Rasterize SVGs as PNG or WebP.",
    icon: Scaling,
  },
]
