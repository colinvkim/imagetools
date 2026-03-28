import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { getToolDefinition } from "@/components/site/tool-data"
import { ResizeImageTool } from "@/components/tools/resize-image-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Resize Image Online",
  description:
    "Resize PNG, JPG, and WebP images locally with precise dimensions and aspect-ratio controls.",
  path: "/resize-image",
})

const tool = getToolDefinition("/resize-image")

export default function ResizeImagePage() {
  return (
    <ToolPage
      title="Resize Images"
      description="Upload a raster image, keep the aspect ratio locked if you want, and export a resized version locally without uploading anything."
      accent={tool.accent}
    >
      <ResizeImageTool />
    </ToolPage>
  )
}
