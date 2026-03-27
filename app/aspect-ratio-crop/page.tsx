import type { Metadata } from "next"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { AspectRatioCropTool } from "@/components/tools/aspect-ratio-crop-tool"
import { Separator } from "@/components/ui/separator"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Aspect Ratio Crop",
  description:
    "Crop PNG, JPG, and WebP images locally with preset aspect ratios like 1:1, 4:5, 3:2, and 16:9.",
})

export default function AspectRatioCropPage() {
  return (
    <main>
      <PageShell>
        <PageHero
          title="Crop images to 1:1, 4:5, 3:2, 16:9, or any custom frame"
          description="Upload a raster image, choose a preset aspect ratio or go freeform, and export the cropped result locally without uploading anything."
        />
        <Separator />
        <AspectRatioCropTool />
      </PageShell>
    </main>
  )
}
