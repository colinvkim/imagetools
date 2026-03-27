import Link from "next/link"

import { PageShell } from "@/components/site/page-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NotFound() {
  return (
    <main id="main-content">
      <PageShell className="py-12">
        <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]">
          <CardHeader className="gap-4">
            <Badge variant="outline" className="self-start">
              Not Found
            </Badge>
            <div className="space-y-2">
              <CardTitle className="text-3xl tracking-tight">
                That page doesn&apos;t exist.
              </CardTitle>
              <CardDescription className="max-w-2xl leading-6">
                The route may have changed, or the link may be broken. The core
                image tools are still available from the homepage and top
                navigation.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert>
              <AlertTitle>Try a live tool instead</AlertTitle>
              <AlertDescription>
                Circle Crop, Rounded Corners, Raster Convert, and SVG Export are
                all available right now.
              </AlertDescription>
            </Alert>
            <div className="flex flex-wrap gap-3">
              <Button render={<Link href="/" />}>Back to Home</Button>
              <Button variant="outline" render={<Link href="/circle-crop" />}>
                Open Circle Crop
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </main>
  )
}
