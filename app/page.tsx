import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react"

import { PageShell } from "@/components/site/page-shell"
import { TOOL_DEFINITIONS } from "@/components/site/tool-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { createPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Fast, client-side image tools",
  description:
    "Convert files, circle-crop images, add rounded corners, and rasterize assets directly in your browser.",
})

export default function Page() {
  return (
    <main>
      <PageShell className="gap-10 py-10 sm:py-12">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">4 tools live</Badge>
            <Badge variant="outline">100% client-side</Badge>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.8fr)] lg:items-end">
            <div className="flex flex-col gap-5">
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Fast image tools that work right in your browser.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Convert files, crop images, and shape assets without sending
                  them to a server. Open a tool, drop in a file, and export what
                  you need.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" render={<Link href="/circle-crop" />}>
                  <Sparkles data-icon="inline-start" />
                  Try Circle Crop
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  render={<Link href="/svg-to-png" />}
                >
                  <ArrowRight data-icon="inline-start" />
                  Open SVG to PNG
                </Button>
              </div>
            </div>

            <Card className="rounded-[1.75rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]">
              <CardHeader>
                <Badge variant="outline" className="self-start">
                  Privacy
                </Badge>
                <CardTitle className="text-2xl">
                  Files stay on your device
                </CardTitle>
                <CardDescription className="leading-6">
                  The current tool flows run entirely client-side, so common
                  conversions and crops do not require uploading your images.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <ShieldCheck />
                  <AlertTitle>Built for quick, local work</AlertTitle>
                  <AlertDescription>
                    Open a tool, process a file, and export it directly from the
                    browser with minimal friction.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="self-start">
              Live tools
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight">
              Four focused utilities, one consistent workflow
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Every tool follows the same idea: drop in a file, preview the
              result, adjust only what matters, and export immediately.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TOOL_DEFINITIONS.map((tool) => {
              const Icon = tool.icon

              return (
                <Link key={tool.href} href={tool.href} className="group block">
                  <Card className="h-full rounded-[1.75rem] border-border/70 bg-card/85 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.35)] transition group-hover:-translate-y-0.5 group-hover:ring-1 group-hover:ring-ring/40">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                          <Icon className="size-5 text-primary" />
                        </div>
                        <CardAction>
                          <Badge>Live</Badge>
                        </CardAction>
                      </div>
                      <CardTitle className="text-xl">{tool.title}</CardTitle>
                      <CardDescription className="leading-6">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="text-sm text-muted-foreground">
                      Open tool
                    </CardFooter>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-[1.5rem] border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Shared shell</CardTitle>
              <CardDescription className="leading-6">
                Every tool page now sits inside the same navigation, spacing,
                and footer structure.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-[1.5rem] border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Clear messaging</CardTitle>
              <CardDescription className="leading-6">
                The homepage explains what the product does, why it is useful,
                and why client-side processing matters.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-[1.5rem] border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle>Lightweight about/help</CardTitle>
              <CardDescription className="leading-6">
                The footer now gives quick context around privacy, current
                scope, and where to jump next.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </PageShell>
    </main>
  )
}
