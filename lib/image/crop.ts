import {
  buildDownloadFileName,
  canvasToBlob,
  downloadBlob,
  getFileNameWithoutExtension,
  getRasterExportConfig,
} from "@/lib/image/export"
import { loadImageElement } from "@/lib/image/load-image"

export type SquareCrop = {
  x: number
  y: number
  size: number
}

export type RectCrop = {
  x: number
  y: number
  width: number
  height: number
}

export function createCenteredSquareCrop(
  imageWidth: number,
  imageHeight: number
): SquareCrop {
  const size = Math.min(imageWidth, imageHeight)

  return {
    x: (imageWidth - size) / 2,
    y: (imageHeight - size) / 2,
    size,
  }
}

export function clampSquareCrop(
  crop: SquareCrop,
  imageWidth: number,
  imageHeight: number,
  minSize = 48
): SquareCrop {
  const maxSize = Math.max(minSize, Math.min(imageWidth, imageHeight))
  const size = Math.min(Math.max(crop.size, minSize), maxSize)
  const x = Math.min(Math.max(crop.x, 0), imageWidth - size)
  const y = Math.min(Math.max(crop.y, 0), imageHeight - size)

  return { x, y, size }
}

export function createFullRectCrop(
  imageWidth: number,
  imageHeight: number
): RectCrop {
  return {
    x: 0,
    y: 0,
    width: imageWidth,
    height: imageHeight,
  }
}

export function createCenteredAspectRatioCrop(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number,
  centerX = imageWidth / 2,
  centerY = imageHeight / 2
): RectCrop {
  const safeAspectRatio = Math.max(aspectRatio, 0.0001)
  const imageAspectRatio = imageWidth / imageHeight
  let width = imageWidth
  let height = imageHeight

  if (imageAspectRatio > safeAspectRatio) {
    height = imageHeight
    width = height * safeAspectRatio
  } else {
    width = imageWidth
    height = width / safeAspectRatio
  }

  const x = Math.min(Math.max(centerX - width / 2, 0), imageWidth - width)
  const y = Math.min(Math.max(centerY - height / 2, 0), imageHeight - height)

  return {
    x,
    y,
    width,
    height,
  }
}

export function clampRectCrop(
  crop: RectCrop,
  imageWidth: number,
  imageHeight: number,
  minWidth = 48,
  minHeight = 48
): RectCrop {
  const width = Math.min(Math.max(crop.width, minWidth), imageWidth)
  const height = Math.min(Math.max(crop.height, minHeight), imageHeight)
  const x = Math.min(Math.max(crop.x, 0), imageWidth - width)
  const y = Math.min(Math.max(crop.y, 0), imageHeight - height)

  return { x, y, width, height }
}

export function clampRectCropToAspectRatio(
  crop: RectCrop,
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number,
  minWidth = 48,
  minHeight = 48
): RectCrop {
  const safeAspectRatio = Math.max(aspectRatio, 0.0001)
  const requiredMinWidth = Math.max(minWidth, minHeight * safeAspectRatio)
  const maxWidth = imageWidth
  const maxHeight = imageHeight
  let width = Math.max(crop.width, requiredMinWidth)
  let height = width / safeAspectRatio

  if (height < minHeight) {
    height = minHeight
    width = height * safeAspectRatio
  }

  if (width > maxWidth) {
    width = maxWidth
    height = width / safeAspectRatio
  }

  if (height > maxHeight) {
    height = maxHeight
    width = height * safeAspectRatio
  }

  const x = Math.min(Math.max(crop.x, 0), imageWidth - width)
  const y = Math.min(Math.max(crop.y, 0), imageHeight - height)

  return { x, y, width, height }
}

export async function exportCircleCrop(params: {
  imageUrl: string
  crop: SquareCrop
  fileName: string
  outputFileName?: string
}) {
  const sourceImage = await loadImageElement(params.imageUrl)
  const outputSize = Math.max(1, Math.round(params.crop.size))
  const canvas = document.createElement("canvas")
  canvas.width = outputSize
  canvas.height = outputSize

  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Canvas is not available in this browser.")
  }

  const radius = outputSize / 2

  context.clearRect(0, 0, outputSize, outputSize)
  context.beginPath()
  context.arc(radius, radius, radius, 0, Math.PI * 2)
  context.closePath()
  context.clip()
  context.drawImage(
    sourceImage,
    params.crop.x,
    params.crop.y,
    params.crop.size,
    params.crop.size,
    0,
    0,
    outputSize,
    outputSize
  )

  const blob = await canvasToBlob(canvas, "image/png")
  const baseFileName = getFileNameWithoutExtension(params.fileName)
  downloadBlob(
    blob,
    buildDownloadFileName({
      baseName: params.outputFileName ?? `${baseFileName}-circle`,
      fallbackFileName: params.fileName,
      extension: ".png",
    })
  )
}

function drawRoundedRectPath(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number
) {
  const clampedRadius = Math.min(Math.max(radius, 0), width / 2, height / 2)

  context.beginPath()
  context.moveTo(clampedRadius, 0)
  context.lineTo(width - clampedRadius, 0)
  context.quadraticCurveTo(width, 0, width, clampedRadius)
  context.lineTo(width, height - clampedRadius)
  context.quadraticCurveTo(width, height, width - clampedRadius, height)
  context.lineTo(clampedRadius, height)
  context.quadraticCurveTo(0, height, 0, height - clampedRadius)
  context.lineTo(0, clampedRadius)
  context.quadraticCurveTo(0, 0, clampedRadius, 0)
  context.closePath()
}

export async function exportRoundedCrop(params: {
  imageUrl: string
  crop: RectCrop
  fileName: string
  radius: number
  outputFileName?: string
}) {
  const sourceImage = await loadImageElement(params.imageUrl)
  const outputWidth = Math.max(1, Math.round(params.crop.width))
  const outputHeight = Math.max(1, Math.round(params.crop.height))
  const canvas = document.createElement("canvas")
  canvas.width = outputWidth
  canvas.height = outputHeight

  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Canvas is not available in this browser.")
  }

  context.clearRect(0, 0, outputWidth, outputHeight)
  drawRoundedRectPath(context, outputWidth, outputHeight, params.radius)
  context.clip()
  context.drawImage(
    sourceImage,
    params.crop.x,
    params.crop.y,
    params.crop.width,
    params.crop.height,
    0,
    0,
    outputWidth,
    outputHeight
  )

  const blob = await canvasToBlob(canvas, "image/png")
  const baseFileName = getFileNameWithoutExtension(params.fileName)
  downloadBlob(
    blob,
    buildDownloadFileName({
      baseName: params.outputFileName ?? `${baseFileName}-rounded`,
      fallbackFileName: params.fileName,
      extension: ".png",
    })
  )
}

export async function exportRectCrop(params: {
  imageUrl: string
  crop: RectCrop
  fileName: string
  mimeType: string
  outputFileName?: string
}) {
  const sourceImage = await loadImageElement(params.imageUrl)
  const outputWidth = Math.max(1, Math.round(params.crop.width))
  const outputHeight = Math.max(1, Math.round(params.crop.height))
  const canvas = document.createElement("canvas")
  canvas.width = outputWidth
  canvas.height = outputHeight

  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Canvas is not available in this browser.")
  }

  context.clearRect(0, 0, outputWidth, outputHeight)
  context.drawImage(
    sourceImage,
    params.crop.x,
    params.crop.y,
    params.crop.width,
    params.crop.height,
    0,
    0,
    outputWidth,
    outputHeight
  )

  const exportConfig = getRasterExportConfig(params.mimeType)
  const blob = await canvasToBlob(
    canvas,
    exportConfig.mimeType,
    exportConfig.quality
  )
  const baseFileName = getFileNameWithoutExtension(params.fileName)
  downloadBlob(
    blob,
    buildDownloadFileName({
      baseName:
        params.outputFileName ??
        `${baseFileName}-${outputWidth}x${outputHeight}`,
      fallbackFileName: params.fileName,
      extension: exportConfig.extension,
    })
  )

  return exportConfig
}
