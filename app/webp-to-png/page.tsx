import type { Metadata } from "next"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { WebpToPngTool } from "@/components/tools/webp-to-png-tool"
import { Separator } from "@/components/ui/separator"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "WebP to PNG",
  description:
    "Convert WebP images into PNG files locally with instant preview and direct download.",
})

export default function WebpToPngPage() {
  return (
    <main>
      <PageShell>
        <PageHero
          title="Fast WebP to PNG conversion, fully in the browser"
          description="Convert WebP images locally with instant preview and a direct PNG download."
        />
        <Separator />
        <WebpToPngTool />
      </PageShell>
    </main>
  )
}
