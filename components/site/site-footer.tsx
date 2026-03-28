import Link from "next/link"

import { TOOL_DEFINITIONS } from "@/components/site/tool-data"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-foreground">
              imagetools
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Fast, client-side image utilities for conversion, cropping,
              cleanup, and export.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-foreground">Tools</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {TOOL_DEFINITIONS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="rounded-sm transition-colors hover:text-foreground focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {tool.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-foreground">About</h3>
            <div className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
              <p>No uploads for the core tool flows.</p>
              <p>Works on desktop and mobile browsers.</p>
              <p>
                Open-source and available on{" "}
                <Link
                  href="https://github.com/colinvkim/imagetools"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-sm underline underline-offset-4 transition-colors hover:text-foreground focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  GitHub
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Client-side image tools for everyday cleanup, conversion, and
            shaping.
          </p>
          <p>Privacy-first by default.</p>
        </div>
      </div>
    </footer>
  )
}
