import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { getToolDefinition } from "@/components/site/tool-data"
import { CircleCropTool } from "@/components/tools/circle-crop-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Circle Crop Images",
  description:
    "Free browser-based circle crop tool that crops an image to a circle and exports a transparent PNG locally.",
  path: "/circle-crop",
})

const tool = getToolDefinition("/circle-crop")

export default function CircleCropPage() {
  return (
    <ToolPage
      title="Circle-Crop Images"
      description="Position a square crop in the dialog, preview the result, and export a crisp circular image entirely in the browser."
      path="/circle-crop"
      accent={tool.accent}
    >
      <CircleCropTool />
    </ToolPage>
  )
}
