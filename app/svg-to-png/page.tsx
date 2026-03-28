import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { getToolDefinition } from "@/components/site/tool-data"
import { SvgToPngTool } from "@/components/tools/svg-to-png-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "SVG Export",
  description:
    "Rasterize SVG artwork into PNG or WebP files at the size you choose without leaving the browser.",
})

const tool = getToolDefinition("/svg-to-png")

export default function SvgToPngPage() {
  return (
    <ToolPage
      badge={tool.title}
      title="Export SVGs as PNG or WebP"
      description="Upload vector artwork, choose an export format and width, and rasterize it locally without a server round-trip."
      icon={tool.icon}
      transitionName={tool.transitionName}
      accent={tool.accent}
    >
      <SvgToPngTool />
    </ToolPage>
  )
}
