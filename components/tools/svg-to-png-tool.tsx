"use client"

import * as React from "react"
import { Download, RefreshCcw, ScanSearch } from "lucide-react"

import { FileDropzone } from "@/components/shared/file-dropzone"
import { BatchFileList } from "@/components/tools/shared/batch-file-list"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useObjectUrlBatch } from "@/hooks/use-object-url-batch"
import { getNormalizedFileName } from "@/lib/file-input"
import { downloadBlob, replaceFileExtension } from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
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
    clear,
    resetActionState,
    runAction,
  } = useObjectUrlBatch<UploadedSvg>()
  const [selectedScale, setSelectedScale] = React.useState("1")
  const [outputWidthInput, setOutputWidthInput] = React.useState("")
  const [outputFormatValue, setOutputFormatValue] = React.useState("png")

  const handleFilesSelect = React.useCallback(
    async (files: File[]) => {
      setIsLoading(true)
      setError(null)
      resetActionState()

      const validFiles = files.filter(isAcceptedSvg)
      const invalidCount = files.length - validFiles.length

      if (validFiles.length === 0) {
        replaceItems([])
        setError("No valid SVG files were selected.")
        setIsLoading(false)
        return
      }

      try {
        const parsedSvgs = await Promise.all(validFiles.map(parseSvgFile))

        replaceItems(parsedSvgs)

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
        replaceItems([])
        setError("We couldn't read those SVG files. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [replaceItems, resetActionState, setError, setIsLoading]
  )

  const handleMarkupPaste = React.useCallback(
    async (content: string) => {
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

        replaceItems([pastedSvg])
        setSelectedScale("1")
        setOutputWidthInput(String(Math.round(pastedSvg.width)))
        setOutputFormatValue("png")
      } catch {
        setError("We couldn't read that SVG. Please try another file.")
      } finally {
        setIsLoading(false)
      }
    },
    [replaceItems, resetActionState, setError, setIsLoading]
  )

  const handleClear = React.useCallback(() => {
    clear()
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

  const firstSvg = svgs[0]!
  const outputWidth = getOutputWidth(outputWidthInput, firstSvg.width)
  const outputHeight = Math.max(
    1,
    Math.round(outputWidth / firstSvg.aspectRatio)
  )
  const totalFileSize = svgs.reduce((sum, svg) => sum + svg.fileSize, 0)
  const outputFormat =
    OUTPUT_FORMAT_OPTIONS.find(
      (format) => format.value === outputFormatValue
    ) ?? OUTPUT_FORMAT_OPTIONS[0]
  const defaultSingleExportFileName =
    svgs.length === 1
      ? Math.round(firstSvg.width) === outputWidth
        ? replaceFileExtension(firstSvg.fileName, outputFormat.extension)
        : replaceFileExtension(
            firstSvg.fileName,
            `-${outputWidth}w${outputFormat.extension}`
          )
      : ""

  const handleScaleChange = (value: string) => {
    if (!firstSvg || !value) {
      return
    }

    resetActionState()
    setSelectedScale(value)
    setOutputWidthInput(String(Math.round(firstSvg.width * Number(value))))
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

  const handleConvertAll = async (outputFileName?: string) => {
    await runAction({
      action: async () => {
        for (const svg of svgs) {
          const svgWidth = selectedScale
            ? Math.max(1, Math.round(svg.width * Number(selectedScale)))
            : outputWidth
          const svgHeight = Math.max(1, Math.round(svgWidth / svg.aspectRatio))
          const blob = await rasterizeSvgToPng(
            svg.content,
            svgWidth,
            svgHeight,
            outputFormat.mimeType,
            outputFormat.quality
          )
          const fileName =
            svgs.length === 1 && outputFileName
              ? outputFileName
              : Math.round(svg.width) === svgWidth
              ? replaceFileExtension(svg.fileName, outputFormat.extension)
              : replaceFileExtension(
                  svg.fileName,
                  `-${svgWidth}w${outputFormat.extension}`
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
      title="Export a whole SVG batch as PNG or WebP"
      description="Use a shared export width or a scale preset, choose the output format, then download raster exports for every selected SVG directly from the browser."
      onReset={handleClear}
      resetIcon={<RefreshCcw data-icon="inline-start" />}
      preview={
        <>
          <CheckerboardSurface
            className="py-4"
            contentClassName="flex min-h-[18rem] items-center justify-center p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG object URLs are previewed directly in the browser */}
            <img
              src={firstSvg.objectUrl}
              alt={`Preview of ${firstSvg.fileName}`}
              className="max-h-[28rem] w-auto max-w-full rounded-2xl shadow-sm"
            />
          </CheckerboardSurface>

          <Alert>
            <ScanSearch />
            <AlertTitle>Batch preview</AlertTitle>
            <AlertDescription>
              Showing the first file in the batch. The current width controls
              apply to every selected SVG.
            </AlertDescription>
          </Alert>
        </>
      }
      settings={
        <ToolSettingsCard
          title="Export settings"
          footer={
            <ToolPrimaryFooter className="pt-0">
              {svgs.length === 1 ? (
                <DownloadFileAction
                  buttonLabel={
                    isConverting
                      ? `Exporting ${outputFormat.label}...`
                      : `Download ${outputFormat.label}`
                  }
                  defaultFileName={defaultSingleExportFileName}
                  outputExtension={outputFormat.extension}
                  resetKey={firstSvg.objectUrl}
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
                <ToggleGroup
                  multiple={false}
                  variant="outline"
                  value={[outputFormatValue]}
                  onValueChange={(groupValue) =>
                    handleFormatChange(groupValue[0] ?? "")
                  }
                  className="flex w-full flex-wrap gap-2"
                >
                  {OUTPUT_FORMAT_OPTIONS.map((format) => (
                    <ToggleGroupItem
                      key={format.value}
                      value={format.value}
                      className="min-w-16"
                    >
                      {format.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldDescription>
                  PNG is best for lossless export. WebP is useful when you want
                  smaller files.
                </FieldDescription>
              </FieldContent>
            </Field>

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
                      className="min-w-14"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldDescription>
                  Presets scale each SVG from its own natural width.
                </FieldDescription>
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
                  width while preserving its own aspect ratio.
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
