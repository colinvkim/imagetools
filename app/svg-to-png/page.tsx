import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { Separator } from "@/components/ui/separator"
import { SvgToPngTool } from "@/components/tools/svg-to-png-tool"

export default function SvgToPngPage() {
  return (
    <main>
      <PageShell>
        <PageHero
          title="Convert SVGs into PNGs at the exact size you need"
          description="Upload vector artwork, choose an export width, and rasterize it locally without a server round-trip."
        />
        <Separator />
        <SvgToPngTool />
      </PageShell>
    </main>
  )
}
