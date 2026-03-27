"use client"

import * as React from "react"
import { Crop, Download, Frame, RefreshCcw } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { CheckerboardSurface } from "@/components/tools/shared/checkerboard-surface"
import { RectCropEditor } from "@/components/tools/shared/rect-crop-editor"
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useImageUpload } from "@/hooks/use-image-upload"
import {
  createCenteredAspectRatioCrop,
  createFullRectCrop,
  exportRectCrop,
  type RectCrop,
} from "@/lib/image/crop"
import { getRasterExportConfig } from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"

const IMAGE_UPLOAD_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"]
const IMAGE_UPLOAD_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
const ASPECT_RATIO_OPTIONS = [
  {
    label: "Freeform",
    value: "freeform",
    aspectRatio: null,
    summary: "Any shape",
  },
  {
    label: "1:1",
    value: "1:1",
    aspectRatio: 1,
    summary: "Square",
  },
  {
    label: "4:5",
    value: "4:5",
    aspectRatio: 4 / 5,
    summary: "Portrait",
  },
  {
    label: "3:2",
    value: "3:2",
    aspectRatio: 3 / 2,
    summary: "Photo",
  },
  {
    label: "16:9",
    value: "16:9",
    aspectRatio: 16 / 9,
    summary: "Widescreen",
  },
] as const

function CropPreview({
  imageUrl,
  crop,
  imageWidth,
  imageHeight,
}: {
  imageUrl: string
  crop: RectCrop
  imageWidth: number
  imageHeight: number
}) {
  const maxPreviewWidth = 260
  const maxPreviewHeight = 220
  const scale = Math.min(
    maxPreviewWidth / crop.width,
    maxPreviewHeight / crop.height,
    1
  )
  const previewWidth = Math.max(1, Math.round(crop.width * scale))
  const previewHeight = Math.max(1, Math.round(crop.height * scale))

  return (
    <CheckerboardSurface
      className="p-4"
      contentClassName="flex flex-col items-center gap-4 p-6"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-border/70 shadow-sm"
        style={{
          width: previewWidth,
          height: previewHeight,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed directly in the browser */}
        <img
          src={imageUrl}
          alt="Aspect-ratio crop preview"
          className="absolute top-0 left-0 max-w-none"
          style={{
            width: imageWidth * scale,
            height: imageHeight * scale,
            transform: `translate(${-crop.x * scale}px, ${-crop.y * scale}px)`,
          }}
        />
      </div>
      <p className="text-center text-sm leading-6 text-muted-foreground">
        Export keeps this crop selection and preserves the original raster
        format whenever the browser supports it.
      </p>
    </CheckerboardSurface>
  )
}

export function AspectRatioCropTool() {
  const { image, error, isLoading, clear, selectFile } = useImageUpload({
    mimeTypes: IMAGE_UPLOAD_MIME_TYPES,
    extensions: IMAGE_UPLOAD_EXTENSIONS,
    pasteMode: "when-has-image",
  })
  const [crop, setCrop] = React.useState<RectCrop | null>(null)
  const [selectedAspectRatio, setSelectedAspectRatio] =
    React.useState<string>("freeform")
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportError, setExportError] = React.useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!image) {
      setCrop(null)
      setSelectedAspectRatio("freeform")
      setIsEditorOpen(false)
      setExportError(null)
      setExportSuccess(null)
      return
    }

    setCrop(createFullRectCrop(image.width, image.height))
    setSelectedAspectRatio("freeform")
    setIsEditorOpen(true)
    setExportError(null)
    setExportSuccess(null)
  }, [image])

  const aspectRatioOption =
    ASPECT_RATIO_OPTIONS.find(
      (option) => option.value === selectedAspectRatio
    ) ?? ASPECT_RATIO_OPTIONS[0]
  const exportConfig = image ? getRasterExportConfig(image.mimeType) : null

  const handleCropChange = React.useCallback((nextCrop: RectCrop) => {
    setCrop(nextCrop)
    setExportError(null)
    setExportSuccess(null)
  }, [])

  const handleAspectRatioChange = (value: string) => {
    if (!value || !image || !crop) {
      return
    }

    const nextAspectRatioOption =
      ASPECT_RATIO_OPTIONS.find((option) => option.value === value) ??
      ASPECT_RATIO_OPTIONS[0]
    const centerX = crop.x + crop.width / 2
    const centerY = crop.y + crop.height / 2

    setSelectedAspectRatio(value)
    setCrop(
      nextAspectRatioOption.aspectRatio
        ? createCenteredAspectRatioCrop(
            image.width,
            image.height,
            nextAspectRatioOption.aspectRatio,
            centerX,
            centerY
          )
        : crop
    )
    setExportError(null)
    setExportSuccess(null)
  }

  const handleExport = async () => {
    if (!image || !crop) {
      return
    }

    setIsExporting(true)
    setExportError(null)
    setExportSuccess(null)

    try {
      const exportResult = await exportRectCrop({
        imageUrl: image.objectUrl,
        crop,
        fileName: image.fileName,
        mimeType: image.mimeType,
      })
      setExportSuccess(`${exportResult.label} download started successfully.`)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Crop export failed. Please try again."

      setExportError(message)
    } finally {
      setIsExporting(false)
    }
  }

  if (!image || !crop || !exportConfig) {
    return (
      <FileDropzone
        title="Crop an image to a chosen aspect ratio"
        description="Upload or paste a PNG, JPG, or WebP image, choose an aspect-ratio preset or go freeform, and export the cropped result locally."
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        helperText="Paste, drag and drop, or browse from your device."
        isLoading={isLoading}
        error={error}
        supportsPaste
        onFileSelect={selectFile}
      />
    )
  }

  return (
    <>
      <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
        <CardHeader className="bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent">
          <Badge variant="outline" className="self-start">
            Aspect Ratio Crop
          </Badge>
          <CardTitle className="text-2xl tracking-tight">
            Crop to a preset ratio or keep it freeform
          </CardTitle>
          <CardDescription>
            Choose a common aspect ratio like 1:1, 4:5, 3:2, or 16:9, adjust the
            crop, and export the result in the original raster format.
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
            <CropPreview
              imageUrl={image.objectUrl}
              crop={crop}
              imageWidth={image.width}
              imageHeight={image.height}
            />

            <Alert>
              <Frame />
              <AlertTitle>Crop behavior</AlertTitle>
              <AlertDescription>
                Presets keep the selection locked to a chosen ratio. Freeform
                mode lets you crop to any width and height.
              </AlertDescription>
            </Alert>
          </div>

          <Card className="rounded-[1.5rem] border-border/70 bg-background/65">
            <CardHeader>
              <CardTitle>Crop settings</CardTitle>
              <CardDescription className="break-all">
                {image.fileName}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Original size</CardDescription>
                    <CardTitle className="text-lg">
                      {image.width} x {image.height}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Crop size</CardDescription>
                    <CardTitle className="text-lg">
                      {Math.round(crop.width)} x {Math.round(crop.height)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Aspect ratio</CardDescription>
                    <CardTitle className="text-lg">
                      {aspectRatioOption.label}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardDescription>Output format</CardDescription>
                    <CardTitle className="text-lg">
                      {exportConfig.label}
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

              <FieldGroup>
                <Field>
                  <FieldLabel>Aspect ratio presets</FieldLabel>
                  <FieldContent>
                    <ToggleGroup
                      multiple={false}
                      variant="outline"
                      value={[selectedAspectRatio]}
                      onValueChange={(groupValue) =>
                        handleAspectRatioChange(groupValue[0] ?? "")
                      }
                      className="flex w-full flex-wrap gap-2"
                    >
                      {ASPECT_RATIO_OPTIONS.map((option) => (
                        <ToggleGroupItem
                          key={option.value}
                          value={option.value}
                          className="min-w-20"
                        >
                          {option.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FieldDescription>
                      {aspectRatioOption.summary}. The crop dialog updates to
                      match the selected ratio.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>

              <Alert>
                <Crop />
                <AlertTitle>Edit crop</AlertTitle>
                <AlertDescription>
                  Open the crop dialog to reposition the frame or resize it with
                  the lower-right handle.
                </AlertDescription>
              </Alert>

              {exportSuccess ? (
                <StatusAlert
                  status="success"
                  title="Download ready"
                  message={exportSuccess}
                />
              ) : null}

              {exportError ? (
                <StatusAlert
                  status="error"
                  title="Crop failed"
                  message={exportError}
                />
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
                {isExporting
                  ? `Exporting ${exportConfig.label}...`
                  : `Download ${exportConfig.label}`}
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-h-[calc(100%-2rem)] w-[min(1120px,calc(100%-2rem))] max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-[min(1120px,calc(100%-2rem))]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Adjust crop</DialogTitle>
            <DialogDescription>
              Move the crop box to frame the image, or drag the lower-right
              handle to resize it before exporting the final crop.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 overflow-auto px-6 pb-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.85fr)]">
            <RectCropEditor
              imageUrl={image.objectUrl}
              imageWidth={image.width}
              imageHeight={image.height}
              crop={crop}
              onCropChange={handleCropChange}
              aspectRatio={aspectRatioOption.aspectRatio ?? undefined}
              className="min-w-0"
            />

            <div className="flex flex-col gap-4">
              <CropPreview
                imageUrl={image.objectUrl}
                crop={crop}
                imageWidth={image.width}
                imageHeight={image.height}
              />

              <Alert>
                <Frame />
                <AlertTitle>Current frame</AlertTitle>
                <AlertDescription>
                  {aspectRatioOption.label === "Freeform"
                    ? "Freeform crop is active."
                    : `${aspectRatioOption.label} aspect ratio is locked.`}{" "}
                  The current selection is {Math.round(crop.width)}px by{" "}
                  {Math.round(crop.height)}px.
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
