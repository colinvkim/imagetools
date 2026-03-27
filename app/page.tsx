import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, MonitorSmartphone, ShieldCheck, Sparkles, Zap } from "lucide-react"

import { PageShell } from "@/components/site/page-shell"
import { TOOL_DEFINITIONS } from "@/components/site/tool-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
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
  title: "imagetools | free, client-side utilities",
  description:
    "Resize images, convert files, crop assets, trim transparent pixels, and rasterize artwork directly in your browser.",
})

export default function Page() {
  const toolCountLabel = `${TOOL_DEFINITIONS.length} tools available`

  return (
    <main id="main-content">
      <PageShell className="gap-10 py-10 sm:py-12">
        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">{toolCountLabel}</Badge>
            <Badge variant="outline">100% client-side</Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.82fr)] lg:items-center">
            <div className="flex min-w-0 flex-col gap-6">
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
                  Open SVG Export
                </Button>
              </div>
            </div>

            <Card className="rounded-[1.75rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]">
              <CardHeader className="gap-4">
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
              Tools
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight">
              {TOOL_DEFINITIONS.length} focused utilities, one consistent
              workflow
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Every tool follows the same idea: drop in a file, preview the
              result, adjust only what matters, and export immediately.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {TOOL_DEFINITIONS.map((tool) => {
              const Icon = tool.icon

              return (
                <Link key={tool.href} href={tool.href} className="group block">
                  <Card className="h-full rounded-[1.75rem] border-border/70 bg-card/85 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.35)] transition-[transform,box-shadow] group-hover:-translate-y-0.5 group-hover:ring-1 group-hover:ring-ring/40 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                          <Icon className="size-5 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{tool.title}</CardTitle>
                      <CardDescription className="line-clamp-3 leading-6">
                        {tool.shortDescription}
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
              <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <CardTitle>Privacy-First</CardTitle>
              <CardDescription className="leading-6">
                Core workflows stay client-side, so common conversions and
                cleanup tasks do not require file uploads.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-[1.5rem] border-border/70 bg-card/80">
            <CardHeader>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                <Zap className="size-5 text-primary" />
              </div>
              <CardTitle>Quick One-Off Tasks</CardTitle>
              <CardDescription className="leading-6">
                Open a tool, adjust the one thing that matters, and export the
                result without a long editing workflow.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-[1.5rem] border-border/70 bg-card/80">
            <CardHeader>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                <MonitorSmartphone className="size-5 text-primary" />
              </div>
              <CardTitle>Desktop & Mobile</CardTitle>
              <CardDescription className="leading-6">
                The interface is designed to stay usable across desktop and
                mobile browsers without changing the core flow.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </PageShell>
    </main>
  )
}
