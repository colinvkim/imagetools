import { type RectCrop } from "@/lib/image/crop"

export type TrimDetectionResult = {
  crop: RectCrop
  imageWidth: number
  imageHeight: number
  trimmedTop: number
  trimmedRight: number
  trimmedBottom: number
  trimmedLeft: number
  hasTransparentBorder: boolean
}

export type OpaqueBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function findOpaqueBounds(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): OpaqueBounds | null {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3]

      if (!alpha) {
        continue
      }

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  if (maxX === -1 || maxY === -1) {
    return null
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
  }
}

export function buildTrimDetectionResult(
  bounds: OpaqueBounds,
  imageWidth: number,
  imageHeight: number
): TrimDetectionResult {
  const crop = {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX + 1,
    height: bounds.maxY - bounds.minY + 1,
  }
  const trimmedTop = bounds.minY
  const trimmedRight = imageWidth - (bounds.maxX + 1)
  const trimmedBottom = imageHeight - (bounds.maxY + 1)
  const trimmedLeft = bounds.minX

  return {
    crop,
    imageWidth,
    imageHeight,
    trimmedTop,
    trimmedRight,
    trimmedBottom,
    trimmedLeft,
    hasTransparentBorder:
      trimmedTop > 0 ||
      trimmedRight > 0 ||
      trimmedBottom > 0 ||
      trimmedLeft > 0,
  }
}
