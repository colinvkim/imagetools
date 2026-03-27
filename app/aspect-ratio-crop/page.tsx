import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { AspectRatioCropTool } from "@/components/tools/aspect-ratio-crop-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Aspect Ratio Crop",
  description:
    "Crop PNG, JPG, and WebP images locally with preset aspect ratios like 1:1, 4:5, 3:2, and 16:9.",
})

export default function AspectRatioCropPage() {
  return (
    <ToolPage
      title="Crop images to 1:1, 4:5, 3:2, 16:9, or any custom frame"
      description="Upload a raster image, choose a preset aspect ratio or go freeform, and export the cropped result locally without uploading anything."
    >
      <AspectRatioCropTool />
    </ToolPage>
  )
}
