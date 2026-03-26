"use client"

import * as React from "react"
import {
  Crop,
  Download,
  RefreshCcw,
  ScanFace,
  SlidersHorizontal,
} from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useImageUpload } from "@/hooks/use-image-upload"
import {
  createFullRectCrop,
  exportRoundedCrop,
  type RectCrop,
} from "@/lib/image/crop"
import { formatFileSize } from "@/lib/image/format"

const RADIUS_PRESETS = ["16", "32", "64", "96"] as const

function getRadiusValue(value: string, maxRadius: number) {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 32
  }

  return Math.min(parsedValue, Math.floor(maxRadius))
}

function RoundedPreview({
  imageUrl,
  crop,
  imageWidth,
  imageHeight,
  radius,
}: {
  imageUrl: string
  crop: RectCrop
  imageWidth: number
  imageHeight: number
  radius: number
}) {
  const maxPreviewWidth = 240
  const maxPreviewHeight = 220
  const scale = Math.min(
    maxPreviewWidth / crop.width,
    maxPreviewHeight / crop.height
  )
  const previewWidth = crop.width * scale
  const previewHeight = crop.height * scale
  const previewRadius = Math.max(
    0,
    Math.min(radius * scale, previewWidth / 2, previewHeight / 2)
  )

  return (
    <CheckerboardSurface
      className="p-4"
      contentClassName="flex flex-col items-center gap-4 p-6"
    >
      <div
        className="relative overflow-hidden border border-border/70 shadow-sm"
        style={{
          width: previewWidth,
          height: previewHeight,
          borderRadius: previewRadius,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed directly in the browser */}
        <img
          src={imageUrl}
          alt="Rounded corner preview"
          className="absolute top-0 left-0 max-w-none"
          style={{
            width: imageWidth * scale,
            height: imageHeight * scale,
            transform: `translate(${-crop.x * scale}px, ${-crop.y * scale}px)`,
          }}
        />
      </div>
      <p className="text-center text-sm leading-6 text-muted-foreground">
        PNG export uses this crop selection and applies the chosen corner radius
        while keeping the outside corners transparent.
      </p>
    </CheckerboardSurface>
  )
}

export function RoundedCornersTool() {
  const { image, error, isLoading, clear, selectFile } = useImageUpload({
    mimeTypes: ["image/*"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    enablePaste: true,
  })
  const [crop, setCrop] = React.useState<RectCrop | null>(null)
  const [radiusInput, setRadiusInput] = React.useState("32")
  const [selectedPreset, setSelectedPreset] = React.useState("32")
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportError, setExportError] = React.useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!image) {
      setCrop(null)
      setRadiusInput("32")
      setSelectedPreset("32")
      setIsEditorOpen(false)
      setExportError(null)
      setExportSuccess(null)
      return
    }

    setCrop(createFullRectCrop(image.width, image.height))
    setRadiusInput("32")
    setSelectedPreset("32")
    setIsEditorOpen(true)
    setExportError(null)
    setExportSuccess(null)
  }, [image])

  const handleCropChange = React.useCallback((nextCrop: RectCrop) => {
    setCrop(nextCrop)
    setExportError(null)
    setExportSuccess(null)
  }, [])

  if (!image || !crop) {
    return (
      <FileDropzone
        title="Add rounded corners to an image"
        description="Upload or paste an image, keep the full frame or crop it in a dialog, choose a preset or custom radius, and export a transparent PNG."
        accept="image/*,.jpg,.jpeg,.png,.webp"
        helperText="Paste, drag and drop, or browse from your device."
        isLoading={isLoading}
        error={error}
        supportsPaste
        onFileSelect={selectFile}
      />
    )
  }

  const maxRadius = Math.min(crop.width, crop.height) / 2
  const radius = getRadiusValue(radiusInput, maxRadius)

  const handlePresetChange = (value: string) => {
    if (!value) {
      return
    }

    setExportError(null)
    setExportSuccess(null)
    setSelectedPreset(value)
    setRadiusInput(value)
  }

  const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportError(null)
    setExportSuccess(null)
    setSelectedPreset("")
    setRadiusInput(event.target.value)
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(null)

    try {
      await exportRoundedCrop({
        imageUrl: image.objectUrl,
        crop,
        fileName: image.fileName,
        radius,
      })
      setExportSuccess("Rounded PNG download started successfully.")
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Rounded corner export failed. Please try again."

      setExportError(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
        <CardHeader className="bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent">
          <Badge variant="outline" className="self-start">
            Rounded Corners
          </Badge>
          <CardTitle className="text-2xl tracking-tight">
            Keep the full frame or crop it, then soften the corners
          </CardTitle>
          <CardDescription>
            Use presets for quick rounded styles or type a custom radius before
            exporting a transparent PNG at the same aspect ratio as your crop.
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
            <RoundedPreview
              imageUrl={image.objectUrl}
              crop={crop}
              imageWidth={image.width}
              imageHeight={image.height}
              radius={radius}
            />

            <Alert>
              <ScanFace />
              <AlertTitle>Transparent corners</AlertTitle>
              <AlertDescription>
                The exported PNG clips the corners and keeps the outside area
                transparent so it works well on any background.
              </AlertDescription>
            </Alert>
          </div>

          <Card className="rounded-[1.5rem] border-border/70 bg-background/65">
            <CardHeader>
              <CardTitle>Shape settings</CardTitle>
              <CardDescription className="break-all">
                {image.fileName}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
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
                      {Math.round(crop.width)} x {Math.round(crop.height)}
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
                  <FieldLabel>Radius presets</FieldLabel>
                  <FieldContent>
                    <ToggleGroup
                      multiple={false}
                      variant="outline"
                      value={selectedPreset ? [selectedPreset] : []}
                      onValueChange={(groupValue) =>
                        handlePresetChange(groupValue[0] ?? "")
                      }
                      className="flex w-full flex-wrap gap-2"
                    >
                      {RADIUS_PRESETS.map((preset) => (
                        <ToggleGroupItem
                          key={preset}
                          value={preset}
                          className="min-w-16"
                        >
                          {preset}px
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <FieldDescription>
                      Presets are measured in output pixels.
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="rounded-radius">
                    Custom radius
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="rounded-radius"
                      type="number"
                      min={0}
                      max={Math.floor(maxRadius)}
                      step={1}
                      value={radiusInput}
                      onChange={handleRadiusChange}
                      inputMode="numeric"
                    />
                    <FieldDescription>
                      The current crop supports up to {Math.floor(maxRadius)}px.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>

              <Alert>
                <SlidersHorizontal />
                <AlertTitle>Output</AlertTitle>
                <AlertDescription>
                  Exports a {Math.round(crop.width)} x {Math.round(crop.height)}{" "}
                  PNG with a {radius}px corner radius.
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
                {isExporting ? "Exporting PNG..." : "Download Rounded PNG"}
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
              handle to resize it before exporting rounded corners.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 overflow-auto px-6 pb-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.85fr)]">
            <RectCropEditor
              imageUrl={image.objectUrl}
              imageWidth={image.width}
              imageHeight={image.height}
              crop={crop}
              onCropChange={handleCropChange}
              className="min-w-0"
            />

            <div className="flex flex-col gap-4">
              <RoundedPreview
                imageUrl={image.objectUrl}
                crop={crop}
                imageWidth={image.width}
                imageHeight={image.height}
                radius={radius}
              />

              <Alert>
                <SlidersHorizontal />
                <AlertTitle>Current shape</AlertTitle>
                <AlertDescription>
                  The crop is {Math.round(crop.width)}px by{" "}
                  {Math.round(crop.height)}px with a {radius}px radius.
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
