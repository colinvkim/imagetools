"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { TOOL_DEFINITIONS } from "@/components/site/tool-data"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm">
              <span className="text-sm font-semibold tracking-tight">
                imagetools
              </span>
            </div>
            <Badge variant="outline">All client-side</Badge>
          </Link>

          <div className="hidden text-sm text-muted-foreground lg:block">
            Fast image utilities that keep files on your device.
          </div>
        </div>

        <nav className="-mx-1 overflow-x-auto pb-1">
          <div className="flex min-w-max items-center gap-2 px-1">
            <Link
              href="/"
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition",
                pathname === "/"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Home
            </Link>
            {TOOL_DEFINITIONS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition",
                  pathname === tool.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tool.title}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
