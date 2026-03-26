import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { Separator } from "@/components/ui/separator"
import { CircleCropTool } from "@/components/tools/circle-crop-tool"

export default function CircleCropPage() {
  return (
    <main>
      <PageShell>
        <PageHero
          title="Circle-crop images with a square editor and transparent PNG output"
          description="Position a square crop in the dialog, preview the result, and export a crisp circular image entirely in the browser."
        />
        <Separator />
        <CircleCropTool />
      </PageShell>
    </main>
  )
}
