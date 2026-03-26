import type { Metadata } from "next"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { ResizeImageTool } from "@/components/tools/resize-image-tool"
import { Separator } from "@/components/ui/separator"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Resize Image",
  description:
    "Resize PNG, JPG, and WebP images locally with precise dimensions and aspect-ratio controls.",
})

export default function ResizeImagePage() {
  return (
    <main>
      <PageShell>
        <PageHero
          title="Resize images with exact dimensions and quick scale presets"
          description="Upload a raster image, keep the aspect ratio locked if you want, and export a resized version locally without uploading anything."
        />
        <Separator />
        <ResizeImageTool />
      </PageShell>
    </main>
  )
}
