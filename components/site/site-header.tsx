"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { TOOL_DEFINITIONS } from "@/components/site/tool-data"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="rounded-2xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm">
              <span className="text-sm font-semibold tracking-tight">
                imagetools
              </span>
            </div>
            <Badge variant="outline">All client-side</Badge>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-muted-foreground lg:block">
              Fast image utilities that keep files on your device.
            </div>
            <ThemeToggle />
          </div>
        </div>

        <nav aria-label="Primary navigation">
          <ScrollArea className="-mx-1 w-[calc(100%+0.5rem)] pb-1">
            <div className="flex min-w-max items-center gap-2 px-1">
              <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
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
                  aria-current={pathname === tool.href ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    pathname === tool.href
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {tool.title}
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </nav>
      </div>
    </header>
  )
}
