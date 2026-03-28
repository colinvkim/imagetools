import type { Metadata } from "next"

import { ToolPage } from "@/components/site/tool-page"
import { getToolDefinition } from "@/components/site/tool-data"
import { CircleCropTool } from "@/components/tools/circle-crop-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Circle Crop",
  description:
    "Square-crop an image, preview the result, and export a transparent circular PNG locally.",
})

const tool = getToolDefinition("/circle-crop")

export default function CircleCropPage() {
  return (
    <ToolPage
      title="Circle-Crop Images"
      description="Position a square crop in the dialog, preview the result, and export a crisp circular image entirely in the browser."
      transitionName={tool.transitionName}
      accent={tool.accent}
    >
      <CircleCropTool />
    </ToolPage>
  )
}
