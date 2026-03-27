import type { Metadata } from "next"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { WebpToPngTool } from "@/components/tools/webp-to-png-tool"
import { Separator } from "@/components/ui/separator"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Raster Convert",
  description:
    "Convert PNG, JPG, and WebP images into PNG or WebP files locally with instant preview and direct download.",
})

export default function WebpToPngPage() {
  return (
    <main>
      <PageShell>
        <PageHero
          title="Fast raster image conversion, fully in the browser"
          description="Convert PNG, JPG, and WebP images locally with instant preview and direct PNG or WebP downloads."
        />
        <Separator />
        <WebpToPngTool />
      </PageShell>
    </main>
  )
}
