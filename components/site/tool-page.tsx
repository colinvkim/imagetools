import { type ReactNode } from "react"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { Separator } from "@/components/ui/separator"

type ToolPageProps = {
  title: string
  description: string
  children: ReactNode
}

export function ToolPage({ title, description, children }: ToolPageProps) {
  return (
    <main id="main-content">
      <PageShell>
        <PageHero title={title} description={description} />
        <Separator />
        {children}
      </PageShell>
    </main>
  )
}
