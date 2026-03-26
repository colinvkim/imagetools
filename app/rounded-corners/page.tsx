import type { Metadata } from "next"

import { RoundedCornersTool } from "@/components/tools/rounded-corners-tool"
import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { Separator } from "@/components/ui/separator"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Rounded Corners",
  description:
    "Add rounded corners to any image, optionally crop it, and export a transparent PNG in the browser.",
})

export default function RoundedCornersPage() {
  return (
    <main>
      <PageShell>
        <PageHero
          title="Add rounded corners with presets or a custom radius"
          description="Crop if you want to, keep the original aspect ratio if you don’t, and export a transparent PNG entirely in the browser."
        />
        <Separator />
        <RoundedCornersTool />
      </PageShell>
    </main>
  )
}
