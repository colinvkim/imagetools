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
import { useSvgUpload } from "@/hooks/use-svg-upload"
import { downloadBlob, replaceFileExtension } from "@/lib/image/export"
import { formatFileSize } from "@/lib/image/format"
import { rasterizeSvgToPng } from "@/lib/image/svg"

const SCALE_OPTIONS = [
  { label: "1x", value: "1" },
  { label: "2x", value: "2" },
  { label: "4x", value: "4" },
  { label: "8x", value: "8" },
] as const

function getOutputWidth(value: string, originalWidth: number) {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return Math.round(originalWidth)
  }

  return parsedValue
}

export function SvgToPngTool() {
  const { svg, error, isLoading, clear, selectFile } = useSvgUpload({
    enablePaste: true,
  })
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
    if (!svg) {
      setSelectedScale("1")
      setOutputWidthInput("")
      setConversionError(null)
      setConversionSuccess(null)
      return
    }

    setSelectedScale("1")
    setOutputWidthInput(String(Math.round(svg.width)))
    setConversionError(null)
    setConversionSuccess(null)
  }, [svg])

  const outputWidth = svg ? getOutputWidth(outputWidthInput, svg.width) : 0
  const outputHeight = svg
    ? Math.max(1, Math.round(outputWidth / svg.aspectRatio))
    : 0

  const handleScaleChange = (value: string) => {
    if (!svg || !value) {
      return
    }

    setConversionError(null)
    setConversionSuccess(null)
    setSelectedScale(value)
    setOutputWidthInput(String(Math.round(svg.width * Number(value))))
  }

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConversionError(null)
    setConversionSuccess(null)
    setSelectedScale("")
    setOutputWidthInput(event.target.value)
  }

  const handleConvert = async () => {
    if (!svg) {
      return
    }

    setIsConverting(true)
    setConversionError(null)
    setConversionSuccess(null)

    try {
      const blob = await rasterizeSvgToPng(
        svg.content,
        outputWidth,
        outputHeight
      )
      const fileName =
        Math.round(svg.width) === outputWidth
          ? replaceFileExtension(svg.fileName, ".png")
          : replaceFileExtension(svg.fileName, `-${outputWidth}w.png`)

      downloadBlob(blob, fileName)
      setConversionSuccess("PNG download started successfully.")
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Conversion failed. Please try another SVG."

      setConversionError(message)
    } finally {
      setIsConverting(false)
    }
  }

  if (!svg) {
    return (
      <FileDropzone
        title="Turn SVG artwork into PNG files"
        description="Upload an SVG, inspect the natural size, choose a larger or custom width, and export a PNG entirely in the browser."
        accept=".svg,image/svg+xml"
        helperText="Paste works for copied SVG files and raw SVG markup too."
        isLoading={isLoading}
        error={error}
        supportsPaste
        onFileSelect={selectFile}
      />
    )
  }

  return (
    <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
      <CardHeader className="bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent">
        <Badge variant="outline" className="self-start">
          SVG to PNG
        </Badge>
        <CardTitle className="text-2xl tracking-tight">
          Scale your SVG and export a crisp PNG
        </CardTitle>
        <CardDescription>
          We preserve the SVG aspect ratio and rasterize it locally at the
          output size you choose.
        </CardDescription>
        <CardAction>
          <Button variant="outline" onClick={clear}>
            <RefreshCcw data-icon="inline-start" />
            Choose another file
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
              src={svg.objectUrl}
              alt={`Preview of ${svg.fileName}`}
              className="max-h-[28rem] w-auto max-w-full rounded-2xl shadow-sm"
            />
          </CheckerboardSurface>

          <Alert>
            <ScanSearch />
            <AlertTitle>Preview</AlertTitle>
            <AlertDescription>
              Some SVGs with external assets or unsupported filters may render
              differently once rasterized, but standard icons and illustrations
              should export cleanly.
            </AlertDescription>
          </Alert>
        </div>

        <Card className="rounded-[1.5rem] border-border/70 bg-background/65">
          <CardHeader>
            <CardTitle>Export settings</CardTitle>
            <CardDescription className="break-all">
              {svg.fileName}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Original width</CardDescription>
                  <CardTitle className="text-lg">
                    {Math.round(svg.width)}px
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Original height</CardDescription>
                  <CardTitle className="text-lg">
                    {Math.round(svg.height)}px
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Output width</CardDescription>
                  <CardTitle className="text-lg">{outputWidth}px</CardTitle>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Output height</CardDescription>
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
                    Quick scaling for common export sizes.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="svg-output-width">Custom width</FieldLabel>
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
                    Height updates automatically to preserve the original aspect
                    ratio. File size: {formatFileSize(svg.fileSize)}.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>

            <Alert>
              <Download />
              <AlertTitle>Output</AlertTitle>
              <AlertDescription>
                Exports a PNG at {outputWidth}px by {outputHeight}px.
              </AlertDescription>
            </Alert>

            {conversionSuccess ? (
              <StatusAlert
                status="success"
                title="Download ready"
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
              onClick={handleConvert}
            >
              <Download data-icon="inline-start" />
              {isConverting ? "Exporting PNG..." : "Download PNG"}
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  )
}
