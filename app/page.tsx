import Link from "next/link"
import { ArrowRight, CircleDashed, FileImage, ScanFace } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function Page() {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.1),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] px-4 py-10 sm:px-6 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(13,148,136,0.18),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.98),rgba(15,23,42,0.96))]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="space-y-4">
          <Badge variant="outline">imagetools</Badge>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              A growing set of image tools that run entirely on your device
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              We&apos;re building the tools first. The homepage can get more
              polished later, but the conversion workflow is already live.
            </p>
          </div>
          <Link
            href="/webp-to-png"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Open WebP to PNG
            <ArrowRight className="size-4" />
          </Link>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/webp-to-png" className="group block">
            <Card className="h-full rounded-[1.75rem] border-border/70 bg-card/85 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.35)] transition group-hover:-translate-y-0.5 group-hover:ring-1 group-hover:ring-ring/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                    <FileImage className="size-5 text-primary" />
                  </div>
                  <Badge>Live</Badge>
                </div>
                <CardTitle className="text-xl">WebP to PNG</CardTitle>
                <CardDescription className="leading-6">
                  Upload a WebP, inspect it, and export a PNG without touching a
                  server.
                </CardDescription>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Open tool
              </CardFooter>
            </Card>
          </Link>

          <Link href="/circle-crop" className="group block">
            <Card className="h-full rounded-[1.75rem] border-border/70 bg-card/85 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.35)] transition group-hover:-translate-y-0.5 group-hover:ring-1 group-hover:ring-ring/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                    <CircleDashed className="size-5 text-primary" />
                  </div>
                  <Badge>Live</Badge>
                </div>
                <CardTitle className="text-xl">Circle Crop</CardTitle>
                <CardDescription className="leading-6">
                  Square crop first, then render a transparent PNG circle with a
                  reusable editor flow.
                </CardDescription>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Open tool
              </CardFooter>
            </Card>
          </Link>

          <Link href="/rounded-corners" className="group block">
            <Card className="h-full rounded-[1.75rem] border-border/70 bg-card/85 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.35)] transition group-hover:-translate-y-0.5 group-hover:ring-1 group-hover:ring-ring/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                    <ScanFace className="size-5 text-primary" />
                  </div>
                  <Badge>Live</Badge>
                </div>
                <CardTitle className="text-xl">Rounded Corners</CardTitle>
                <CardDescription className="leading-6">
                  Apply preset or custom border radii with the same reusable
                  crop editor flow.
                </CardDescription>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Open tool
              </CardFooter>
            </Card>
          </Link>

          <Link href="/svg-to-png" className="group block">
            <Card className="h-full rounded-[1.75rem] border-border/70 bg-card/85 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.35)] transition group-hover:-translate-y-0.5 group-hover:ring-1 group-hover:ring-ring/40">
              <CardHeader>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                  <FileImage className="size-5 text-primary" />
                </div>
                <CardTitle className="text-xl">SVG to PNG</CardTitle>
                <CardDescription className="leading-6">
                  Rasterize SVGs client-side and choose the output size before
                  export.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge>Live</Badge>
              </CardFooter>
            </Card>
          </Link>
        </section>
      </div>
    </main>
  )
}
