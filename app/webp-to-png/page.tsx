import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { WebpToPngTool } from "@/components/tools/webp-to-png-tool"
import { Separator } from "@/components/ui/separator"

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
