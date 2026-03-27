import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { RasterConvertTool } from "@/components/tools/raster-convert-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Raster Convert",
  description:
    "Convert PNG, JPG, and WebP images into PNG or WebP files locally with instant preview and direct download.",
})

export default function RasterConvertPage() {
  return (
    <ToolPage
      title="Fast raster image conversion, fully in the browser"
      description="Convert PNG, JPG, and WebP images locally with instant preview and direct PNG or WebP downloads."
    >
      <RasterConvertTool />
    </ToolPage>
  )
}
