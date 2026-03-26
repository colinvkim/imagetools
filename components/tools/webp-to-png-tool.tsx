"use client"

import * as React from "react"
import { Download, RefreshCcw } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { useImageUpload } from "@/hooks/use-image-upload"
import {
  canvasToBlob,
  downloadBlob,
  replaceFileExtension,
} from "@/lib/image/export"
import { loadImageElement } from "@/lib/image/load-image"

function formatFileSize(fileSize: number) {
  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)} KB`
  }

  return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
}

export function WebpToPngTool() {
  const { image, error, isLoading, clear, selectFile } = useImageUpload({
    mimeTypes: ["image/webp"],
    extensions: [".webp"],
  })

  const [isConverting, setIsConverting] = React.useState(false)
  const [conversionError, setConversionError] = React.useState<string | null>(
    null
  )

  const handleConvert = async () => {
    if (!image) {
      return
    }

    setIsConverting(true)
    setConversionError(null)

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
        helperText="No server round-trip. Your image never leaves the browser."
        isLoading={isLoading}
        error={error}
        onFileSelect={selectFile}
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="border-b border-border/70 bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
              WebP to PNG
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Preview, inspect, and export in one step
            </h2>
          </div>
          <Button variant="outline" onClick={clear}>
            <RefreshCcw className="size-4" />
            Choose another file
          </Button>
        </div>
      </div>

      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-border/70 bg-[linear-gradient(45deg,transparent_25%,rgba(148,163,184,0.08)_25%,rgba(148,163,184,0.08)_50%,transparent_50%,transparent_75%,rgba(148,163,184,0.08)_75%)] bg-[length:24px_24px] p-4">
            <div className="flex min-h-[18rem] items-center justify-center rounded-[1.1rem] bg-background/80 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed with a native img element */}
              <img
                src={image.objectUrl}
                alt={`Preview of ${image.fileName}`}
                className="max-h-[28rem] w-auto max-w-full rounded-2xl shadow-sm"
              />
            </div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            The PNG export keeps the same pixel dimensions as the original WebP.
          </p>
        </div>

        <aside className="space-y-5 rounded-[1.5rem] border border-border/70 bg-background/65 p-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">File</p>
            <p className="text-base font-medium break-all">{image.fileName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-3">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Width
              </p>
              <p className="mt-2 text-lg font-semibold">{image.width}px</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-3">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Height
              </p>
              <p className="mt-2 text-lg font-semibold">{image.height}px</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-3">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Input
              </p>
              <p className="mt-2 text-lg font-semibold">WebP</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-3">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Size
              </p>
              <p className="mt-2 text-lg font-semibold">
                {formatFileSize(image.fileSize)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card px-4 py-4">
            <p className="text-sm font-medium">Output</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Exports as{" "}
              <span className="font-medium text-foreground">PNG</span> with the
              same resolution as the uploaded file.
            </p>
          </div>

          {conversionError ? (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {conversionError}
            </p>
          ) : null}

          <Button
            size="lg"
            className="w-full"
            disabled={isConverting}
            onClick={handleConvert}
          >
            <Download className="size-4" />
            {isConverting ? "Exporting PNG..." : "Download PNG"}
          </Button>
        </aside>
      </div>
    </div>
  )
}
