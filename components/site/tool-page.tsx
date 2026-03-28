import { type ReactNode } from "react"

import { PageHero } from "@/components/site/page-hero"
import { PageShell } from "@/components/site/page-shell"
import { Separator } from "@/components/ui/separator"
import { createToolStructuredData } from "@/lib/site-metadata"

type ToolPageProps = {
  title: string
  description: string
  path: string
  accent?: string
  children: ReactNode
}

export function ToolPage({
  title,
  description,
  path,
  accent,
  children,
}: ToolPageProps) {
  const structuredData = createToolStructuredData({
    title,
    description,
    path,
  })

  return (
    <PageShell className="py-8 sm:py-10">
      <script
        id={`structured-data-${path.replaceAll("/", "-") || "home"}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <PageHero title={title} description={description} accent={accent} />
      <Separator />
      {children}
    </PageShell>
  )
}
