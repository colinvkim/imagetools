import { type ReactNode } from "react"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { Separator } from "@/components/ui/separator"

type ToolPageProps = {
  title: string
  description: string
  accent?: string
  children: ReactNode
}

export function ToolPage({
  title,
  description,
  accent,
  children,
}: ToolPageProps) {
  return (
    <PageShell className="py-8 sm:py-10">
      <PageHero title={title} description={description} accent={accent} />
      <Separator />
      {children}
    </PageShell>
  )
}
