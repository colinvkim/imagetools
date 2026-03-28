"use client"

import * as React from "react"
import { CircleDashed, Crop, RefreshCcw } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { CheckerboardSurface } from "@/components/tools/shared/checkerboard-surface"
import { DownloadFileAction } from "@/components/tools/shared/download-file-action"
import { SquareCropEditor } from "@/components/tools/shared/square-crop-editor"
import { StatusAlert } from "@/components/tools/shared/status-alert"
import { ToolEditorDialog } from "@/components/tools/shared/tool-editor-dialog"
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
import {
  centerSquareCrop,
  createCenteredSquareCrop,
  exportCircleCrop,
  type SquareCrop,
} from "@/lib/image/crop"
import {
  buildDownloadFileName,
  getFileNameWithoutExtension,
} from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
import {
  GENERIC_IMAGE_EDIT_ACCEPT,
  GENERIC_IMAGE_EDIT_EXTENSIONS,
  GENERIC_IMAGE_EDIT_MIME_TYPES,
} from "@/lib/image/raster"

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
    <CheckerboardSurface
      className="p-4"
      contentClassName="flex flex-col items-center gap-4 p-6"
    >
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
    </CheckerboardSurface>
  )
}

export function CircleCropTool() {
  const { image, error, isLoading, clear, selectFile } = useImageUpload({
    mimeTypes: [...GENERIC_IMAGE_EDIT_MIME_TYPES],
    extensions: [...GENERIC_IMAGE_EDIT_EXTENSIONS],
    pasteMode: "when-has-image",
  })
  const [crop, setCrop] = React.useState<SquareCrop | null>(null)
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportError, setExportError] = React.useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!image) {
      setCrop(null)
      setIsEditorOpen(false)
      setExportError(null)
      setExportSuccess(null)
      return
    }

    setCrop(createCenteredSquareCrop(image.width, image.height))
    setIsEditorOpen(false)
    setExportError(null)
    setExportSuccess(null)
  }, [image])

  const handleCropChange = React.useCallback((nextCrop: SquareCrop) => {
    setCrop(nextCrop)
    setExportError(null)
    setExportSuccess(null)
  }, [])

  if (!image || !crop) {
    return (
      <FileDropzone
        title="Crop an image into a perfect circle"
        description="Upload or paste an image, adjust a square crop in a dialog, and export a transparent PNG with a circular cutout."
        accept={GENERIC_IMAGE_EDIT_ACCEPT}
        acceptedFormatsLabel="PNG, JPG, or WebP"
        helperText="The crop editor stays closed until you choose Adjust crop."
        isLoading={isLoading}
        error={error}
        supportsPaste
        onFileSelect={selectFile}
      />
    )
  }

  const baseFileName = getFileNameWithoutExtension(image.fileName)
  const defaultExportFileName = buildDownloadFileName({
    baseName: `${baseFileName}-circle`,
    fallbackFileName: image.fileName,
    extension: ".png",
  })

  const handleExport = async (outputFileName = defaultExportFileName) => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(null)

    try {
      await exportCircleCrop({
        imageUrl: image.objectUrl,
        crop,
        fileName: image.fileName,
        outputFileName,
      })
      setExportSuccess("Circle PNG download started successfully.")
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

  return (
    <>
      <ToolWorkspace
        badge="Circle Crop"
        onReset={clear}
        resetIcon={<RefreshCcw data-icon="inline-start" />}
        preview={
          <>
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
          </>
        }
        settings={
          <ToolSettingsCard
            title="Crop details"
            fileName={image.fileName}
            footer={
              <ToolPrimaryFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditorOpen(true)}
                >
                  <Crop data-icon="inline-start" />
                  Adjust crop
                </Button>
                <DownloadFileAction
                  buttonLabel={
                    isExporting ? "Exporting PNG..." : "Download Circle PNG"
                  }
                  defaultFileName={defaultExportFileName}
                  outputExtension=".png"
                  resetKey={image.objectUrl}
                  disabled={isExporting}
                  onDownload={handleExport}
                />
              </ToolPrimaryFooter>
            }
          >
            <ToolStatGrid>
              <ToolStatCard label="Original width" value={`${image.width}px`} />
              <ToolStatCard
                label="Original height"
                value={`${image.height}px`}
              />
              <ToolStatCard
                label="Crop size"
                value={`${Math.round(crop.size)}px`}
              />
              <ToolStatCard
                label="Input size"
                value={formatFileSize(image.fileSize)}
              />
            </ToolStatGrid>

            <Separator />

            <Alert>
              <Crop />
              <AlertTitle>Edit crop</AlertTitle>
              <AlertDescription>
                Open the crop dialog to move the square selection or resize it
                from the lower-right handle.
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
                title="Export failed"
                message={exportError}
              />
            ) : null}
          </ToolSettingsCard>
        }
        gridClassName="lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.95fr)]"
      />

      <ToolEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        title="Adjust square crop"
        description="Move the crop box to frame the image, or drag the lower-right handle to resize it before exporting the final circle."
        editor={
          <SquareCropEditor
            imageUrl={image.objectUrl}
            imageWidth={image.width}
            imageHeight={image.height}
            crop={crop}
            onCropChange={handleCropChange}
            className="min-w-0"
          />
        }
        sidebar={
          <>
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
          </>
        }
        footerActions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                handleCropChange(centerSquareCrop(crop, image.width, image.height))
              }
            >
              Center crop
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                handleCropChange(createCenteredSquareCrop(image.width, image.height))
              }
            >
              Reset crop
            </Button>
          </>
        }
      />
    </>
  )
}
