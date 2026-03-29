"use client"

import * as React from "react"

import { CheckerboardSurface } from "@/components/tools/shared/checkerboard-surface"
import {
  clampRectCrop,
  type RectCrop,
} from "@/lib/image/crop"
import { cn } from "@/lib/utils"

type RectCropEditorProps = {
  imageUrl: string
  imageWidth: number
  imageHeight: number
  crop: RectCrop
  onCropChange: (crop: RectCrop) => void
  minCropWidth?: number
  minCropHeight?: number
  aspectRatio?: number
  className?: string
}

type DragHandle =
  | "move"
  | "n"
  | "s"
  | "e"
  | "w"
  | "nw"
  | "ne"
  | "sw"
  | "se"

type DragState = {
  handle: DragHandle
  startX: number
  startY: number
  initialCrop: RectCrop
}

type SampledImageData = {
  width: number
  height: number
  data: Uint8ClampedArray
}

const GRID_FADE_DELAY_MS = 700
const IMAGE_SAMPLE_MAX_SIDE = 512

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getPointInImageSpace(
  clientX: number,
  clientY: number,
  element: SVGSVGElement,
  imageWidth: number,
  imageHeight: number,
  chromePadding: number
) {
  const rect = element.getBoundingClientRect()
  const virtualWidth = imageWidth + chromePadding * 2
  const virtualHeight = imageHeight + chromePadding * 2

  return {
    x: ((clientX - rect.left) / rect.width) * virtualWidth - chromePadding,
    y: ((clientY - rect.top) / rect.height) * virtualHeight - chromePadding,
  }
}

function getFreeformResizedCrop(
  initialCrop: RectCrop,
  handle: Exclude<DragHandle, "move">,
  deltaX: number,
  deltaY: number,
  minCropWidth: number,
  minCropHeight: number,
  imageWidth: number,
  imageHeight: number
): RectCrop {
  const initialRight = initialCrop.x + initialCrop.width
  const initialBottom = initialCrop.y + initialCrop.height
  const nextLeft = clampValue(
    initialCrop.x + deltaX,
    0,
    initialRight - minCropWidth
  )
  const nextTop = clampValue(
    initialCrop.y + deltaY,
    0,
    initialBottom - minCropHeight
  )

  switch (handle) {
    case "n":
      return {
        x: initialCrop.x,
        y: nextTop,
        width: initialCrop.width,
        height: initialBottom - nextTop,
      }
    case "s":
      return {
        ...initialCrop,
        height: Math.min(
          imageHeight - initialCrop.y,
          Math.max(minCropHeight, initialCrop.height + deltaY)
        ),
      }
    case "e":
      return {
        ...initialCrop,
        width: Math.min(
          imageWidth - initialCrop.x,
          Math.max(minCropWidth, initialCrop.width + deltaX)
        ),
      }
    case "w":
      return {
        x: nextLeft,
        y: initialCrop.y,
        width: initialRight - nextLeft,
        height: initialCrop.height,
      }
    case "nw":
      return {
        x: nextLeft,
        y: nextTop,
        width: initialRight - nextLeft,
        height: initialBottom - nextTop,
      }
    case "ne":
      return {
        x: initialCrop.x,
        y: nextTop,
        width: Math.min(
          imageWidth - initialCrop.x,
          Math.max(minCropWidth, initialCrop.width + deltaX)
        ),
        height: initialBottom - nextTop,
      }
    case "sw":
      return {
        x: nextLeft,
        y: initialCrop.y,
        width: initialRight - nextLeft,
        height: Math.min(
          imageHeight - initialCrop.y,
          Math.max(minCropHeight, initialCrop.height + deltaY)
        ),
      }
    case "se":
      return {
        x: initialCrop.x,
        y: initialCrop.y,
        width: Math.min(
          imageWidth - initialCrop.x,
          Math.max(minCropWidth, initialCrop.width + deltaX)
        ),
        height: Math.min(
          imageHeight - initialCrop.y,
          Math.max(minCropHeight, initialCrop.height + deltaY)
        ),
      }
  }
}

function getAspectRatioCornerCrop(
  initialCrop: RectCrop,
  handle: "nw" | "ne" | "sw" | "se",
  pointX: number,
  pointY: number,
  aspectRatio: number,
  minCropWidth: number,
  minCropHeight: number,
  imageWidth: number,
  imageHeight: number
): RectCrop {
  const anchorX =
    handle === "nw" || handle === "sw"
      ? initialCrop.x + initialCrop.width
      : initialCrop.x
  const anchorY =
    handle === "nw" || handle === "ne"
      ? initialCrop.y + initialCrop.height
      : initialCrop.y

  const widthFromPointer =
    handle === "nw" || handle === "sw" ? anchorX - pointX : pointX - anchorX
  const heightFromPointer =
    handle === "nw" || handle === "ne" ? anchorY - pointY : pointY - anchorY

  let width = Math.min(
    Math.max(0, widthFromPointer),
    Math.max(0, heightFromPointer) * aspectRatio
  )
  let height = width / aspectRatio

  if (width < minCropWidth) {
    width = minCropWidth
    height = width / aspectRatio
  }

  if (height < minCropHeight) {
    height = minCropHeight
    width = height * aspectRatio
  }

  const maxWidthFromAnchor =
    handle === "nw" || handle === "sw" ? anchorX : imageWidth - anchorX
  const maxHeightFromAnchor =
    handle === "nw" || handle === "ne" ? anchorY : imageHeight - anchorY
  const maxWidth = Math.min(
    maxWidthFromAnchor,
    maxHeightFromAnchor * aspectRatio
  )

  width = Math.min(width, maxWidth)
  height = width / aspectRatio

  return {
    x: handle === "nw" || handle === "sw" ? anchorX - width : anchorX,
    y: handle === "nw" || handle === "ne" ? anchorY - height : anchorY,
    width,
    height,
  }
}

function getAspectRatioEdgeCrop(
  initialCrop: RectCrop,
  handle: "n" | "s" | "e" | "w",
  pointX: number,
  pointY: number,
  aspectRatio: number,
  minCropWidth: number,
  minCropHeight: number,
  imageWidth: number,
  imageHeight: number
): RectCrop {
  const centerX = initialCrop.x + initialCrop.width / 2
  const centerY = initialCrop.y + initialCrop.height / 2

  if (handle === "e" || handle === "w") {
    const anchoredX =
      handle === "e" ? initialCrop.x : initialCrop.x + initialCrop.width
    let width =
      handle === "e"
        ? pointX - anchoredX
        : anchoredX - pointX

    width = Math.max(width, minCropWidth)

    let height = width / aspectRatio

    if (height < minCropHeight) {
      height = minCropHeight
      width = height * aspectRatio
    }

    const maxWidthFromAnchor =
      handle === "e" ? imageWidth - anchoredX : anchoredX
    const maxHeightFromCenter = Math.min(centerY, imageHeight - centerY) * 2
    const maxWidth = Math.min(
      maxWidthFromAnchor,
      maxHeightFromCenter * aspectRatio
    )

    width = Math.min(width, maxWidth)
    height = width / aspectRatio

    return {
      x: handle === "w" ? anchoredX - width : anchoredX,
      y: centerY - height / 2,
      width,
      height,
    }
  }

  const anchoredY =
    handle === "s" ? initialCrop.y : initialCrop.y + initialCrop.height
  let height =
    handle === "s"
      ? pointY - anchoredY
      : anchoredY - pointY

  height = Math.max(height, minCropHeight)

  let width = height * aspectRatio

  if (width < minCropWidth) {
    width = minCropWidth
    height = width / aspectRatio
  }

  const maxHeightFromAnchor =
    handle === "s" ? imageHeight - anchoredY : anchoredY
  const maxWidthFromCenter = Math.min(centerX, imageWidth - centerX) * 2
  const maxHeight = Math.min(
    maxHeightFromAnchor,
    maxWidthFromCenter / aspectRatio
  )

  height = Math.min(height, maxHeight)
  width = height * aspectRatio

  return {
    x: centerX - width / 2,
    y: handle === "n" ? anchoredY - height : anchoredY,
    width,
    height,
  }
}

function getResizedCrop(
  initialCrop: RectCrop,
  handle: Exclude<DragHandle, "move">,
  pointX: number,
  pointY: number,
  deltaX: number,
  deltaY: number,
  aspectRatio: number | undefined,
  minCropWidth: number,
  minCropHeight: number,
  imageWidth: number,
  imageHeight: number
) {
  if (!aspectRatio) {
    return getFreeformResizedCrop(
      initialCrop,
      handle,
      deltaX,
      deltaY,
      minCropWidth,
      minCropHeight,
      imageWidth,
      imageHeight
    )
  }

  if (
    handle === "nw" ||
    handle === "ne" ||
    handle === "sw" ||
    handle === "se"
  ) {
    return getAspectRatioCornerCrop(
      initialCrop,
      handle,
      pointX,
      pointY,
      aspectRatio,
      minCropWidth,
      minCropHeight,
      imageWidth,
      imageHeight
    )
  }

  return getAspectRatioEdgeCrop(
    initialCrop,
    handle,
    pointX,
    pointY,
    aspectRatio,
    minCropWidth,
    minCropHeight,
    imageWidth,
    imageHeight
  )
}

function getHandleStrokeMetrics(crop: RectCrop) {
  const minDimension = Math.min(crop.width, crop.height)

  return {
    frameStroke: Math.max(1.25, minDimension * 0.0035),
    gridStroke: Math.max(0.8, minDimension * 0.0022),
    handleStroke: Math.max(3.5, minDimension * 0.011),
    cornerLength: Math.max(20, minDimension * 0.09),
    hitSize: Math.max(28, minDimension * 0.15),
  }
}

function getPixelLuminance(
  sampledImage: SampledImageData,
  x: number,
  y: number
) {
  const sampleX = Math.max(0, Math.min(sampledImage.width - 1, Math.round(x)))
  const sampleY = Math.max(0, Math.min(sampledImage.height - 1, Math.round(y)))
  const index = (sampleY * sampledImage.width + sampleX) * 4
  const red = sampledImage.data[index] ?? 0
  const green = sampledImage.data[index + 1] ?? 0
  const blue = sampledImage.data[index + 2] ?? 0

  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255
}

function getCropChromeTone(
  sampledImage: SampledImageData | null,
  crop: RectCrop,
  imageWidth: number,
  imageHeight: number
) {
  if (!sampledImage) {
    return {
      stroke: "rgba(255,255,255,0.98)",
      grid: "rgba(255,255,255,0.78)",
    }
  }

  const scaleX = sampledImage.width / imageWidth
  const scaleY = sampledImage.height / imageHeight
  const insetX = Math.max(2, crop.width * 0.04)
  const insetY = Math.max(2, crop.height * 0.04)
  const sampleCountPerSide = 6
  let luminanceTotal = 0
  let sampleCount = 0

  for (let index = 0; index < sampleCountPerSide; index += 1) {
    const progress = (index + 0.5) / sampleCountPerSide
    const sampleX = crop.x + crop.width * progress
    const sampleY = crop.y + crop.height * progress

    luminanceTotal += getPixelLuminance(
      sampledImage,
      sampleX * scaleX,
      (crop.y + insetY) * scaleY
    )
    luminanceTotal += getPixelLuminance(
      sampledImage,
      sampleX * scaleX,
      (crop.y + crop.height - insetY) * scaleY
    )
    luminanceTotal += getPixelLuminance(
      sampledImage,
      (crop.x + insetX) * scaleX,
      sampleY * scaleY
    )
    luminanceTotal += getPixelLuminance(
      sampledImage,
      (crop.x + crop.width - insetX) * scaleX,
      sampleY * scaleY
    )
    sampleCount += 4
  }

  const averageLuminance = sampleCount > 0 ? luminanceTotal / sampleCount : 0
  const useDarkChrome = averageLuminance > 0.72

  return useDarkChrome
    ? {
        stroke: "rgba(17,24,39,0.96)",
        grid: "rgba(17,24,39,0.52)",
      }
    : {
        stroke: "rgba(255,255,255,0.98)",
        grid: "rgba(255,255,255,0.78)",
      }
}

export function RectCropEditor({
  imageUrl,
  imageWidth,
  imageHeight,
  crop,
  onCropChange,
  minCropWidth = 64,
  minCropHeight = 64,
  aspectRatio,
  className,
}: RectCropEditorProps) {
  const dragStateRef = React.useRef<DragState | null>(null)
  const gridTimeoutRef = React.useRef<number | null>(null)
  const maskId = React.useId()
  const [sampledImage, setSampledImage] = React.useState<SampledImageData | null>(
    null
  )
  const [isDragging, setIsDragging] = React.useState(false)
  const [isGridVisible, setIsGridVisible] = React.useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  const [isCoarsePointer, setIsCoarsePointer] = React.useState(false)

  React.useEffect(() => {
    let isCancelled = false
    const image = new window.Image()

    image.decoding = "async"
    image.onload = () => {
      if (isCancelled) {
        return
      }

      const longestSide = Math.max(image.naturalWidth, image.naturalHeight)
      const scale =
        longestSide > IMAGE_SAMPLE_MAX_SIDE
          ? IMAGE_SAMPLE_MAX_SIDE / longestSide
          : 1
      const canvasWidth = Math.max(1, Math.round(image.naturalWidth * scale))
      const canvasHeight = Math.max(1, Math.round(image.naturalHeight * scale))
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d", { willReadFrequently: true })

      if (!context) {
        setSampledImage(null)
        return
      }

      canvas.width = canvasWidth
      canvas.height = canvasHeight
      context.drawImage(image, 0, 0, canvasWidth, canvasHeight)

      try {
        const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight)

        if (!isCancelled) {
          setSampledImage({
            width: canvasWidth,
            height: canvasHeight,
            data: imageData.data,
          })
        }
      } catch {
        if (!isCancelled) {
          setSampledImage(null)
        }
      }
    }
    image.onerror = () => {
      if (!isCancelled) {
        setSampledImage(null)
      }
    }
    image.src = imageUrl

    return () => {
      isCancelled = true
    }
  }, [imageUrl])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(pointer: coarse), (any-pointer: coarse)"
    )
    const handleChange = () => {
      setIsCoarsePointer(mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  const clearGridTimeout = React.useCallback(() => {
    if (gridTimeoutRef.current !== null) {
      window.clearTimeout(gridTimeoutRef.current)
      gridTimeoutRef.current = null
    }
  }, [])

  const showGrid = React.useCallback(() => {
    clearGridTimeout()
    setIsGridVisible(true)
  }, [clearGridTimeout])

  const hideGridSoon = React.useCallback(() => {
    clearGridTimeout()
    gridTimeoutRef.current = window.setTimeout(() => {
      setIsGridVisible(false)
      gridTimeoutRef.current = null
    }, GRID_FADE_DELAY_MS)
  }, [clearGridTimeout])

  React.useEffect(() => {
    return () => {
      clearGridTimeout()
    }
  }, [clearGridTimeout])

  const clampCropPosition = React.useCallback(
    (nextCrop: RectCrop) =>
      clampRectCrop(
        nextCrop,
        imageWidth,
        imageHeight,
        minCropWidth,
        minCropHeight
      ),
    [imageHeight, imageWidth, minCropHeight, minCropWidth]
  )

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const dragState = dragStateRef.current

    if (!dragState) {
      return
    }

    const point = getPointInImageSpace(
      event.clientX,
      event.clientY,
      event.currentTarget,
      imageWidth,
      imageHeight,
      chromePadding
    )
    const deltaX = point.x - dragState.startX
    const deltaY = point.y - dragState.startY

    if (dragState.handle === "move") {
      onCropChange(
        clampCropPosition({
          ...dragState.initialCrop,
          x: dragState.initialCrop.x + deltaX,
          y: dragState.initialCrop.y + deltaY,
        })
      )
      return
    }

    const nextCrop = getResizedCrop(
      dragState.initialCrop,
      dragState.handle,
      point.x,
      point.y,
      deltaX,
      deltaY,
      aspectRatio,
      minCropWidth,
      minCropHeight,
      imageWidth,
      imageHeight
    )

    onCropChange(nextCrop)
  }

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragStateRef.current) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      dragStateRef.current = null
      setIsDragging(false)
      hideGridSoon()
    }
  }

  const startDrag =
    (handle: DragHandle) =>
    (
      event:
        | React.PointerEvent<SVGRectElement>
        | React.PointerEvent<SVGLineElement>
    ) => {
      event.preventDefault()
      event.stopPropagation()

      const parentSvg = event.currentTarget.ownerSVGElement

      if (!parentSvg) {
        return
      }

      const point = getPointInImageSpace(
        event.clientX,
        event.clientY,
        parentSvg,
        imageWidth,
        imageHeight,
        chromePadding
      )

      dragStateRef.current = {
        handle,
        startX: point.x,
        startY: point.y,
        initialCrop: crop,
      }

      setIsDragging(true)
      showGrid()
      parentSvg.setPointerCapture(event.pointerId)
    }

  const {
    frameStroke,
    gridStroke,
    handleStroke,
    cornerLength,
    hitSize,
  } = getHandleStrokeMetrics(crop)
  const gridOpacity = isDragging || isGridVisible ? 0.72 : 0
  const chromePadding = Math.max(handleStroke * 2, 12)
  const virtualWidth = imageWidth + chromePadding * 2
  const virtualHeight = imageHeight + chromePadding * 2
  const displayAspectRatio = virtualWidth / virtualHeight
  const cropX = crop.x + chromePadding
  const cropY = crop.y + chromePadding
  const topBracketY = cropY - handleStroke
  const bottomBracketY = cropY + crop.height
  const leftBracketX = cropX - handleStroke
  const rightBracketX = cropX + crop.width
  const touchEdgeHitMultiplier = isCoarsePointer ? 1.22 : 1
  const touchCornerHitMultiplier = isCoarsePointer ? 1.16 : 1
  const edgeHitThickness =
    Math.max(hitSize * 0.72, handleStroke * 4) * touchEdgeHitMultiplier
  const cornerHitSize = hitSize * touchCornerHitMultiplier
  const sideHandleLength = Math.max(18, cornerLength * 0.95)
  const topSideHandleX = cropX + crop.width / 2 - sideHandleLength / 2
  const leftSideHandleY = cropY + crop.height / 2 - sideHandleLength / 2
  const chromeTone = React.useMemo(
    () => getCropChromeTone(sampledImage, crop, imageWidth, imageHeight),
    [crop, imageHeight, imageWidth, sampledImage]
  )

  return (
    <div className={cn("w-full", className)}>
      <CheckerboardSurface
        className="overflow-hidden rounded-[1.25rem] p-3"
        contentClassName="flex justify-center rounded-[1rem] bg-background/85 p-2"
      >
        <div
          className="relative mx-auto"
          style={{
            width: `min(100%, calc(68vh * ${displayAspectRatio}))`,
            aspectRatio: `${virtualWidth} / ${virtualHeight}`,
          }}
        >
          <svg
            viewBox={`0 0 ${virtualWidth} ${virtualHeight}`}
            className="absolute inset-0 size-full touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <image
              href={imageUrl}
              x={chromePadding}
              y={chromePadding}
              width={imageWidth}
              height={imageHeight}
              preserveAspectRatio="none"
            />
            <mask id={maskId}>
              <rect
                x={0}
                y={0}
                width={virtualWidth}
                height={virtualHeight}
                fill="white"
              />
              <rect
                x={cropX}
                y={cropY}
                width={crop.width}
                height={crop.height}
                fill="black"
              />
            </mask>

            <rect
              x={0}
              y={0}
              width={virtualWidth}
              height={virtualHeight}
              fill="rgba(15,23,42,0.56)"
              mask={`url(#${maskId})`}
            />

            <g pointerEvents="none">
              <rect
                x={cropX}
                y={cropY}
                width={crop.width}
                height={crop.height}
                fill="transparent"
                stroke={chromeTone.stroke}
                strokeWidth={frameStroke}
              />

              <g
                style={{
                  opacity: gridOpacity,
                  transition: prefersReducedMotion
                    ? undefined
                    : "opacity 180ms ease",
                }}
              >
                <line
                  x1={cropX + crop.width / 3}
                  y1={cropY}
                  x2={cropX + crop.width / 3}
                  y2={cropY + crop.height}
                  stroke={chromeTone.grid}
                  strokeWidth={gridStroke}
                />
                <line
                  x1={cropX + (crop.width / 3) * 2}
                  y1={cropY}
                  x2={cropX + (crop.width / 3) * 2}
                  y2={cropY + crop.height}
                  stroke={chromeTone.grid}
                  strokeWidth={gridStroke}
                />
                <line
                  x1={cropX}
                  y1={cropY + crop.height / 3}
                  x2={cropX + crop.width}
                  y2={cropY + crop.height / 3}
                  stroke={chromeTone.grid}
                  strokeWidth={gridStroke}
                />
                <line
                  x1={cropX}
                  y1={cropY + (crop.height / 3) * 2}
                  x2={cropX + crop.width}
                  y2={cropY + (crop.height / 3) * 2}
                  stroke={chromeTone.grid}
                  strokeWidth={gridStroke}
                />
              </g>

              <g>
                <rect
                  x={leftBracketX}
                  y={topBracketY}
                  width={cornerLength + handleStroke}
                  height={handleStroke}
                  fill={chromeTone.stroke}
                />
                <rect
                  x={leftBracketX}
                  y={topBracketY}
                  width={handleStroke}
                  height={cornerLength + handleStroke}
                  fill={chromeTone.stroke}
                />
                <rect
                  x={cropX + crop.width - cornerLength}
                  y={topBracketY}
                  width={cornerLength + handleStroke}
                  height={handleStroke}
                  fill={chromeTone.stroke}
                />
                <rect
                  x={rightBracketX}
                  y={topBracketY}
                  width={handleStroke}
                  height={cornerLength + handleStroke}
                  fill={chromeTone.stroke}
                />
                <rect
                  x={leftBracketX}
                  y={bottomBracketY}
                  width={cornerLength + handleStroke}
                  height={handleStroke}
                  fill={chromeTone.stroke}
                />
                <rect
                  x={leftBracketX}
                  y={cropY + crop.height - cornerLength}
                  width={handleStroke}
                  height={cornerLength + handleStroke}
                  fill={chromeTone.stroke}
                />
                <rect
                  x={cropX + crop.width - cornerLength}
                  y={bottomBracketY}
                  width={cornerLength + handleStroke}
                  height={handleStroke}
                  fill={chromeTone.stroke}
                />
                <rect
                  x={rightBracketX}
                  y={cropY + crop.height - cornerLength}
                  width={handleStroke}
                  height={cornerLength + handleStroke}
                  fill={chromeTone.stroke}
                />
                {isCoarsePointer ? (
                  <>
                    <rect
                      x={topSideHandleX}
                      y={topBracketY}
                      width={sideHandleLength}
                      height={handleStroke}
                      fill={chromeTone.stroke}
                    />
                    <rect
                      x={topSideHandleX}
                      y={bottomBracketY}
                      width={sideHandleLength}
                      height={handleStroke}
                      fill={chromeTone.stroke}
                    />
                    <rect
                      x={leftBracketX}
                      y={leftSideHandleY}
                      width={handleStroke}
                      height={sideHandleLength}
                      fill={chromeTone.stroke}
                    />
                    <rect
                      x={rightBracketX}
                      y={leftSideHandleY}
                      width={handleStroke}
                      height={sideHandleLength}
                      fill={chromeTone.stroke}
                    />
                  </>
                ) : null}
              </g>
            </g>

            <rect
              x={cropX}
              y={cropY}
              width={crop.width}
              height={crop.height}
              fill="transparent"
              pointerEvents="all"
              className="cursor-move"
              onPointerDown={startDrag("move")}
            />

            <rect
              x={cropX}
              y={cropY - edgeHitThickness / 2}
              width={crop.width}
              height={edgeHitThickness}
              fill="rgba(255,255,255,0.001)"
              className="cursor-n-resize"
              onPointerDown={startDrag("n")}
            />
            <rect
              x={cropX}
              y={cropY + crop.height - edgeHitThickness / 2}
              width={crop.width}
              height={edgeHitThickness}
              fill="rgba(255,255,255,0.001)"
              className="cursor-s-resize"
              onPointerDown={startDrag("s")}
            />
            <rect
              x={cropX - edgeHitThickness / 2}
              y={cropY}
              width={edgeHitThickness}
              height={crop.height}
              fill="rgba(255,255,255,0.001)"
              className="cursor-w-resize"
              onPointerDown={startDrag("w")}
            />
            <rect
              x={cropX + crop.width - edgeHitThickness / 2}
              y={cropY}
              width={edgeHitThickness}
              height={crop.height}
              fill="rgba(255,255,255,0.001)"
              className="cursor-e-resize"
              onPointerDown={startDrag("e")}
            />
            <rect
              x={cropX - cornerHitSize / 2}
              y={cropY - cornerHitSize / 2}
              width={cornerHitSize}
              height={cornerHitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-nw-resize"
              onPointerDown={startDrag("nw")}
            />
            <rect
              x={cropX + crop.width - cornerHitSize / 2}
              y={cropY - cornerHitSize / 2}
              width={cornerHitSize}
              height={cornerHitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-ne-resize"
              onPointerDown={startDrag("ne")}
            />
            <rect
              x={cropX - cornerHitSize / 2}
              y={cropY + crop.height - cornerHitSize / 2}
              width={cornerHitSize}
              height={cornerHitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-sw-resize"
              onPointerDown={startDrag("sw")}
            />
            <rect
              x={cropX + crop.width - cornerHitSize / 2}
              y={cropY + crop.height - cornerHitSize / 2}
              width={cornerHitSize}
              height={cornerHitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-se-resize"
              onPointerDown={startDrag("se")}
            />
          </svg>
        </div>
      </CheckerboardSurface>
    </div>
  )
}
