import { canvasToBlob } from "@/lib/image/export"
import { loadImageElement } from "@/lib/image/load-image"

const FALLBACK_DIMENSION = 512

type SvgDimensions = {
  width: number
  height: number
}

type ParsedSvgMetadata = SvgDimensions & {
  aspectRatio: number
}

function parseSvgLength(value: string | null) {
  if (!value) {
    return null
  }

  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  const numericValue = Number.parseFloat(normalizedValue)

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null
  }

  return numericValue
}

function parseViewBox(value: string | null): SvgDimensions | null {
  if (!value) {
    return null
  }

  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map((part) => Number.parseFloat(part))

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null
  }

  const [, , width, height] = parts

  if (width <= 0 || height <= 0) {
    return null
  }

  return { width, height }
}

export function parseSvgMetadata(svgContent: string): ParsedSvgMetadata {
  const parser = new DOMParser()
  const document = parser.parseFromString(svgContent, "image/svg+xml")
  const svgElement = document.documentElement
  const viewBoxDimensions = parseViewBox(svgElement.getAttribute("viewBox"))
  const parsedWidth = parseSvgLength(svgElement.getAttribute("width"))
  const parsedHeight = parseSvgLength(svgElement.getAttribute("height"))

  let width = parsedWidth
  let height = parsedHeight

  if (!width && !height && viewBoxDimensions) {
    width = viewBoxDimensions.width
    height = viewBoxDimensions.height
  } else if (!width && height && viewBoxDimensions) {
    width = height * (viewBoxDimensions.width / viewBoxDimensions.height)
  } else if (width && !height && viewBoxDimensions) {
    height = width * (viewBoxDimensions.height / viewBoxDimensions.width)
  }

  width = width ?? FALLBACK_DIMENSION
  height = height ?? FALLBACK_DIMENSION

  return {
    width,
    height,
    aspectRatio: width / height,
  }
}

export function createSvgObjectUrl(svgContent: string) {
  const blob = new Blob([svgContent], { type: "image/svg+xml" })
  return URL.createObjectURL(blob)
}

export async function rasterizeSvgToPng(
  svgContent: string,
  outputWidth: number,
  outputHeight: number
) {
  const objectUrl = createSvgObjectUrl(svgContent)

  try {
    const image = await loadImageElement(objectUrl)
    const canvas = document.createElement("canvas")
    canvas.width = outputWidth
    canvas.height = outputHeight

    const context = canvas.getContext("2d")

    if (!context) {
      throw new Error("Canvas is not available in this browser.")
    }

    context.clearRect(0, 0, outputWidth, outputHeight)
    context.drawImage(image, 0, 0, outputWidth, outputHeight)

    return await canvasToBlob(canvas, "image/png")
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
