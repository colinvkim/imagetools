import type { CSSProperties } from "react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

type PageHeroProps = {
  badge?: string
  title: string
  description: string
  icon?: LucideIcon
  accent?: string
}

export function PageHero({
  badge = "imagetools",
  title,
  description,
  icon: Icon,
  accent,
}: PageHeroProps) {
  const heroStyle = {
    "--tool-accent": accent,
  } as CSSProperties

  return (
    <header
      className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-6 shadow-sm sm:px-8 sm:py-8"
      style={heroStyle}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, var(--tool-accent, oklch(0.74 0.09 248 / 0.18)), transparent 60%)",
        }}
      />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          {Icon ? (
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-background/85 text-primary shadow-sm backdrop-blur-sm">
              <Icon aria-hidden="true" className="size-6" />
            </div>
          ) : null}
          <Badge
            variant="outline"
            className="rounded-full border-border/70 bg-background/80 px-3 py-1 backdrop-blur-sm"
          >
            {badge}
          </Badge>
        </div>
        <div className="space-y-3">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>
      </div>
    </header>
  )
}
