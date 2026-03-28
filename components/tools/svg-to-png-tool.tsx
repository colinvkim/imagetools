"use client"

import * as React from "react"
import { Download, RefreshCcw, ScanSearch } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  revokeObjectUrls,
  useObjectUrlBatch,
} from "@/hooks/use-object-url-batch"
import { getNormalizedFileName } from "@/lib/file-input"
import { downloadBlob, replaceFileExtension } from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
import {
  getRasterOutputLimitsLabel,
  validateRasterOutputDimensions,
} from "@/lib/image/output-dimensions"
import {
  createSvgObjectUrl,
  parseSvgMetadata,
  rasterizeSvgToPng,
} from "@/lib/image/svg"

type UploadedSvg = {
  fileName: string
  mimeType: string
  content: string
  objectUrl: string
  width: number
  height: number
  aspectRatio: number
  fileSize: number
}

const SCALE_OPTIONS = [
  { label: "1x", value: "1" },
  { label: "2x", value: "2" },
  { label: "4x", value: "4" },
  { label: "8x", value: "8" },
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

function isAcceptedSvg(file: File) {
  return (
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")
  )
}

function isSvgMarkup(value: string) {
  return /<svg[\s>]/i.test(value)
}

function getSvgMarkupFromClipboard(event: ClipboardEvent) {
  const items = event.clipboardData?.items

  if (!items) {
    return null
  }

  for (const item of Array.from(items)) {
    if (item.type !== "text/plain" && item.type !== "text/html") {
      continue
    }

    const text = event.clipboardData?.getData(item.type)?.trim()

    if (text && isSvgMarkup(text)) {
      return text
    }
  }

  return null
}

function getOutputWidth(value: string, originalWidth: number) {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return Math.round(originalWidth)
  }

  return parsedValue
}

async function parseSvgContent(
  content: string,
  fileName: string,
  mimeType: string,
  fileSize: number
): Promise<UploadedSvg> {
  const metadata = parseSvgMetadata(content)
  const objectUrl = createSvgObjectUrl(content)

  return {
    fileName,
    mimeType,
    content,
    objectUrl,
    width: metadata.width,
    height: metadata.height,
    aspectRatio: metadata.aspectRatio,
    fileSize,
  }
}

async function parseSvgFile(file: File) {
  const content = await file.text()

  return parseSvgContent(
    content,
    getNormalizedFileName(file, { fallbackBaseName: "pasted-artwork" }),
    file.type || "image/svg+xml",
    file.size
  )
}

export function SvgToPngTool() {
  const {
    items: svgs,
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
  } = useObjectUrlBatch<UploadedSvg>()
  const [selectedScale, setSelectedScale] = React.useState("1")
  const [outputWidthInput, setOutputWidthInput] = React.useState("")
  const [outputFormatValue, setOutputFormatValue] = React.useState("png")
  const [previewIndex, setPreviewIndex] = React.useState(0)

  const handleFilesSelect = React.useCallback(
    async (files: File[]) => {
      const requestId = beginRequest()
      setIsLoading(true)
      setError(null)
      resetActionState()

      const validFiles = files.filter(isAcceptedSvg)
      const invalidCount = files.length - validFiles.length

      if (validFiles.length === 0) {
        replaceItems([])
        if (isRequestCurrent(requestId)) {
          setError("No valid SVG files were selected.")
          setIsLoading(false)
        }
        return
      }

      try {
        const parsedSvgs = await Promise.all(validFiles.map(parseSvgFile))

        if (!isRequestCurrent(requestId)) {
          revokeObjectUrls(parsedSvgs)
          return
        }

        replaceItems(parsedSvgs)
        setPreviewIndex(0)

        const firstSvg = parsedSvgs[0]

        if (firstSvg) {
          setSelectedScale("1")
          setOutputWidthInput(String(Math.round(firstSvg.width)))
          setOutputFormatValue("png")
        }

        if (invalidCount > 0) {
          setError(
            `${invalidCount} file${invalidCount === 1 ? "" : "s"} skipped because only SVG files are supported here.`
          )
        }
      } catch {
        if (isRequestCurrent(requestId)) {
          replaceItems([])
          setError("We couldn't read those SVG files. Please try again.")
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

  const handleMarkupPaste = React.useCallback(
    async (content: string) => {
      const requestId = beginRequest()
      setIsLoading(true)
      setError(null)
      resetActionState()

      try {
        const pastedSvg = await parseSvgContent(
          content,
          "pasted-artwork.svg",
          "image/svg+xml",
          new Blob([content]).size
        )

        if (!isRequestCurrent(requestId)) {
          revokeObjectUrls([pastedSvg])
          return
        }

        replaceItems([pastedSvg])
        setPreviewIndex(0)
        setSelectedScale("1")
        setOutputWidthInput(String(Math.round(pastedSvg.width)))
        setOutputFormatValue("png")
      } catch {
        if (isRequestCurrent(requestId)) {
          setError("We couldn't read that SVG. Please try another file.")
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

  const handleClear = React.useCallback(() => {
    clear()
    setPreviewIndex(0)
    setSelectedScale("1")
    setOutputWidthInput("")
    setOutputFormatValue("png")
  }, [clear])

  React.useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const markup = getSvgMarkupFromClipboard(event)

      if (!markup) {
        return
      }

      event.preventDefault()
      void handleMarkupPaste(markup)
    }

    document.addEventListener("paste", onPaste)

    return () => {
      document.removeEventListener("paste", onPaste)
    }
  }, [handleFilesSelect, handleMarkupPaste])

  React.useEffect(() => {
    if (svgs.length === 0) {
      setPreviewIndex(0)
      return
    }

    setPreviewIndex((currentIndex) => Math.min(currentIndex, svgs.length - 1))
  }, [svgs.length])

  if (svgs.length === 0) {
    return (
      <FileDropzone
        title="Export SVG artwork as PNG or WebP files"
        description="Choose one SVG or a whole batch, keep a shared export width, and download raster exports entirely in the browser."
        accept=".svg,image/svg+xml"
        acceptedFormatsLabel="SVG"
        helperText="Bulk upload is supported here. Paste works for a copied SVG file or raw SVG markup."
        isLoading={isLoading}
        error={error}
        supportsPaste
        multiple
        onFilesSelect={handleFilesSelect}
      />
    )
  }

  const previewSvg = svgs[previewIndex] ?? svgs[0]!
  const outputWidth = getOutputWidth(outputWidthInput, previewSvg.width)
  const outputHeight = Math.max(
    1,
    Math.round(outputWidth / previewSvg.aspectRatio)
  )
  const totalFileSize = svgs.reduce((sum, svg) => sum + svg.fileSize, 0)
  const outputFormat =
    OUTPUT_FORMAT_OPTIONS.find(
      (format) => format.value === outputFormatValue
    ) ?? OUTPUT_FORMAT_OPTIONS[0]
  const defaultSingleExportFileName =
    svgs.length === 1
      ? Math.round(previewSvg.width) === outputWidth
        ? replaceFileExtension(previewSvg.fileName, outputFormat.extension)
        : replaceFileExtension(
            previewSvg.fileName,
            `-${outputWidth}w${outputFormat.extension}`
          )
      : ""

  const selectPreviewIndex = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= svgs.length) {
      return
    }

    setPreviewIndex(nextIndex)

    if (selectedScale) {
      setOutputWidthInput(
        String(Math.round(svgs[nextIndex]!.width * Number(selectedScale)))
      )
    }
  }

  const handleScaleChange = (value: string) => {
    if (!previewSvg || !value) {
      return
    }

    resetActionState()
    setSelectedScale(value)
    setOutputWidthInput(String(Math.round(previewSvg.width * Number(value))))
  }

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    resetActionState()
    setSelectedScale("")
    setOutputWidthInput(event.target.value)
  }

  const handleFormatChange = (value: string) => {
    if (!value) {
      return
    }

    resetActionState()
    setOutputFormatValue(value)
  }

  const handlePreviewPrevious = () => {
    selectPreviewIndex(previewIndex === 0 ? svgs.length - 1 : previewIndex - 1)
  }

  const handlePreviewNext = () => {
    selectPreviewIndex(previewIndex === svgs.length - 1 ? 0 : previewIndex + 1)
  }

  const handleConvertAll = async (outputFileName?: string) => {
    await runAction({
      action: async () => {
        for (const svg of svgs) {
          const svgWidth = selectedScale
            ? Math.max(1, Math.round(svg.width * Number(selectedScale)))
            : outputWidth
          const validatedDimensions = validateRasterOutputDimensions({
            width: svgWidth,
            height: Math.max(1, Math.round(svgWidth / svg.aspectRatio)),
            label: `Export size for ${svg.fileName}`,
          })
          const blob = await rasterizeSvgToPng(
            svg.content,
            validatedDimensions.width,
            validatedDimensions.height,
            outputFormat.mimeType,
            outputFormat.quality
          )
          const fileName =
            svgs.length === 1 && outputFileName
              ? outputFileName
              : Math.round(svg.width) === validatedDimensions.width
                ? replaceFileExtension(svg.fileName, outputFormat.extension)
                : replaceFileExtension(
                    svg.fileName,
                    `-${validatedDimensions.width}w${outputFormat.extension}`
                  )

          downloadBlob(blob, fileName)
        }
      },
      successMessage: `${svgs.length} ${outputFormat.label} download${svgs.length === 1 ? "" : "s"} started successfully.`,
      fallbackErrorMessage: "Conversion failed. Please try another SVG batch.",
    })
  }

  return (
    <ToolWorkspace
      badge="SVG Export"
      onReset={handleClear}
      resetIcon={<RefreshCcw data-icon="inline-start" />}
      preview={
        <>
          <BatchPreviewControls
            currentIndex={previewIndex}
            totalCount={svgs.length}
            currentLabel={previewSvg.fileName}
            itemLabel="SVG"
            onPrevious={handlePreviewPrevious}
            onNext={handlePreviewNext}
          />

          <CheckerboardSurface
            className="py-4"
            contentClassName="flex min-h-[18rem] items-center justify-center p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG object URLs are previewed directly in the browser */}
            <img
              src={previewSvg.objectUrl}
              alt={`Preview of ${previewSvg.fileName}`}
              className="max-h-[28rem] w-auto max-w-full rounded-2xl shadow-sm"
            />
          </CheckerboardSurface>

          {svgs.length > 1 ? (
            <Alert>
              <ScanSearch />
              <AlertTitle>Batch preview</AlertTitle>
              <AlertDescription>
                Browse the batch with the preview controls or select a file from
                the list. The current width controls still apply to every
                selected SVG.
              </AlertDescription>
            </Alert>
          ) : null}
        </>
      }
      settings={
        <ToolSettingsCard
          title="Export settings"
          footer={
            <ToolPrimaryFooter>
              {svgs.length === 1 ? (
                <DownloadFileAction
                  buttonLabel={
                    isConverting
                      ? `Exporting ${outputFormat.label}...`
                      : `Download ${outputFormat.label}`
                  }
                  defaultFileName={defaultSingleExportFileName}
                  outputExtension={outputFormat.extension}
                  resetKey={previewSvg.objectUrl}
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
                    ? `Exporting ${outputFormat.label}...`
                    : `Download ${svgs.length} ${outputFormat.label}s`}
                </Button>
              )}
            </ToolPrimaryFooter>
          }
        >
          <ToolStatGrid>
            <ToolStatCard label="Files" value={svgs.length} />
            <ToolStatCard
              label="Total size"
              value={formatFileSize(totalFileSize)}
            />
            <ToolStatCard label="Preview width" value={`${outputWidth}px`} />
            <ToolStatCard label="Preview height" value={`${outputHeight}px`} />
            <ToolStatCard label="Format" value={outputFormat.label} />
          </ToolStatGrid>

          <Separator />

          <FieldGroup>
            <Field>
              <FieldLabel>Output format</FieldLabel>
              <FieldContent>
                <PresetToggleGroup
                  value={outputFormatValue}
                  onValueChange={handleFormatChange}
                  options={OUTPUT_FORMAT_OPTIONS.map((format) => ({
                    value: format.value,
                    label: format.label,
                  }))}
                  itemClassName="min-w-16"
                />
                <FieldDescription>
                  PNG is best for lossless export. WebP is useful when you want
                  smaller files.
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Scale presets</FieldLabel>
              <FieldContent>
                <PresetToggleGroup
                  value={selectedScale}
                  onValueChange={handleScaleChange}
                  options={SCALE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  itemClassName="min-w-14"
                />
                {/* <FieldDescription>
                  Presets scale each SVG from its own natural width.
                </FieldDescription> */}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="svg-output-width">
                Shared custom width
              </FieldLabel>
              <FieldContent>
                <Input
                  id="svg-output-width"
                  name="svg-output-width"
                  type="number"
                  min={1}
                  step={1}
                  value={outputWidthInput}
                  onChange={handleWidthChange}
                  autoComplete="off"
                  inputMode="numeric"
                />
                <FieldDescription>
                  When you type a width, every selected SVG exports at that
                  width while preserving its own aspect ratio. Limit:{" "}
                  {getRasterOutputLimitsLabel()}.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>

          <BatchFileList
            items={svgs}
            getKey={(svg) => svg.objectUrl}
            getTitle={(svg) => svg.fileName}
            getDescription={(svg) => {
              const svgWidth = selectedScale
                ? Math.max(1, Math.round(svg.width * Number(selectedScale)))
                : outputWidth
              const svgHeight = Math.max(
                1,
                Math.round(svgWidth / svg.aspectRatio)
              )

              return `${Math.round(svg.width)}px x ${Math.round(svg.height)}px -> ${svgWidth}px x ${svgHeight}px, ${formatFileSize(svg.fileSize)}`
            }}
            selectedKey={previewSvg.objectUrl}
            onItemSelect={(svg) =>
              selectPreviewIndex(
                svgs.findIndex(
                  (candidateSvg) => candidateSvg.objectUrl === svg.objectUrl
                )
              )
            }
          />

          <Alert>
            <Download />
            <AlertTitle>Output</AlertTitle>
            <AlertDescription>
              Every SVG downloads as a {outputFormat.label} with its own aspect
              ratio preserved.
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
