"use client"

import * as React from "react"
import { Download, RefreshCcw, ScanSearch } from "lucide-react"

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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
    file.name,
    file.type || "image/svg+xml",
    file.size
  )
}

export function SvgToPngTool() {
  const [svgs, setSvgs] = React.useState<UploadedSvg[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isConverting, setIsConverting] = React.useState(false)
  const [conversionError, setConversionError] = React.useState<string | null>(
    null
  )
  const [conversionSuccess, setConversionSuccess] = React.useState<
    string | null
  >(null)
  const [selectedScale, setSelectedScale] = React.useState("1")
  const [outputWidthInput, setOutputWidthInput] = React.useState("")

  React.useEffect(() => {
    return () => {
      for (const svg of svgs) {
        URL.revokeObjectURL(svg.objectUrl)
      }
    }
  }, [svgs])

  const clear = React.useCallback(() => {
    setSvgs((currentSvgs) => {
      for (const svg of currentSvgs) {
        URL.revokeObjectURL(svg.objectUrl)
      }

      return []
    })
    setError(null)
    setIsLoading(false)
    setIsConverting(false)
    setConversionError(null)
    setConversionSuccess(null)
    setSelectedScale("1")
    setOutputWidthInput("")
  }, [])

  const handleFilesSelect = React.useCallback(async (files: File[]) => {
    setIsLoading(true)
    setError(null)
    setConversionError(null)
    setConversionSuccess(null)

    const validFiles = files.filter(isAcceptedSvg)
    const invalidCount = files.length - validFiles.length

    if (validFiles.length === 0) {
      setSvgs((currentSvgs) => {
        for (const svg of currentSvgs) {
          URL.revokeObjectURL(svg.objectUrl)
        }

        return []
      })
      setError("No valid SVG files were selected.")
      setIsLoading(false)
      return
    }

    try {
      const parsedSvgs = await Promise.all(validFiles.map(parseSvgFile))

      setSvgs((currentSvgs) => {
        for (const svg of currentSvgs) {
          URL.revokeObjectURL(svg.objectUrl)
        }

        return parsedSvgs
      })

      const firstSvg = parsedSvgs[0]

      if (firstSvg) {
        setSelectedScale("1")
        setOutputWidthInput(String(Math.round(firstSvg.width)))
      }

      if (invalidCount > 0) {
        setError(
          `${invalidCount} file${invalidCount === 1 ? "" : "s"} skipped because only SVG files are supported here.`
        )
      }
    } catch {
      setSvgs((currentSvgs) => {
        for (const svg of currentSvgs) {
          URL.revokeObjectURL(svg.objectUrl)
        }

        return []
      })
      setError("We couldn't read those SVG files. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleMarkupPaste = React.useCallback(async (content: string) => {
    setIsLoading(true)
    setError(null)
    setConversionError(null)
    setConversionSuccess(null)

    try {
      const pastedSvg = await parseSvgContent(
        content,
        "pasted-artwork.svg",
        "image/svg+xml",
        new Blob([content]).size
      )

      setSvgs((currentSvgs) => {
        for (const svg of currentSvgs) {
          URL.revokeObjectURL(svg.objectUrl)
        }

        return [pastedSvg]
      })
      setSelectedScale("1")
      setOutputWidthInput(String(Math.round(pastedSvg.width)))
    } catch {
      setError("We couldn't read that SVG. Please try another file.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items

      if (!items) {
        return
      }

      for (const item of Array.from(items)) {
        if (item.type !== "image/svg+xml") {
          continue
        }

        const file = item.getAsFile()

        if (!file) {
          continue
        }

        event.preventDefault()
        void handleFilesSelect([file])
        return
      }

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
        title="Turn SVG artwork into PNG files"
        description="Choose one SVG or a whole batch, keep a shared export width, and download PNGs entirely in the browser."
        accept=".svg,image/svg+xml"
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

  const handleScaleChange = (value: string) => {
    if (!firstSvg || !value) {
      return
    }

    setConversionError(null)
    setConversionSuccess(null)
    setSelectedScale(value)
    setOutputWidthInput(String(Math.round(firstSvg.width * Number(value))))
  }

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConversionError(null)
    setConversionSuccess(null)
    setSelectedScale("")
    setOutputWidthInput(event.target.value)
  }

  const handleConvertAll = async () => {
    setIsConverting(true)
    setConversionError(null)
    setConversionSuccess(null)

    try {
      for (const svg of svgs) {
        const svgWidth = selectedScale
          ? Math.max(1, Math.round(svg.width * Number(selectedScale)))
          : outputWidth
        const svgHeight = Math.max(1, Math.round(svgWidth / svg.aspectRatio))
        const blob = await rasterizeSvgToPng(svg.content, svgWidth, svgHeight)
        const fileName =
          Math.round(svg.width) === svgWidth
            ? replaceFileExtension(svg.fileName, ".png")
            : replaceFileExtension(svg.fileName, `-${svgWidth}w.png`)

        downloadBlob(blob, fileName)
      }

      setConversionSuccess(
        `${svgs.length} PNG download${svgs.length === 1 ? "" : "s"} started successfully.`
      )
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Conversion failed. Please try another SVG batch."

      setConversionError(message)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
      <CardHeader className="bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent">
        <Badge variant="outline" className="self-start">
          SVG to PNG
        </Badge>
        <CardTitle className="text-2xl tracking-tight">
          Rasterize a whole SVG batch at once
        </CardTitle>
        <CardDescription>
          Use a shared export width or a scale preset, then download PNGs for
          every selected SVG directly from the browser.
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
        </div>

        <Card className="rounded-[1.5rem] border-border/70 bg-background/65">
          <CardHeader>
            <CardTitle>Export settings</CardTitle>
            <CardDescription>
              {svgs.length} file{svgs.length === 1 ? "" : "s"} selected
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Files</CardDescription>
                  <CardTitle className="text-lg">{svgs.length}</CardTitle>
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
                  <CardDescription>Preview width</CardDescription>
                  <CardTitle className="text-lg">{outputWidth}px</CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Preview height</CardDescription>
                  <CardTitle className="text-lg">{outputHeight}px</CardTitle>
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
                    type="number"
                    min={1}
                    step={1}
                    value={outputWidthInput}
                    onChange={handleWidthChange}
                    inputMode="numeric"
                  />
                  <FieldDescription>
                    When you type a width, every selected SVG exports at that
                    width while preserving its own aspect ratio.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="flex max-h-72 flex-col gap-2 overflow-auto pr-1">
              {svgs.map((svg) => {
                const svgWidth = selectedScale
                  ? Math.max(1, Math.round(svg.width * Number(selectedScale)))
                  : outputWidth
                const svgHeight = Math.max(
                  1,
                  Math.round(svgWidth / svg.aspectRatio)
                )

                return (
                  <Card key={svg.objectUrl} size="sm">
                    <CardHeader>
                      <CardTitle className="truncate text-base">
                        {svg.fileName}
                      </CardTitle>
                      <CardDescription>
                        {Math.round(svg.width)}px x {Math.round(svg.height)}px
                        {" -> "}
                        {svgWidth}px x {svgHeight}px,{" "}
                        {formatFileSize(svg.fileSize)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>

            <Alert>
              <Download />
              <AlertTitle>Output</AlertTitle>
              <AlertDescription>
                Every SVG downloads as a PNG with its own aspect ratio
                preserved.
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
                ? "Exporting PNGs..."
                : `Download ${svgs.length} PNG${svgs.length === 1 ? "" : "s"}`}
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  )
}
