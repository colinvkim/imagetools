import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { ResizeImageTool } from "@/components/tools/resize-image-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Resize Image",
  description:
    "Resize PNG, JPG, and WebP images locally with precise dimensions and aspect-ratio controls.",
})

export default function ResizeImagePage() {
  return (
    <ToolPage
      title="Resize images with exact dimensions and quick scale presets"
      description="Upload a raster image, keep the aspect ratio locked if you want, and export a resized version locally without uploading anything."
    >
      <ResizeImageTool />
    </ToolPage>
  )
}
