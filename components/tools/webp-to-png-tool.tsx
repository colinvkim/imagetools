"use client"

import * as React from "react"
import { Download, Files, RefreshCcw } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { BatchFileList } from "@/components/tools/shared/batch-file-list"
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
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useObjectUrlBatch } from "@/hooks/use-object-url-batch"
import {
  canvasToBlob,
  downloadBlob,
  replaceFileExtension,
} from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
import { getImageDimensions, loadImageElement } from "@/lib/image/load-image"

type UploadedRaster = {
  file: File
  fileName: string
  objectUrl: string
  width: number
  height: number
  fileSize: number
}

const ACCEPTED_RASTER_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const
const ACCEPTED_RASTER_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const
const OUTPUT_FORMAT_OPTIONS = [
  {
    label: "PNG",
    value: "png",
    mimeType: "image/png",
    extension: ".png",
    quality: undefined,
  },
  {
    label: "WebP",
    value: "webp",
    mimeType: "image/webp",
    extension: ".webp",
    quality: 0.92,
  },
] as const

function getDefaultRasterExtension(file: File) {
  switch (file.type) {
    case "image/png":
      return ".png"
    case "image/jpeg":
      return ".jpg"
    case "image/webp":
      return ".webp"
    default:
      return ".png"
  }
}

function getNormalizedRasterFileName(file: File, index = 0) {
  const trimmedName = file.name.trim()

  if (trimmedName) {
    return trimmedName
  }

  return `pasted-image-${index + 1}${getDefaultRasterExtension(file)}`
}

function getAcceptedPastedRasterFiles(event: ClipboardEvent) {
  const items = event.clipboardData?.items

  if (!items) {
    return []
  }

  const files = Array.from(items)
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null)

  return files.filter(isAcceptedRaster)
}

function isAcceptedRaster(file: File) {
  const lowerCaseName = file.name.toLowerCase()

  return (
    ACCEPTED_RASTER_MIME_TYPES.includes(
      file.type as (typeof ACCEPTED_RASTER_MIME_TYPES)[number]
    ) ||
    ACCEPTED_RASTER_EXTENSIONS.some((extension) =>
      lowerCaseName.endsWith(extension)
    )
  )
}

async function parseRasterFile(
  file: File,
  index = 0
): Promise<UploadedRaster> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const dimensions = await getImageDimensions(objectUrl)

    return {
      file,
      fileName: getNormalizedRasterFileName(file, index),
      objectUrl,
      width: dimensions.width,
      height: dimensions.height,
      fileSize: file.size,
    }
  } catch {
    URL.revokeObjectURL(objectUrl)
    throw new Error(`We couldn't read ${file.name}.`)
  }
}

async function exportRasterFile(
  image: UploadedRaster,
  outputFormat: (typeof OUTPUT_FORMAT_OPTIONS)[number]
) {
  const sourceImage = await loadImageElement(image.objectUrl)
  const canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height

  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Canvas is not available in this browser.")
  }

  context.drawImage(sourceImage, 0, 0, image.width, image.height)

  const blob = await canvasToBlob(
    canvas,
    outputFormat.mimeType,
    outputFormat.quality
  )
  downloadBlob(
    blob,
    replaceFileExtension(image.fileName, outputFormat.extension)
  )
}

export function WebpToPngTool() {
  const {
    items: images,
    error,
    isLoading,
    isRunningAction: isConverting,
    actionError: conversionError,
    actionSuccess: conversionSuccess,
    setError,
    setIsLoading,
    replaceItems,
    clear,
    resetActionState,
    runAction,
  } = useObjectUrlBatch<UploadedRaster>()
  const [outputFormatValue, setOutputFormatValue] = React.useState("png")

  const handleFilesSelect = React.useCallback(
    async (files: File[]) => {
      setIsLoading(true)
      setError(null)
      resetActionState()

      const validFiles = files.filter(isAcceptedRaster)
      const invalidCount = files.length - validFiles.length

      if (validFiles.length === 0) {
        replaceItems([])
        setError("No valid PNG, JPG, or WebP files were selected.")
        setIsLoading(false)
        return
      }

      try {
        const parsedImages = await Promise.all(
          validFiles.map((file, index) => parseRasterFile(file, index))
        )

        replaceItems(parsedImages)
        setOutputFormatValue("png")

        if (invalidCount > 0) {
          setError(
            `${invalidCount} file${invalidCount === 1 ? "" : "s"} skipped because only PNG, JPG, and WebP files are supported here.`
          )
        }
      } catch (caughtError) {
        replaceItems([])
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "We couldn't read those images. Please try again."
        )
      } finally {
        setIsLoading(false)
      }
    },
    [replaceItems, resetActionState, setError, setIsLoading]
  )

  React.useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const pastedFiles = getAcceptedPastedRasterFiles(event)

      if (pastedFiles.length === 0) {
        return
      }

      event.preventDefault()
      void handleFilesSelect(pastedFiles)
    }

    document.addEventListener("paste", onPaste)

    return () => {
      document.removeEventListener("paste", onPaste)
    }
  }, [handleFilesSelect])

  const selectedOutputFormat =
    OUTPUT_FORMAT_OPTIONS.find(
      (option) => option.value === outputFormatValue
    ) ?? OUTPUT_FORMAT_OPTIONS[0]

  const handleConvertAll = async () => {
    if (images.length === 0) {
      return
    }

    await runAction({
      action: async () => {
        for (const image of images) {
          await exportRasterFile(image, selectedOutputFormat)
        }
      },
      successMessage: `${images.length} ${selectedOutputFormat.label} download${images.length === 1 ? "" : "s"} started successfully.`,
      fallbackErrorMessage: "Conversion failed. Please try another batch.",
    })
  }

  if (images.length === 0) {
    return (
      <FileDropzone
        title="Convert PNG, JPG, and WebP images"
        description="Choose one image or a whole batch, preview the first item instantly, and export fresh PNG or WebP files without uploading anything anywhere."
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        helperText="Bulk upload is supported here. Output format is chosen after upload, and the browser may ask you to allow multiple downloads."
        isLoading={isLoading}
        error={error}
        supportsPaste
        multiple
        onFilesSelect={handleFilesSelect}
      />
    )
  }

  const firstImage = images[0]!
  const totalFileSize = images.reduce((sum, image) => sum + image.fileSize, 0)

  return (
    <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
      <CardHeader className="bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent">
        <Badge variant="outline" className="self-start">
          Raster Convert
        </Badge>
        <CardTitle className="text-2xl tracking-tight">
          Batch-convert raster images in the browser
        </CardTitle>
        <CardDescription>
          Every selected image keeps its original pixel dimensions and downloads
          as PNG or WebP directly from the browser.
        </CardDescription>
        <CardAction>
          <Button variant="outline" onClick={clear}>
            <RefreshCcw data-icon="inline-start" />
            Choose another batch
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.95fr)]">
        <div className="flex flex-col gap-4">
          <CheckerboardSurface
            className="py-4"
            contentClassName="flex min-h-[18rem] items-center justify-center p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed with a native img element */}
            <img
              src={firstImage.objectUrl}
              alt={`Preview of ${firstImage.fileName}`}
              className="max-h-[28rem] w-auto max-w-full rounded-2xl shadow-sm"
            />
          </CheckerboardSurface>

          <Alert>
            <Files />
            <AlertTitle>Batch preview</AlertTitle>
            <AlertDescription>
              Showing the first file in the batch. Clicking download starts a
              {selectedOutputFormat.label} download for every selected image.
            </AlertDescription>
          </Alert>
        </div>

        <Card className="rounded-[1.5rem] border-border/70 bg-background/65">
          <CardHeader>
            <CardTitle>Batch details</CardTitle>
            <CardDescription>
              {images.length} file{images.length === 1 ? "" : "s"} selected
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Files</CardDescription>
                  <CardTitle className="text-lg">{images.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Total size</CardDescription>
                  <CardTitle className="text-lg">
                    {formatFileSize(totalFileSize)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>First width</CardDescription>
                  <CardTitle className="text-lg">
                    {firstImage.width}px
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>First height</CardDescription>
                  <CardTitle className="text-lg">
                    {firstImage.height}px
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Field>
              <FieldLabel>Output format</FieldLabel>
              <FieldDescription>
                PNG is the safest default. WebP usually produces smaller files.
              </FieldDescription>
              <FieldContent>
                <FieldGroup>
                  <ToggleGroup
                    multiple={false}
                    variant="outline"
                    value={[outputFormatValue]}
                    onValueChange={(groupValue) => {
                      const value = groupValue[0] ?? ""

                      if (!value) {
                        return
                      }

                      resetActionState()
                      setOutputFormatValue(value)
                    }}
                    className="flex w-full flex-wrap justify-start gap-2"
                  >
                    {OUTPUT_FORMAT_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="min-w-24"
                      >
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FieldGroup>
              </FieldContent>
            </Field>

            <Separator />

            <BatchFileList
              items={images}
              getKey={(image) => image.objectUrl}
              getTitle={(image) => image.fileName}
              getDescription={(image) =>
                `${image.width}px x ${image.height}px, ${formatFileSize(image.fileSize)}`
              }
            />

            <Alert>
              <Download />
              <AlertTitle>Output</AlertTitle>
              <AlertDescription>
                Each file downloads as a {selectedOutputFormat.label} with the
                same resolution as its original image.
              </AlertDescription>
            </Alert>

            {conversionSuccess ? (
              <StatusAlert
                status="success"
                title="Downloads ready"
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
              onClick={handleConvertAll}
            >
              <Download data-icon="inline-start" />
              {isConverting
                ? `Exporting ${selectedOutputFormat.label}s...`
                : `Download ${images.length} ${selectedOutputFormat.label}${images.length === 1 ? "" : "s"}`}
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  )
}
