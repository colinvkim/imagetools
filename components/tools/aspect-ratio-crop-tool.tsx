"use client"

import * as React from "react"
import { Crop, Download, Frame, RefreshCcw } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { CheckerboardSurface } from "@/components/tools/shared/checkerboard-surface"
import { RectCropEditor } from "@/components/tools/shared/rect-crop-editor"
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
import {
  RASTER_IMAGE_ACCEPT,
  RASTER_IMAGE_EXTENSIONS,
  RASTER_IMAGE_MIME_TYPES,
} from "@/lib/image/raster"

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
    mimeTypes: [...RASTER_IMAGE_MIME_TYPES],
    extensions: [...RASTER_IMAGE_EXTENSIONS],
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
    setIsEditorOpen(false)
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
        accept={RASTER_IMAGE_ACCEPT}
        acceptedFormatsLabel="PNG, JPG, or WebP"
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
      <ToolWorkspace
        badge="Aspect Ratio Crop"
        title="Crop to a preset ratio or keep it freeform"
        description="Choose a common aspect ratio like 1:1, 4:5, 3:2, or 16:9, adjust the crop, and export the result in the original raster format."
        onReset={clear}
        resetIcon={<RefreshCcw data-icon="inline-start" />}
        preview={
          <>
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
          </>
        }
        settings={
          <ToolSettingsCard
            title="Crop settings"
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
              </ToolPrimaryFooter>
            }
          >
            <ToolStatGrid>
              <ToolStatCard
                label="Original size"
                value={`${image.width} x ${image.height}`}
              />
              <ToolStatCard
                label="Crop size"
                value={`${Math.round(crop.width)} x ${Math.round(crop.height)}`}
              />
              <ToolStatCard
                label="Aspect ratio"
                value={aspectRatioOption.label}
              />
              <ToolStatCard label="Output format" value={exportConfig.label} />
              <ToolStatCard
                label="Input size"
                value={formatFileSize(image.fileSize)}
              />
            </ToolStatGrid>

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
          </ToolSettingsCard>
        }
        gridClassName="lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.95fr)]"
      />

      <ToolEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        title="Adjust crop"
        description="Move the crop box to frame the image, or drag the lower-right handle to resize it before exporting the final crop."
        editor={
          <RectCropEditor
            imageUrl={image.objectUrl}
            imageWidth={image.width}
            imageHeight={image.height}
            crop={crop}
            onCropChange={handleCropChange}
            aspectRatio={aspectRatioOption.aspectRatio ?? undefined}
            className="min-w-0"
          />
        }
        sidebar={
          <>
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
          </>
        }
      />
    </>
  )
}
