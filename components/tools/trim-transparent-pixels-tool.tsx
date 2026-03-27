"use client"

import * as React from "react"
import { Crop, Download, RefreshCcw, Scissors } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { CheckerboardSurface } from "@/components/tools/shared/checkerboard-surface"
import { StatusAlert } from "@/components/tools/shared/status-alert"
import {
  ToolPrimaryFooter,
  ToolSettingsCard,
  ToolStatCard,
  ToolStatGrid,
  ToolWorkspace,
} from "@/components/tools/shared/tool-workspace"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useImageUpload } from "@/hooks/use-image-upload"
import { exportRectCrop } from "@/lib/image/crop"
import { getRasterExportConfig } from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
import {
  TRANSPARENT_RASTER_IMAGE_ACCEPT,
  TRANSPARENT_RASTER_IMAGE_EXTENSIONS,
  TRANSPARENT_RASTER_IMAGE_MIME_TYPES,
} from "@/lib/image/raster"
import {
  detectTransparentBounds,
  type TrimDetectionResult,
} from "@/lib/image/trim"

function TrimPreview({
  imageUrl,
  imageWidth,
  imageHeight,
  trimResult,
}: {
  imageUrl: string
  imageWidth: number
  imageHeight: number
  trimResult: TrimDetectionResult
}) {
  const maxPreviewWidth = 240
  const maxPreviewHeight = 220
  const originalScale = Math.min(
    maxPreviewWidth / imageWidth,
    maxPreviewHeight / imageHeight,
    1
  )
  const trimmedScale = Math.min(
    maxPreviewWidth / trimResult.crop.width,
    maxPreviewHeight / trimResult.crop.height,
    1
  )

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CheckerboardSurface
        className="p-4"
        contentClassName="flex flex-col items-center gap-4 p-6"
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-border/70 shadow-sm"
          style={{
            width: Math.max(1, Math.round(imageWidth * originalScale)),
            height: Math.max(1, Math.round(imageHeight * originalScale)),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed directly in the browser */}
          <img
            src={imageUrl}
            alt="Original transparency preview"
            className="size-full"
          />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">Original</p>
      </CheckerboardSurface>

      <CheckerboardSurface
        className="p-4"
        contentClassName="flex flex-col items-center gap-4 p-6"
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-border/70 shadow-sm"
          style={{
            width: Math.max(
              1,
              Math.round(trimResult.crop.width * trimmedScale)
            ),
            height: Math.max(
              1,
              Math.round(trimResult.crop.height * trimmedScale)
            ),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed directly in the browser */}
          <img
            src={imageUrl}
            alt="Trimmed transparency preview"
            className="absolute top-0 left-0 max-w-none"
            style={{
              width: imageWidth * trimmedScale,
              height: imageHeight * trimmedScale,
              transform: `translate(${-trimResult.crop.x * trimmedScale}px, ${-trimResult.crop.y * trimmedScale}px)`,
            }}
          />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">Trimmed</p>
      </CheckerboardSurface>
    </div>
  )
}

export function TrimTransparentPixelsTool() {
  const { image, error, isLoading, clear, selectFile } = useImageUpload({
    mimeTypes: [...TRANSPARENT_RASTER_IMAGE_MIME_TYPES],
    extensions: [...TRANSPARENT_RASTER_IMAGE_EXTENSIONS],
    pasteMode: "when-has-image",
  })
  const [trimResult, setTrimResult] =
    React.useState<TrimDetectionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysisError, setAnalysisError] = React.useState<string | null>(null)
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportError, setExportError] = React.useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!image) {
      setTrimResult(null)
      setIsAnalyzing(false)
      setAnalysisError(null)
      setExportError(null)
      setExportSuccess(null)
      return
    }

    let isActive = true

    setTrimResult(null)
    setIsAnalyzing(true)
    setAnalysisError(null)
    setExportError(null)
    setExportSuccess(null)

    void detectTransparentBounds(image.objectUrl)
      .then((result) => {
        if (!isActive) {
          return
        }

        if (!result) {
          setAnalysisError(
            "We couldn't find any visible pixels. This image appears to be fully transparent."
          )
          return
        }

        setTrimResult(result)
      })
      .catch((caughtError) => {
        if (!isActive) {
          return
        }

        setAnalysisError(
          caughtError instanceof Error
            ? caughtError.message
            : "Transparent edge detection failed. Please try another image."
        )
      })
      .finally(() => {
        if (isActive) {
          setIsAnalyzing(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [image])

  if (!image) {
    return (
      <FileDropzone
        title="Trim transparent pixels from logos, icons, and stickers"
        description="Upload or paste a transparent PNG or WebP image and imagetools will detect the visible bounds automatically."
        accept={TRANSPARENT_RASTER_IMAGE_ACCEPT}
        acceptedFormatsLabel="Transparent PNG or WebP"
        helperText="Works best for assets with transparent padding around the subject."
        isLoading={isLoading}
        error={error}
        supportsPaste
        onFileSelect={selectFile}
      />
    )
  }

  const exportConfig = getRasterExportConfig(image.mimeType)

  const handleExport = async () => {
    if (!trimResult) {
      return
    }

    setIsExporting(true)
    setExportError(null)
    setExportSuccess(null)

    try {
      const exportResult = await exportRectCrop({
        imageUrl: image.objectUrl,
        crop: trimResult.crop,
        fileName: image.fileName,
        mimeType: image.mimeType,
      })
      setExportSuccess(`${exportResult.label} download started successfully.`)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Trim export failed. Please try another image."

      setExportError(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <ToolWorkspace
      badge="Trim Transparent Pixels"
      title="Auto-crop transparent edges in one step"
      description="Detect transparent padding around a visible subject, preview the tighter bounds, and export the trimmed image in its original format."
      onReset={clear}
      resetIcon={<RefreshCcw data-icon="inline-start" />}
      preview={
        <>
          {trimResult ? (
            <TrimPreview
              imageUrl={image.objectUrl}
              imageWidth={image.width}
              imageHeight={image.height}
              trimResult={trimResult}
            />
          ) : (
            <CheckerboardSurface
              className="p-4"
              contentClassName="flex min-h-[18rem] items-center justify-center p-6 text-center text-sm leading-6 text-muted-foreground"
            >
              {isAnalyzing
                ? "Detecting visible bounds..."
                : "Upload analysis will appear here."}
            </CheckerboardSurface>
          )}

          <Alert>
            <Scissors />
            <AlertTitle>Transparent-edge detection</AlertTitle>
            <AlertDescription>
              This tool scans the alpha channel and removes only fully
              transparent border pixels from the outside.
            </AlertDescription>
          </Alert>
        </>
      }
      settings={
        <ToolSettingsCard
          title="Trim details"
          fileName={image.fileName}
          footer={
            <ToolPrimaryFooter className="pt-0">
              <Button
                size="lg"
                className="w-full"
                disabled={isAnalyzing || isExporting || !trimResult}
                onClick={handleExport}
              >
                <Download data-icon="inline-start" />
                {isExporting
                  ? `Exporting ${exportConfig.label}...`
                  : `Download Trimmed ${exportConfig.label}`}
              </Button>
            </ToolPrimaryFooter>
          }
        >
          <ToolStatGrid>
            <ToolStatCard
              label="Original size"
              value={`${image.width} x ${image.height}`}
            />
            <ToolStatCard label="Output format" value={exportConfig.label} />
            <ToolStatCard
              label="Input size"
              value={formatFileSize(image.fileSize)}
            />
            {trimResult ? (
              <ToolStatCard
                label="Trimmed size"
                value={`${trimResult.crop.width} x ${trimResult.crop.height}`}
              />
            ) : null}
          </ToolStatGrid>

          <Separator />

          {isAnalyzing ? (
            <Alert>
              <Crop />
              <AlertTitle>Analyzing transparency</AlertTitle>
              <AlertDescription>
                imagetools is scanning the image for the first and last visible
                pixels.
              </AlertDescription>
            </Alert>
          ) : null}

          {trimResult ? (
            <Alert>
              <Crop />
              <AlertTitle>
                {trimResult.hasTransparentBorder
                  ? "Detected transparent border"
                  : "No outer transparency found"}
              </AlertTitle>
              <AlertDescription>
                Removed {trimResult.trimmedTop}px from the top,{" "}
                {trimResult.trimmedRight}px from the right,{" "}
                {trimResult.trimmedBottom}px from the bottom, and{" "}
                {trimResult.trimmedLeft}px from the left.
              </AlertDescription>
            </Alert>
          ) : null}

          {analysisError ? (
            <StatusAlert
              status="error"
              title="Detection failed"
              message={analysisError}
            />
          ) : null}

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
              title="Trim failed"
              message={exportError}
            />
          ) : null}
        </ToolSettingsCard>
      }
    />
  )
}
