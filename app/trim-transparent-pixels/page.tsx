import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { getToolDefinition } from "@/components/site/tool-data"
import { TrimTransparentPixelsTool } from "@/components/tools/trim-transparent-pixels-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Trim Transparent Pixels",
  description:
    "Auto-crop transparent padding from PNG and WebP images locally by detecting the visible bounds in the browser.",
})

const tool = getToolDefinition("/trim-transparent-pixels")

export default function TrimTransparentPixelsPage() {
  return (
    <ToolPage
      title="Trim Transparent Padding from Images"
      description="Upload a transparent PNG or WebP image and imagetools will detect the visible bounds, preview the tighter crop, and export the result locally."
      accent={tool.accent}
    >
      <TrimTransparentPixelsTool />
    </ToolPage>
  )
}
