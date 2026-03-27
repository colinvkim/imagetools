import { type RectCrop } from "@/lib/image/crop"
import { loadImageElement } from "@/lib/image/load-image"

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

export async function detectTransparentBounds(
  imageUrl: string
): Promise<TrimDetectionResult | null> {
  const sourceImage = await loadImageElement(imageUrl)
  const imageWidth = Math.max(
    1,
    Math.round(sourceImage.naturalWidth || sourceImage.width)
  )
  const imageHeight = Math.max(
    1,
    Math.round(sourceImage.naturalHeight || sourceImage.height)
  )
  const canvas = document.createElement("canvas")
  canvas.width = imageWidth
  canvas.height = imageHeight

  const context = canvas.getContext("2d", { willReadFrequently: true })

  if (!context) {
    throw new Error("Canvas is not available in this browser.")
  }

  context.clearRect(0, 0, imageWidth, imageHeight)
  context.drawImage(sourceImage, 0, 0, imageWidth, imageHeight)

  const imageData = context.getImageData(0, 0, imageWidth, imageHeight)
  const pixels = imageData.data
  let minX = imageWidth
  let minY = imageHeight
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < imageHeight; y += 1) {
    for (let x = 0; x < imageWidth; x += 1) {
      const alpha = pixels[(y * imageWidth + x) * 4 + 3]

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

  const crop = {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
  const trimmedTop = minY
  const trimmedRight = imageWidth - (maxX + 1)
  const trimmedBottom = imageHeight - (maxY + 1)
  const trimmedLeft = minX

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
