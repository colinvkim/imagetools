"use client"

import * as React from "react"
import { CircleDashed, Crop, Download, RefreshCcw } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { SquareCropEditor } from "@/components/tools/shared/square-crop-editor"
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useImageUpload } from "@/hooks/use-image-upload"
import {
  createCenteredSquareCrop,
  exportCircleCrop,
  type SquareCrop,
} from "@/lib/image/crop"

function formatFileSize(fileSize: number) {
  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)} KB`
  }

  return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
}

function CirclePreview({
  imageUrl,
  crop,
  imageWidth,
  imageHeight,
}: {
  imageUrl: string
  crop: SquareCrop
  imageWidth: number
  imageHeight: number
}) {
  const previewSize = 220
  const scale = previewSize / crop.size

  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-[linear-gradient(45deg,transparent_25%,rgba(148,163,184,0.08)_25%,rgba(148,163,184,0.08)_50%,transparent_50%,transparent_75%,rgba(148,163,184,0.08)_75%)] bg-[length:24px_24px] p-4">
      <div className="flex flex-col items-center gap-4 rounded-[1.1rem] bg-background/80 p-6">
        <div
          className="relative overflow-hidden rounded-full border border-border/70 shadow-sm"
          style={{
            width: previewSize,
            height: previewSize,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed directly in the browser */}
          <img
            src={imageUrl}
            alt="Circle crop preview"
            className="absolute top-0 left-0 max-w-none"
            style={{
              width: imageWidth * scale,
              height: imageHeight * scale,
              transform: `translate(${-crop.x * scale}px, ${-crop.y * scale}px)`,
            }}
          />
        </div>
        <p className="text-center text-sm leading-6 text-muted-foreground">
          PNG export uses this square selection and clips it to a circle with
          transparent corners.
        </p>
      </div>
    </div>
  )
}

export function CircleCropTool() {
  const { image, error, isLoading, clear, selectFile } = useImageUpload({
    mimeTypes: ["image/*"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    enablePaste: true,
  })
  const [crop, setCrop] = React.useState<SquareCrop | null>(null)
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportError, setExportError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!image) {
      setCrop(null)
      setIsEditorOpen(false)
      setExportError(null)
      return
    }

    setCrop(createCenteredSquareCrop(image.width, image.height))
    setIsEditorOpen(true)
    setExportError(null)
  }, [image])

  const handleExport = async () => {
    if (!image || !crop) {
      return
    }

    setIsExporting(true)
    setExportError(null)

    try {
      await exportCircleCrop({
        imageUrl: image.objectUrl,
        crop,
        fileName: image.fileName,
      })
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Circle crop export failed. Please try again."

      setExportError(message)
    } finally {
      setIsExporting(false)
    }
  }

  if (!image || !crop) {
    return (
      <FileDropzone
        title="Crop an image into a perfect circle"
        description="Upload or paste an image, adjust a square crop in a dialog, and export a transparent PNG with a circular cutout."
        accept="image/*,.jpg,.jpeg,.png,.webp"
        helperText="Clipboard paste is supported here too."
        isLoading={isLoading}
        error={error}
        onFileSelect={selectFile}
      />
    )
  }

  return (
    <>
      <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
        <CardHeader className="bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent">
          <Badge variant="outline" className="self-start">
            Circle Crop
          </Badge>
          <CardTitle className="text-2xl tracking-tight">
            Crop a square, then export it as a circle
          </CardTitle>
          <CardDescription>
            The editor keeps the crop square so the final PNG is perfectly
            circular and ready for avatars, profile images, and logos.
          </CardDescription>
          <CardAction>
            <Button variant="outline" onClick={clear}>
              <RefreshCcw data-icon="inline-start" />
              Choose another file
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.95fr)]">
          <div className="flex flex-col gap-4">
            <CirclePreview
              imageUrl={image.objectUrl}
              crop={crop}
              imageWidth={image.width}
              imageHeight={image.height}
            />

            <Alert>
              <CircleDashed />
              <AlertTitle>Transparent output</AlertTitle>
              <AlertDescription>
                The exported PNG keeps the circle and makes the corners
                transparent, which is ideal for overlays and avatars.
              </AlertDescription>
            </Alert>
          </div>

          <Card className="rounded-[1.5rem] border-border/70 bg-background/65">
            <CardHeader>
              <CardTitle>Crop details</CardTitle>
              <CardDescription className="break-all">
                {image.fileName}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Original width</CardDescription>
                    <CardTitle className="text-lg">{image.width}px</CardTitle>
                  </CardHeader>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Original height</CardDescription>
                    <CardTitle className="text-lg">{image.height}px</CardTitle>
                  </CardHeader>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Crop size</CardDescription>
                    <CardTitle className="text-lg">
                      {Math.round(crop.size)}px
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Input size</CardDescription>
                    <CardTitle className="text-lg">
                      {formatFileSize(image.fileSize)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Separator />

              <Alert>
                <Crop />
                <AlertTitle>Edit crop</AlertTitle>
                <AlertDescription>
                  Open the crop dialog to move the square selection or resize it
                  from the lower-right handle.
                </AlertDescription>
              </Alert>

              {exportError ? (
                <Alert variant="destructive">
                  <RefreshCcw />
                  <AlertTitle>Export failed</AlertTitle>
                  <AlertDescription>{exportError}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>

            <CardFooter className="flex-col gap-2 sm:flex-col">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsEditorOpen(true)}
              >
                <Crop data-icon="inline-start" />
                Adjust crop
              </Button>
              <Button
                size="lg"
                className="w-full"
                disabled={isExporting}
                onClick={handleExport}
              >
                <Download data-icon="inline-start" />
                {isExporting ? "Exporting PNG..." : "Download Circle PNG"}
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-h-[calc(100%-2rem)] w-[min(1120px,calc(100%-2rem))] max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-[min(1120px,calc(100%-2rem))]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Adjust square crop</DialogTitle>
            <DialogDescription>
              Move the crop box to frame the image, or drag the lower-right
              handle to resize it before exporting the final circle.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 overflow-auto px-6 pb-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.85fr)]">
            <SquareCropEditor
              imageUrl={image.objectUrl}
              imageWidth={image.width}
              imageHeight={image.height}
              crop={crop}
              onCropChange={setCrop}
              className="min-w-0"
            />

            <div className="flex flex-col gap-4">
              <CirclePreview
                imageUrl={image.objectUrl}
                crop={crop}
                imageWidth={image.width}
                imageHeight={image.height}
              />

              <Alert>
                <Crop />
                <AlertTitle>Crop size</AlertTitle>
                <AlertDescription>
                  The current square selection is {Math.round(crop.size)}px by{" "}
                  {Math.round(crop.size)}px.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <DialogFooter className="mt-0" showCloseButton={false}>
            <DialogClose render={<Button variant="outline" />}>
              Done
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
