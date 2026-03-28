import { type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { Separator } from "@/components/ui/separator"

type ToolPageProps = {
  badge?: string
  title: string
  description: string
  icon?: LucideIcon
  transitionName?: string
  accent?: string
  children: ReactNode
}

export function ToolPage({
  badge,
  title,
  description,
  icon,
  transitionName,
  accent,
  children,
}: ToolPageProps) {
  return (
    <PageShell className="py-8 sm:py-10">
      <PageHero
        badge={badge}
        title={title}
        description={description}
        icon={icon}
        transitionName={transitionName}
        accent={accent}
      />
      <Separator />
      {children}
    </PageShell>
  )
}
