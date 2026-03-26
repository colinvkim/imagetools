import { canvasToBlob, downloadBlob } from "@/lib/image/export"
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

export async function exportCircleCrop(params: {
  imageUrl: string
  crop: SquareCrop
  fileName: string
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
  const baseFileName = params.fileName.replace(/\.[^.]+$/, "")
  downloadBlob(blob, `${baseFileName || params.fileName}-circle.png`)
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
  const baseFileName = params.fileName.replace(/\.[^.]+$/, "")
  downloadBlob(blob, `${baseFileName || params.fileName}-rounded.png`)
}
