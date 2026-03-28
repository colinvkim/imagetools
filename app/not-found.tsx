import type { Metadata } from "next"
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

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <PageShell className="py-12">
      <Card className="rounded-[1.5rem] border bg-card shadow-sm">
        <CardHeader className="gap-4">
          <Badge variant="outline" className="self-start">
            Not Found
          </Badge>
          <div className="space-y-2">
            <CardTitle className="text-3xl tracking-tight">
              That Page Does Not Exist.
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
              Circle Crop, Rounded Corners, Image Converter, and SVG to PNG
              Converter are all available right now.
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/" />}>
              Back to Home
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/circle-crop" />}
            >
              Open Circle Crop
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
