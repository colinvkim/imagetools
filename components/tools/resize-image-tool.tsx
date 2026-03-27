"use client"

import * as React from "react"
import { Download, Lock, LockOpen, RefreshCcw, Scaling } from "lucide-react"

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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useImageUpload } from "@/hooks/use-image-upload"
import {
  canvasToBlob,
  downloadBlob,
  getFileNameWithoutExtension,
  getRasterExportConfig,
} from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
import { loadImageElement } from "@/lib/image/load-image"

const RESIZE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"]
const RESIZE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"]
const SCALE_OPTIONS = [
  { label: "25%", value: "0.25" },
  { label: "50%", value: "0.5" },
  { label: "100%", value: "1" },
  { label: "200%", value: "2" },
] as const

function getDimensionValue(value: string, fallback: number) {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return Math.round(fallback)
  }

  return parsedValue
}

function ResizePreview({
  imageUrl,
  width,
  height,
}: {
  imageUrl: string
  width: number
  height: number
}) {
  const maxPreviewWidth = 420
  const maxPreviewHeight = 300
  const scale = Math.min(maxPreviewWidth / width, maxPreviewHeight / height, 1)
  const previewWidth = Math.max(1, Math.round(width * scale))
  const previewHeight = Math.max(1, Math.round(height * scale))

  return (
    <CheckerboardSurface
      className="p-4"
      contentClassName="flex min-h-[18rem] items-center justify-center p-4"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-border/70 shadow-sm"
        style={{
          width: previewWidth,
          height: previewHeight,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed directly in the browser */}
        <img src={imageUrl} alt="Resized image preview" className="size-full" />
      </div>
    </CheckerboardSurface>
  )
}

export function ResizeImageTool() {
  const { image, error, isLoading, clear, selectFile } = useImageUpload({
    mimeTypes: RESIZE_MIME_TYPES,
    extensions: RESIZE_EXTENSIONS,
    pasteMode: "when-has-image",
  })
  const [widthInput, setWidthInput] = React.useState("")
  const [heightInput, setHeightInput] = React.useState("")
  const [selectedScale, setSelectedScale] = React.useState("1")
  const [isAspectLocked, setIsAspectLocked] = React.useState(true)
  const [exportError, setExportError] = React.useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = React.useState<string | null>(null)
  const [isExporting, setIsExporting] = React.useState(false)

  React.useEffect(() => {
    if (!image) {
      setWidthInput("")
      setHeightInput("")
      setSelectedScale("1")
      setIsAspectLocked(true)
      setExportError(null)
      setExportSuccess(null)
      return
    }

    setWidthInput(String(image.width))
    setHeightInput(String(image.height))
    setSelectedScale("1")
    setIsAspectLocked(true)
    setExportError(null)
    setExportSuccess(null)
  }, [image])

  if (!image) {
    return (
      <FileDropzone
        title="Resize images without leaving the browser"
        description="Upload or paste a PNG, JPG, or WebP image, set the dimensions you want, and export a resized version locally."
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        helperText="Aspect ratio stays locked by default, and paste support works here too."
        isLoading={isLoading}
        error={error}
        supportsPaste
        onFileSelect={selectFile}
      />
    )
  }

  const aspectRatio = image.width / image.height
  const outputWidth = getDimensionValue(widthInput, image.width)
  const outputHeight = getDimensionValue(heightInput, image.height)
  const exportConfig = getRasterExportConfig(image.mimeType)

  const handleScaleChange = (value: string) => {
    if (!image || !value) {
      return
    }

    const scale = Number(value)
    const nextWidth = Math.max(1, Math.round(image.width * scale))
    const nextHeight = Math.max(1, Math.round(image.height * scale))

    setSelectedScale(value)
    setWidthInput(String(nextWidth))
    setHeightInput(String(nextHeight))
    setExportError(null)
    setExportSuccess(null)
  }

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextWidthInput = event.target.value

    setWidthInput(nextWidthInput)
    setSelectedScale("")
    setExportError(null)
    setExportSuccess(null)

    if (!isAspectLocked) {
      return
    }

    const nextWidth = getDimensionValue(nextWidthInput, image.width)
    setHeightInput(String(Math.max(1, Math.round(nextWidth / aspectRatio))))
  }

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextHeightInput = event.target.value

    setHeightInput(nextHeightInput)
    setSelectedScale("")
    setExportError(null)
    setExportSuccess(null)

    if (!isAspectLocked) {
      return
    }

    const nextHeight = getDimensionValue(nextHeightInput, image.height)
    setWidthInput(String(Math.max(1, Math.round(nextHeight * aspectRatio))))
  }

  const handleAspectLockChange = (pressed: boolean) => {
    setIsAspectLocked(pressed)
    setExportError(null)
    setExportSuccess(null)

    if (!pressed) {
      return
    }

    const nextWidth = getDimensionValue(widthInput, image.width)
    setHeightInput(String(Math.max(1, Math.round(nextWidth / aspectRatio))))
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(null)

    try {
      const sourceImage = await loadImageElement(image.objectUrl)
      const canvas = document.createElement("canvas")
      canvas.width = outputWidth
      canvas.height = outputHeight

      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Canvas is not available in this browser.")
      }

      context.drawImage(sourceImage, 0, 0, outputWidth, outputHeight)

      const blob = await canvasToBlob(
        canvas,
        exportConfig.mimeType,
        exportConfig.quality
      )
      const baseFileName = getFileNameWithoutExtension(image.fileName)

      downloadBlob(
        blob,
        `${baseFileName || image.fileName}-${outputWidth}x${outputHeight}${exportConfig.extension}`
      )
      setExportSuccess(`${exportConfig.label} download started successfully.`)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Resize export failed. Please try again."

      setExportError(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
      <CardHeader className="bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent">
        <Badge variant="outline" className="self-start">
          Resize Image
        </Badge>
        <CardTitle className="text-2xl tracking-tight">
          Resize an image with precise dimensions
        </CardTitle>
        <CardDescription>
          Adjust width and height, keep the aspect ratio locked if you want, and
          export a resized image directly in the browser.
        </CardDescription>
        <CardAction>
          <Button variant="outline" onClick={clear}>
            <RefreshCcw data-icon="inline-start" />
            Choose another file
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.95fr)]">
        <div className="flex flex-col gap-4">
          <ResizePreview
            imageUrl={image.objectUrl}
            width={outputWidth}
            height={outputHeight}
          />

          <Alert>
            <Scaling />
            <AlertTitle>Resize behavior</AlertTitle>
            <AlertDescription>
              The preview reflects the new aspect ratio, and the export keeps
              the original file format whenever the browser supports it.
            </AlertDescription>
          </Alert>
        </div>

        <Card className="rounded-[1.5rem] border-border/70 bg-background/65">
          <CardHeader>
            <CardTitle>Resize settings</CardTitle>
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
                  <CardDescription>Output size</CardDescription>
                  <CardTitle className="text-lg">
                    {outputWidth} x {outputHeight}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Format</CardDescription>
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
                <FieldLabel>Scale presets</FieldLabel>
                <FieldContent>
                  <ToggleGroup
                    multiple={false}
                    variant="outline"
                    value={selectedScale ? [selectedScale] : []}
                    onValueChange={(groupValue) =>
                      handleScaleChange(groupValue[0] ?? "")
                    }
                    className="flex w-full flex-wrap gap-2"
                  >
                    {SCALE_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="min-w-16"
                      >
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FieldDescription>
                    Quick presets scale both dimensions from the original image.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>Aspect ratio</FieldLabel>
                <FieldContent>
                  <Toggle
                    variant="outline"
                    size="lg"
                    pressed={isAspectLocked}
                    onPressedChange={handleAspectLockChange}
                    className="justify-start"
                  >
                    {isAspectLocked ? (
                      <Lock data-icon="inline-start" />
                    ) : (
                      <LockOpen data-icon="inline-start" />
                    )}
                    {isAspectLocked ? "Keep original ratio" : "Free resize"}
                  </Toggle>
                  <FieldDescription>
                    When locked, changing one dimension updates the other
                    automatically.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="resize-width">Width</FieldLabel>
                <FieldContent>
                  <Input
                    id="resize-width"
                    type="number"
                    min={1}
                    step={1}
                    value={widthInput}
                    onChange={handleWidthChange}
                    inputMode="numeric"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="resize-height">Height</FieldLabel>
                <FieldContent>
                  <Input
                    id="resize-height"
                    type="number"
                    min={1}
                    step={1}
                    value={heightInput}
                    onChange={handleHeightChange}
                    inputMode="numeric"
                  />
                  <FieldDescription>
                    Exports as {exportConfig.label} at {outputWidth}px by{" "}
                    {outputHeight}px.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>

            <Alert>
              <Download />
              <AlertTitle>Output</AlertTitle>
              <AlertDescription>
                Downloads a resized {exportConfig.label} file with{" "}
                {`-${outputWidth}x${outputHeight}`} appended to the name.
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
                title="Resize failed"
                message={exportError}
              />
            ) : null}
          </CardContent>

          <CardFooter>
            <Button
              size="lg"
              className="w-full"
              disabled={isExporting}
              onClick={handleExport}
            >
              <Download data-icon="inline-start" />
              {isExporting
                ? "Exporting image..."
                : `Download ${exportConfig.label}`}
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  )
}
