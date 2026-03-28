"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { TOOL_DEFINITIONS } from "@/components/site/tool-data"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type NavItemProps = {
  href: string
  label: string
  isActive: boolean
  itemRef?: React.Ref<HTMLAnchorElement>
}

function NavItem({ href, label, isActive, itemRef }: NavItemProps) {
  return (
    <Link
      ref={itemRef}
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative isolate rounded-full px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isActive
          ? "z-20 text-background [-webkit-text-fill-color:var(--background)]"
          : "z-10 text-muted-foreground group-hover:text-foreground group-focus-visible:text-foreground [-webkit-text-fill-color:currentColor]"
      )}
    >
      {!isActive ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-full bg-muted opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      ) : null}
      <span className="relative z-20">{label}</span>
    </Link>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const navListRef = React.useRef<HTMLDivElement>(null)
  const activeItemRef = React.useRef<HTMLAnchorElement>(null)
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    width: 0,
    x: 0,
    ready: false,
  })

  const updateIndicator = React.useCallback(() => {
    const navList = navListRef.current
    const activeItem = activeItemRef.current

    if (!navList || !activeItem) {
      setIndicatorStyle((current) =>
        current.ready ? { width: 0, x: 0, ready: false } : current
      )
      return
    }

    const navRect = navList.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()

    setIndicatorStyle({
      width: itemRect.width,
      x: itemRect.left - navRect.left,
      ready: true,
    })
  }, [])

  React.useLayoutEffect(() => {
    updateIndicator()
  }, [pathname, updateIndicator])

  React.useEffect(() => {
    const navList = navListRef.current
    const activeItem = activeItemRef.current

    if (!navList || !activeItem) {
      return
    }

    const handleChange = () => updateIndicator()
    const resizeObserver = new ResizeObserver(handleChange)

    resizeObserver.observe(navList)
    resizeObserver.observe(activeItem)
    window.addEventListener("resize", handleChange)
    navList.addEventListener("scroll", handleChange, { passive: true })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", handleChange)
      navList.removeEventListener("scroll", handleChange)
    }
  }, [pathname, updateIndicator])

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-tight text-foreground">
                imagetools
              </div>
              <div className="text-sm text-muted-foreground">
                Fast image utilities that run on-device.
              </div>
            </div>
          </Link>

          <ThemeToggle />
        </div>

        <nav aria-label="Primary navigation">
          <ScrollArea className="site-header-nav-scrollarea -mx-1 w-[calc(100%+0.5rem)] pb-1">
            <div
              ref={navListRef}
              className="relative isolate flex min-w-max items-center gap-2 px-1"
            >
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute top-0 bottom-0 left-0 z-0 rounded-full bg-foreground transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)]",
                  indicatorStyle.ready ? "opacity-100" : "opacity-0"
                )}
                style={{
                  width: `${indicatorStyle.width}px`,
                  transform: `translateX(${indicatorStyle.x}px)`,
                }}
              />
              <NavItem
                href="/"
                label="Home"
                isActive={pathname === "/"}
                itemRef={pathname === "/" ? activeItemRef : undefined}
              />
              {TOOL_DEFINITIONS.map((tool) => (
                <NavItem
                  key={tool.href}
                  href={tool.href}
                  label={tool.title}
                  isActive={pathname === tool.href}
                  itemRef={pathname === tool.href ? activeItemRef : undefined}
                />
              ))}
            </div>
            <ScrollBar
              orientation="horizontal"
              className="site-header-nav-scrollbar"
            />
          </ScrollArea>
        </nav>
      </div>
    </header>
  )
}
