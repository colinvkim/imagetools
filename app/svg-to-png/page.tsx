import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SvgToPngTool } from "@/components/tools/svg-to-png-tool"

export default function SvgToPngPage() {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] px-4 py-8 sm:px-6 sm:py-10 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.28),transparent_28%),radial-gradient(circle_at_top_right,rgba(15,118,110,0.24),transparent_24%),linear-gradient(to_bottom,rgba(2,6,23,0.98),rgba(15,23,42,0.96))]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3 px-2">
          <Badge variant="outline">imagetools</Badge>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Convert SVGs into PNGs at the exact size you need
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              Upload vector artwork, choose an export width, and rasterize it
              locally without a server round-trip.
            </p>
          </div>
        </header>

        <Separator />

        <SvgToPngTool />
      </div>
    </main>
  )
}
