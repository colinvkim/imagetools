import type { Metadata } from "next"

import { getToolDefinition } from "@/components/site/tool-data"
import { RoundedCornersTool } from "@/components/tools/rounded-corners-tool"
import { ToolPage } from "@/components/site/tool-page"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Rounded Corners",
  description:
    "Add rounded corners to any image, optionally crop it, and export a transparent PNG in the browser.",
})

const tool = getToolDefinition("/rounded-corners")

export default function RoundedCornersPage() {
  return (
    <ToolPage
      badge={tool.title}
      title="Add Rounded Corners to Images"
      description="Crop if you want to, keep the original aspect ratio if you don’t, and export a transparent PNG entirely in the browser."
      icon={tool.icon}
      transitionName={tool.transitionName}
      accent={tool.accent}
    >
      <RoundedCornersTool />
    </ToolPage>
  )
}
