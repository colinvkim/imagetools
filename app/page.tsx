import Link from "next/link"
import { ArrowRight, CircleDashed, FileImage, ScanFace } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.1),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] px-4 py-10 sm:px-6 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(13,148,136,0.18),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.98),rgba(15,23,42,0.96))]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="space-y-4">
          <p className="text-sm font-medium tracking-[0.22em] text-sky-700 uppercase dark:text-sky-300">
            imagetools
          </p>
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/webp-to-png"
            className="group rounded-[1.75rem] border border-border/70 bg-card/85 p-6 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-sky-400/60"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                <FileImage className="size-5 text-sky-600 dark:text-sky-300" />
              </div>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Live
              </span>
            </div>
            <h2 className="mt-5 text-xl font-semibold">WebP to PNG</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload a WebP, inspect it, and export a PNG without touching a
              server.
            </p>
          </Link>

          <div className="rounded-[1.75rem] border border-border/70 bg-card/70 p-6">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
              <CircleDashed className="size-5 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">Circle Crop</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Square crop first, then render as a transparent PNG circle.
            </p>
            <p className="mt-4 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Next up
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border/70 bg-card/70 p-6">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
              <ScanFace className="size-5 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">Rounded Corners</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Apply preset or custom border radii with a reusable editor flow.
            </p>
            <p className="mt-4 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Planned
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border/70 bg-card/70 p-6">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
              <FileImage className="size-5 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">SVG to PNG</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Rasterize SVGs client-side and let the user control the output
              size.
            </p>
            <p className="mt-4 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Planned
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
