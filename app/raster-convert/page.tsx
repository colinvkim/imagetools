import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { getToolDefinition } from "@/components/site/tool-data"
import { RasterConvertTool } from "@/components/tools/raster-convert-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Convert PNG, JPG, and WebP Images",
  description:
    "Convert PNG, JPG, and WebP images into PNG or WebP files locally with instant preview and direct download.",
  path: "/raster-convert",
})

const tool = getToolDefinition("/raster-convert")

export default function RasterConvertPage() {
  return (
    <ToolPage
      title="Convert Raster Images"
      description="Convert PNG, JPG, and WebP images locally with instant preview and direct PNG or WebP downloads."
      accent={tool.accent}
    >
      <RasterConvertTool />
    </ToolPage>
  )
}
