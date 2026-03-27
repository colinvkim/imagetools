import type { Metadata } from "next"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { TrimTransparentPixelsTool } from "@/components/tools/trim-transparent-pixels-tool"
import { Separator } from "@/components/ui/separator"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Trim Transparent Pixels",
  description:
    "Auto-crop transparent padding from PNG and WebP images locally by detecting the visible bounds in the browser.",
})

export default function TrimTransparentPixelsPage() {
  return (
    <main>
      <PageShell>
        <PageHero
          title="Trim transparent padding from logos, icons, and stickers"
          description="Upload a transparent PNG or WebP image and imagetools will detect the visible bounds, preview the tighter crop, and export the result locally."
        />
        <Separator />
        <TrimTransparentPixelsTool />
      </PageShell>
    </main>
  )
}
