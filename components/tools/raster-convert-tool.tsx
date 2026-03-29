"use client"

import * as React from "react"
import { Download, Files, RefreshCcw } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { BatchFileList } from "@/components/tools/shared/batch-file-list"
import { BatchPreviewControls } from "@/components/tools/shared/batch-preview-controls"
import { CheckerboardSurface } from "@/components/tools/shared/checkerboard-surface"
import { DownloadFileAction } from "@/components/tools/shared/download-file-action"
import { PresetToggleGroup } from "@/components/tools/shared/preset-toggle-group"
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import {
  revokeObjectUrls,
  useObjectUrlBatch,
} from "@/hooks/use-object-url-batch"
import { ConcurrentMapError, mapAsyncWithConcurrency } from "@/lib/async"
import { getNormalizedFileName } from "@/lib/file-input"
import {
  canvasToBlob,
  downloadBlob,
  replaceFileExtension,
} from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
import { getImageDimensions, loadImageElement } from "@/lib/image/load-image"
import {
  RASTER_IMAGE_ACCEPT,
  RASTER_IMAGE_EXTENSIONS,
  RASTER_IMAGE_MIME_TYPES,
} from "@/lib/image/raster"

type UploadedRaster = {
  file: File
  fileName: string
  objectUrl: string
  width: number
  height: number
  fileSize: number
}

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
const BATCH_PARSE_CONCURRENCY = 4

function isAcceptedRaster(file: File) {
  const lowerCaseName = file.name.toLowerCase()

  return (
    RASTER_IMAGE_MIME_TYPES.includes(
      file.type as (typeof RASTER_IMAGE_MIME_TYPES)[number]
    ) ||
    RASTER_IMAGE_EXTENSIONS.some((extension) =>
      lowerCaseName.endsWith(extension)
    )
  )
}

async function parseRasterFile(file: File, index = 0): Promise<UploadedRaster> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const dimensions = await getImageDimensions(objectUrl)

    return {
      file,
      fileName: getNormalizedFileName(file, {
        fallbackBaseName: "pasted-image",
        index,
      }),
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
  outputFormat: (typeof OUTPUT_FORMAT_OPTIONS)[number],
  outputFileName?: string
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
    outputFileName ??
      replaceFileExtension(image.fileName, outputFormat.extension)
  )
}

export function RasterConvertTool() {
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
    beginRequest,
    isRequestCurrent,
    clear,
    resetActionState,
    runAction,
  } = useObjectUrlBatch<UploadedRaster>()
  const [outputFormatValue, setOutputFormatValue] = React.useState("png")
  const [previewIndex, setPreviewIndex] = React.useState(0)

  const handleFilesSelect = React.useCallback(
    async (files: File[]) => {
      const requestId = beginRequest()
      setIsLoading(true)
      setError(null)
      resetActionState()

      const validFiles = files.filter(isAcceptedRaster)
      const invalidCount = files.length - validFiles.length

      if (validFiles.length === 0) {
        replaceItems([])
        if (isRequestCurrent(requestId)) {
          setError("No valid PNG, JPG, or WebP files were selected.")
          setIsLoading(false)
        }
        return
      }

      try {
        const parsedImages = await mapAsyncWithConcurrency(
          validFiles,
          (file, index) => parseRasterFile(file, index),
          BATCH_PARSE_CONCURRENCY
        )

        if (!isRequestCurrent(requestId)) {
          revokeObjectUrls(parsedImages)
          return
        }

        replaceItems(parsedImages)
        setPreviewIndex(0)
        setOutputFormatValue("png")

        if (invalidCount > 0) {
          setError(
            `${invalidCount} file${invalidCount === 1 ? "" : "s"} skipped because only PNG, JPG, and WebP files are supported here.`
          )
        }
      } catch (caughtError) {
        if (caughtError instanceof ConcurrentMapError) {
          revokeObjectUrls(caughtError.partialResults)
        }

        if (isRequestCurrent(requestId)) {
          replaceItems([])
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "We couldn't read those images. Please try again."
          )
        }
      } finally {
        if (isRequestCurrent(requestId)) {
          setIsLoading(false)
        }
      }
    },
    [
      beginRequest,
      isRequestCurrent,
      replaceItems,
      resetActionState,
      setError,
      setIsLoading,
    ]
  )

  const selectedOutputFormat =
    OUTPUT_FORMAT_OPTIONS.find(
      (option) => option.value === outputFormatValue
    ) ?? OUTPUT_FORMAT_OPTIONS[0]

  React.useEffect(() => {
    if (images.length === 0) {
      setPreviewIndex(0)
      return
    }

    setPreviewIndex((currentIndex) => Math.min(currentIndex, images.length - 1))
  }, [images.length])

  if (images.length === 0) {
    return (
      <FileDropzone
        title="Convert PNG, JPG, and WebP images"
        description="Choose one image or a whole batch, preview the first item instantly, and export fresh PNG or WebP files without uploading anything anywhere."
        accept={RASTER_IMAGE_ACCEPT}
        acceptedFormatsLabel="PNG, JPG, or WebP"
        helperText="Bulk upload is supported here. Output format is chosen after upload."
        isLoading={isLoading}
        error={error}
        supportsPaste
        multiple
        onFilesSelect={handleFilesSelect}
      />
    )
  }

  const previewImage = images[previewIndex] ?? images[0]!
  const totalFileSize = images.reduce((sum, image) => sum + image.fileSize, 0)
  const defaultSingleExportFileName = replaceFileExtension(
    previewImage.fileName,
    selectedOutputFormat.extension
  )

  const selectPreviewIndex = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= images.length) {
      return
    }

    setPreviewIndex(nextIndex)
  }

  const handlePreviewPrevious = () => {
    selectPreviewIndex(
      previewIndex === 0 ? images.length - 1 : previewIndex - 1
    )
  }

  const handlePreviewNext = () => {
    selectPreviewIndex(
      previewIndex === images.length - 1 ? 0 : previewIndex + 1
    )
  }

  const handleConvertAll = async (outputFileName?: string) => {
    if (images.length === 0) {
      return
    }

    await runAction({
      action: async () => {
        for (const image of images) {
          await exportRasterFile(
            image,
            selectedOutputFormat,
            images.length === 1 ? outputFileName : undefined
          )
        }
      },
      successMessage: `${images.length} ${selectedOutputFormat.label} download${images.length === 1 ? "" : "s"} started successfully.`,
      fallbackErrorMessage: "Conversion failed. Please try another batch.",
    })
  }

  return (
    <ToolWorkspace
      badge="Raster Convert"
      onReset={clear}
      resetIcon={<RefreshCcw data-icon="inline-start" />}
      preview={
        <>
          <BatchPreviewControls
            currentIndex={previewIndex}
            totalCount={images.length}
            currentLabel={previewImage.fileName}
            itemLabel="Image"
            onPrevious={handlePreviewPrevious}
            onNext={handlePreviewNext}
          />

          <CheckerboardSurface
            className="py-4"
            contentClassName="flex min-h-[18rem] items-center justify-center p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed with a native img element */}
            <img
              src={previewImage.objectUrl}
              alt={`Preview of ${previewImage.fileName}`}
              className="max-h-112 w-auto max-w-full rounded-2xl shadow-sm"
            />
          </CheckerboardSurface>

          {images.length > 1 ? (
            <Alert>
              <Files />
              <AlertTitle>Batch preview</AlertTitle>
              <AlertDescription>
                Browse the batch with the preview controls or select a file from
                the list. Clicking download still starts a{" "}
                {selectedOutputFormat.label} download for every selected image.
              </AlertDescription>
            </Alert>
          ) : null}
        </>
      }
      settings={
        <ToolSettingsCard
          title="Batch details"
          footer={
            <ToolPrimaryFooter>
              {images.length === 1 ? (
                <DownloadFileAction
                  buttonLabel={
                    isConverting
                      ? `Exporting ${selectedOutputFormat.label}...`
                      : `Download ${selectedOutputFormat.label}`
                  }
                  defaultFileName={defaultSingleExportFileName}
                  outputExtension={selectedOutputFormat.extension}
                  resetKey={previewImage.objectUrl}
                  disabled={isConverting}
                  onDownload={handleConvertAll}
                />
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  disabled={isConverting}
                  onClick={() => void handleConvertAll()}
                >
                  <Download data-icon="inline-start" />
                  {isConverting
                    ? `Exporting ${selectedOutputFormat.label}s...`
                    : `Download ${images.length} ${selectedOutputFormat.label}s`}
                </Button>
              )}
            </ToolPrimaryFooter>
          }
        >
          <ToolStatGrid>
            <ToolStatCard label="Files" value={images.length} />
            <ToolStatCard
              label="Total size"
              value={formatFileSize(totalFileSize)}
            />
            <ToolStatCard
              label="Preview width"
              value={`${previewImage.width}px`}
            />
            <ToolStatCard
              label="Preview height"
              value={`${previewImage.height}px`}
            />
          </ToolStatGrid>

          <Field>
            <FieldLabel>Output format</FieldLabel>
            <FieldDescription>
              PNG is the safest default. WebP usually produces smaller files.
            </FieldDescription>
            <FieldContent>
              <FieldGroup>
                <PresetToggleGroup
                  value={outputFormatValue}
                  onValueChange={(value) => {
                    if (!value) {
                      return
                    }

                    resetActionState()
                    setOutputFormatValue(value)
                  }}
                  options={OUTPUT_FORMAT_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  itemClassName="min-w-24"
                />
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
            selectedKey={previewImage.objectUrl}
            onItemSelect={(image) =>
              selectPreviewIndex(
                images.findIndex(
                  (candidateImage) =>
                    candidateImage.objectUrl === image.objectUrl
                )
              )
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
        </ToolSettingsCard>
      }
      gridClassName="lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.95fr)]"
    />
  )
}
