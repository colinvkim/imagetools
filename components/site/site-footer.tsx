import Link from "next/link"

import { TOOL_DEFINITIONS } from "@/components/site/tool-data"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Badge variant="outline" className="self-start">
              imagetools
            </Badge>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              A compact set of image utilities built for quick one-off tasks.
              The core promise is simple: your files stay on your device.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">Live tools</h2>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {TOOL_DEFINITIONS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="hover:text-foreground"
                >
                  {tool.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">About</h2>
            <div className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
              <p>No uploads for the core tool flows.</p>
              <p>Built for desktop and mobile browsers.</p>
              <p>Focused on fast export with minimal friction.</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Client-side image tools for everyday cleanup, conversion, and
            shaping.
          </p>
          <p>Privacy-forward by design.</p>
        </div>
      </div>
    </footer>
  )
}
