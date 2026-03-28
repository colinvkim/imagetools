"use client"

import * as React from "react"
import { Download, Lock, LockOpen, RefreshCcw, Scaling } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { CheckerboardSurface } from "@/components/tools/shared/checkerboard-surface"
import { DownloadFileAction } from "@/components/tools/shared/download-file-action"
import { StatusAlert } from "@/components/tools/shared/status-alert"
import {
  ToolPrimaryFooter,
  ToolSettingsCard,
  ToolStatCard,
  ToolStatGrid,
  ToolWorkspace,
} from "@/components/tools/shared/tool-workspace"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  buildDownloadFileName,
  canvasToBlob,
  downloadBlob,
  getFileNameWithoutExtension,
  getRasterExportConfig,
} from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
import { loadImageElement } from "@/lib/image/load-image"
import {
  RASTER_IMAGE_ACCEPT,
  RASTER_IMAGE_EXTENSIONS,
  RASTER_IMAGE_MIME_TYPES,
} from "@/lib/image/raster"

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
    mimeTypes: [...RASTER_IMAGE_MIME_TYPES],
    extensions: [...RASTER_IMAGE_EXTENSIONS],
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
        accept={RASTER_IMAGE_ACCEPT}
        acceptedFormatsLabel="PNG, JPG, or WebP"
        helperText="Aspect ratio stays locked by default."
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
  const baseFileName = getFileNameWithoutExtension(image.fileName)
  const defaultExportFileName = buildDownloadFileName({
    baseName: `${baseFileName}-${outputWidth}x${outputHeight}`,
    fallbackFileName: image.fileName,
    extension: exportConfig.extension,
  })

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

  const handleExport = async (outputFileName = defaultExportFileName) => {
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
      downloadBlob(blob, outputFileName)
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
    <ToolWorkspace
      badge="Resize Image"
      onReset={clear}
      resetIcon={<RefreshCcw data-icon="inline-start" />}
      preview={
        <>
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
        </>
      }
      settings={
        <ToolSettingsCard
          title="Resize settings"
          fileName={image.fileName}
            footer={
              <ToolPrimaryFooter>
                <DownloadFileAction
                  buttonLabel={
                    isExporting
                      ? "Exporting image..."
                      : `Download ${exportConfig.label}`
                  }
                  defaultFileName={defaultExportFileName}
                  outputExtension={exportConfig.extension}
                  resetKey={image.objectUrl}
                  disabled={isExporting}
                  onDownload={handleExport}
                />
              </ToolPrimaryFooter>
            }
          >
          <ToolStatGrid>
            <ToolStatCard
              label="Original size"
              value={`${image.width} x ${image.height}`}
            />
            <ToolStatCard
              label="Output size"
              value={`${outputWidth} x ${outputHeight}`}
            />
            <ToolStatCard label="Format" value={exportConfig.label} />
            <ToolStatCard
              label="Input size"
              value={formatFileSize(image.fileSize)}
            />
          </ToolStatGrid>

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
                  name="resize-width"
                  type="number"
                  min={1}
                  step={1}
                  value={widthInput}
                  onChange={handleWidthChange}
                  autoComplete="off"
                  inputMode="numeric"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="resize-height">Height</FieldLabel>
              <FieldContent>
                <Input
                  id="resize-height"
                  name="resize-height"
                  type="number"
                  min={1}
                  step={1}
                  value={heightInput}
                  onChange={handleHeightChange}
                  autoComplete="off"
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
              By default, downloads a resized {exportConfig.label} file with{" "}
              {`-${outputWidth}x${outputHeight}`} appended to the name. Use the
              edit button beside download to rename it first.
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
        </ToolSettingsCard>
      }
      gridClassName="lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.95fr)]"
    />
  )
}
