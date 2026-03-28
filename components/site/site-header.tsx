"use client"

/* eslint-disable @next/next/no-html-link-for-pages */
import { usePathname } from "next/navigation"

import { TOOL_DEFINITIONS } from "@/components/site/tool-data"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <a
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            style={{ viewTransitionName: "site-brand" }}
          >
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-tight text-foreground">
                imagetools
              </div>
              <div className="text-sm text-muted-foreground">
                Fast image utilities that run on-device.
              </div>
            </div>
          </a>

          <ThemeToggle />
        </div>

        <nav aria-label="Primary navigation">
          <ScrollArea className="-mx-1 w-[calc(100%+0.5rem)] pb-1">
            <div className="flex min-w-max items-center gap-2 px-1">
              <a
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  pathname === "/"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                style={
                  pathname === "/"
                    ? { viewTransitionName: "active-nav-pill" }
                    : undefined
                }
              >
                Home
              </a>
              {TOOL_DEFINITIONS.map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  aria-current={pathname === tool.href ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    pathname === tool.href
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  style={
                    pathname === tool.href
                      ? { viewTransitionName: "active-nav-pill" }
                      : undefined
                  }
                >
                  {tool.title}
                </a>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </nav>
      </div>
    </header>
  )
}
