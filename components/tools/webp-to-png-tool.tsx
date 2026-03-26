"use client"

import * as React from "react"
import { Download, RefreshCcw } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { CheckerboardSurface } from "@/components/tools/shared/checkerboard-surface"
import { StatusAlert } from "@/components/tools/shared/status-alert"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Separator } from "@/components/ui/separator"
import { useImageUpload } from "@/hooks/use-image-upload"
import {
  canvasToBlob,
  downloadBlob,
  replaceFileExtension,
} from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
import { loadImageElement } from "@/lib/image/load-image"

export function WebpToPngTool() {
  const { image, error, isLoading, clear, selectFile } = useImageUpload({
    mimeTypes: ["image/webp"],
    extensions: [".webp"],
    enablePaste: true,
  })

  const [isConverting, setIsConverting] = React.useState(false)
  const [conversionError, setConversionError] = React.useState<string | null>(
    null
  )
  const [conversionSuccess, setConversionSuccess] = React.useState<
    string | null
  >(null)

  React.useEffect(() => {
    setConversionError(null)
    setConversionSuccess(null)
  }, [image])

  const handleConvert = async () => {
    if (!image) {
      return
    }

    setIsConverting(true)
    setConversionError(null)
    setConversionSuccess(null)

    try {
      const sourceImage = await loadImageElement(image.objectUrl)
      const canvas = document.createElement("canvas")
      canvas.width = image.width
      canvas.height = image.height

      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Canvas is not available in this browser.")
      }

      context.drawImage(sourceImage, 0, 0, image.width, image.height)

      const blob = await canvasToBlob(canvas, "image/png")
      downloadBlob(blob, replaceFileExtension(image.fileName, ".png"))
      setConversionSuccess("PNG download started successfully.")
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Conversion failed. Please try another file."

      setConversionError(message)
    } finally {
      setIsConverting(false)
    }
  }

  if (!image) {
    return (
      <FileDropzone
        title="Convert WebP files into PNGs"
        description="This first tool stays intentionally simple: choose a .webp image, preview it instantly, and export a PNG without uploading anything anywhere."
        accept=".webp,image/webp"
        helperText="No server round-trip. If your clipboard contains a WebP image, paste works too."
        isLoading={isLoading}
        error={error}
        supportsPaste
        onFileSelect={selectFile}
      />
    )
  }

  return (
    <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
      <CardHeader className="bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent">
        <Badge variant="outline" className="self-start">
          WebP to PNG
        </Badge>
        <CardTitle className="text-2xl tracking-tight">
          Preview, inspect, and export in one step
        </CardTitle>
        <CardDescription>
          Local conversion keeps the original pixel dimensions and never uploads
          the file to a server.
        </CardDescription>
        <CardAction>
          <Button variant="outline" onClick={clear}>
            <RefreshCcw data-icon="inline-start" />
            Choose another file
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-4">
          <CheckerboardSurface
            className="py-4"
            contentClassName="flex min-h-[18rem] items-center justify-center p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed with a native img element */}
            <img
              src={image.objectUrl}
              alt={`Preview of ${image.fileName}`}
              className="max-h-[28rem] w-auto max-w-full rounded-2xl shadow-sm"
            />
          </CheckerboardSurface>
          <Alert>
            <Download />
            <AlertTitle>Output behavior</AlertTitle>
            <AlertDescription>
              The PNG export keeps the same pixel dimensions as the original
              WebP.
            </AlertDescription>
          </Alert>
        </div>

        <Card className="rounded-[1.5rem] border-border/70 bg-background/65">
          <CardHeader>
            <CardTitle>File details</CardTitle>
            <CardDescription className="break-all">
              {image.fileName}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Width</CardDescription>
                  <CardTitle className="text-lg">{image.width}px</CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Height</CardDescription>
                  <CardTitle className="text-lg">{image.height}px</CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Input</CardDescription>
                  <CardTitle className="text-lg">WebP</CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Size</CardDescription>
                  <CardTitle className="text-lg">
                    {formatFileSize(image.fileSize)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Separator />

            <Alert>
              <Download />
              <AlertTitle>Output</AlertTitle>
              <AlertDescription>
                Exports as PNG with the same resolution as the uploaded file.
              </AlertDescription>
            </Alert>

            {conversionSuccess ? (
              <StatusAlert
                status="success"
                title="Download ready"
                message={conversionSuccess}
              />
            ) : null}

            {conversionError ? (
              <StatusAlert
                status="error"
                title="Conversion failed"
                message={conversionError}
              />
            ) : null}
          </CardContent>

          <CardFooter>
            <Button
              size="lg"
              className="w-full"
              disabled={isConverting}
              onClick={handleConvert}
            >
              <Download data-icon="inline-start" />
              {isConverting ? "Exporting PNG..." : "Download PNG"}
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  )
}
