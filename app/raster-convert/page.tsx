import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { getToolDefinition } from "@/components/site/tool-data"
import { RasterConvertTool } from "@/components/tools/raster-convert-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Convert Images",
  description:
    "Free browser-based image converter for PNG, JPG, and WebP files with local processing and instant PNG or WebP downloads.",
  path: "/raster-convert",
})

const tool = getToolDefinition("/raster-convert")

export default function RasterConvertPage() {
  return (
    <ToolPage
      title="Convert Raster Images"
      description="Convert PNG, JPG, and WebP images locally with instant preview and direct PNG or WebP downloads."
      path="/raster-convert"
      accent={tool.accent}
    >
      <RasterConvertTool />
    </ToolPage>
  )
}
