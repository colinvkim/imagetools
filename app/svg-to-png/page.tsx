import type { Metadata } from "next"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { Separator } from "@/components/ui/separator"
import { SvgToPngTool } from "@/components/tools/svg-to-png-tool"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "SVG Export",
  description:
    "Rasterize SVG artwork into PNG or WebP files at the size you choose without leaving the browser.",
})

export default function SvgToPngPage() {
  return (
    <main>
      <PageShell>
        <PageHero
          title="Export SVGs as PNG or WebP at the exact size you need"
          description="Upload vector artwork, choose an export format and width, and rasterize it locally without a server round-trip."
        />
        <Separator />
        <SvgToPngTool />
      </PageShell>
    </main>
  )
}
