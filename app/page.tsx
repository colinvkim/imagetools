import type { Metadata } from "next"
import type { CSSProperties } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

import { PageShell } from "@/components/site/page-shell"
import { TOOL_DEFINITIONS } from "@/components/site/tool-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createPageMetadata, getCanonicalUrl } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Home | imagetools",
  description:
    "Free, open-source image tools for resizing, cropping, converting, trimming transparent pixels, and rasterizing SVGs directly in your browser.",
  path: "/",
  keywords: [
    "browser image tools",
    "free online image editor",
    "private image converter",
  ],
})

const highlights = [
  "Runs on-device for the core tool flows.",
  "Works well on desktop and mobile.",
  "Focused tools with a consistent workflow.",
] as const

export default function Page() {
  const toolCountLabel = `${TOOL_DEFINITIONS.length} tools available`
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free Open-Source Image Tools",
    description:
      "A collection of free, open-source image utilities for resizing, converting, cropping, and cleaning up files directly in the browser.",
    url: getCanonicalUrl("/"),
    hasPart: TOOL_DEFINITIONS.map((tool) => ({
      "@type": "SoftwareApplication",
      name: tool.title,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      description: tool.description,
      url: getCanonicalUrl(tool.href),
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    })),
  }

  return (
    <PageShell className="gap-10 py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">{toolCountLabel}</Badge>
            <Badge variant="outline">Runs locally</Badge>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Fast image tools that work directly in your browser.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Resize, crop, convert, and clean up images without sending them to
              a server. Open a tool, make the change, and export what you need.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/resize-image" />}
            >
              <Sparkles aria-hidden="true" data-icon="inline-start" />
              Open Resize Image
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<Link href="/circle-crop" />}
            >
              <ArrowRight aria-hidden="true" data-icon="inline-start" />
              Open Circle Crop
            </Button>
          </div>

          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {highlights.map((item) => (
              <li key={item} className="rounded-xl border bg-card px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* <Card className="rounded-[1.5rem] border bg-card shadow-sm">
          <CardHeader className="gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
              <CardTitle className="text-xl">Files Stay Local</CardTitle>
            </div>
            <CardDescription className="leading-6">
              The core tool flows run on-device, so common edits stay private
              and feel fast.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle>Simple workflow</AlertTitle>
              <AlertDescription>
                Choose a tool, drop in a file, preview the result, and export
                immediately.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card> */}
      </section>

      <Separator />

      <section className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Tools
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Each tool handles one common image task with a consistent,
            low-friction workflow.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TOOL_DEFINITIONS.map((tool) => {
            const Icon = tool.icon
            const cardStyle = {
              "--tool-accent": tool.accent,
            } as CSSProperties

            return (
              <Card
                key={tool.href}
                className="group relative h-full overflow-hidden rounded-[1.5rem] border bg-card shadow-sm transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                style={cardStyle}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-100"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at top left, var(--tool-accent), transparent 62%)",
                  }}
                />
                <CardHeader className="relative gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/85 shadow-sm backdrop-blur-sm">
                    <Icon aria-hidden="true" className="size-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription className="line-clamp-3 leading-6">
                      {tool.shortDescription}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    nativeButton={false}
                    render={<Link href={tool.href} />}
                  >
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </PageShell>
  )
}
