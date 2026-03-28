"use client"

import * as React from "react"

import { CheckerboardSurface } from "@/components/tools/shared/checkerboard-surface"
import {
  clampRectCrop,
  clampRectCropToAspectRatio,
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

const GRID_FADE_DELAY_MS = 700

function getPointInImageSpace(
  clientX: number,
  clientY: number,
  element: SVGSVGElement,
  imageWidth: number,
  imageHeight: number
) {
  const rect = element.getBoundingClientRect()

  return {
    x: ((clientX - rect.left) / rect.width) * imageWidth,
    y: ((clientY - rect.top) / rect.height) * imageHeight,
  }
}

function getFreeformResizedCrop(
  initialCrop: RectCrop,
  handle: Exclude<DragHandle, "move">,
  deltaX: number,
  deltaY: number
): RectCrop {
  switch (handle) {
    case "n":
      return {
        ...initialCrop,
        y: initialCrop.y + deltaY,
        height: initialCrop.height - deltaY,
      }
    case "s":
      return {
        ...initialCrop,
        height: initialCrop.height + deltaY,
      }
    case "e":
      return {
        ...initialCrop,
        width: initialCrop.width + deltaX,
      }
    case "w":
      return {
        ...initialCrop,
        x: initialCrop.x + deltaX,
        width: initialCrop.width - deltaX,
      }
    case "nw":
      return {
        x: initialCrop.x + deltaX,
        y: initialCrop.y + deltaY,
        width: initialCrop.width - deltaX,
        height: initialCrop.height - deltaY,
      }
    case "ne":
      return {
        x: initialCrop.x,
        y: initialCrop.y + deltaY,
        width: initialCrop.width + deltaX,
        height: initialCrop.height - deltaY,
      }
    case "sw":
      return {
        x: initialCrop.x + deltaX,
        y: initialCrop.y,
        width: initialCrop.width - deltaX,
        height: initialCrop.height + deltaY,
      }
    case "se":
      return {
        ...initialCrop,
        width: initialCrop.width + deltaX,
        height: initialCrop.height + deltaY,
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
  minCropHeight: number
): RectCrop {
  const anchorX =
    handle === "nw" || handle === "sw"
      ? initialCrop.x + initialCrop.width
      : initialCrop.x
  const anchorY =
    handle === "nw" || handle === "ne"
      ? initialCrop.y + initialCrop.height
      : initialCrop.y

  const widthFromPointer = Math.abs(pointX - anchorX)
  const heightFromPointer = Math.abs(pointY - anchorY)

  let width = Math.min(widthFromPointer, heightFromPointer * aspectRatio)
  let height = width / aspectRatio

  if (width < minCropWidth) {
    width = minCropWidth
    height = width / aspectRatio
  }

  if (height < minCropHeight) {
    height = minCropHeight
    width = height * aspectRatio
  }

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
  minCropHeight: number
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
  minCropHeight: number
) {
  if (!aspectRatio) {
    return getFreeformResizedCrop(initialCrop, handle, deltaX, deltaY)
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
      minCropHeight
    )
  }

  return getAspectRatioEdgeCrop(
    initialCrop,
    handle,
    pointX,
    pointY,
    aspectRatio,
    minCropWidth,
    minCropHeight
  )
}

function getHandleStrokeMetrics(crop: RectCrop) {
  const minDimension = Math.min(crop.width, crop.height)

  return {
    frameStroke: Math.max(1.5, minDimension * 0.004),
    gridStroke: Math.max(0.8, minDimension * 0.0022),
    handleStroke: Math.max(3, minDimension * 0.012),
    cornerLength: Math.max(18, minDimension * 0.085),
    edgeLength: Math.max(22, minDimension * 0.12),
    hitSize: Math.max(28, minDimension * 0.15),
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
  const [isGridVisible, setIsGridVisible] = React.useState(false)

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

  const commitCropChange = React.useCallback(
    (nextCrop: RectCrop) => {
      onCropChange(
        aspectRatio
          ? clampRectCropToAspectRatio(
              nextCrop,
              imageWidth,
              imageHeight,
              aspectRatio,
              minCropWidth,
              minCropHeight
            )
          : clampRectCrop(
              nextCrop,
              imageWidth,
              imageHeight,
              minCropWidth,
              minCropHeight
            )
      )
    },
    [
      aspectRatio,
      imageHeight,
      imageWidth,
      minCropHeight,
      minCropWidth,
      onCropChange,
    ]
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
      imageHeight
    )
    const deltaX = point.x - dragState.startX
    const deltaY = point.y - dragState.startY

    if (dragState.handle === "move") {
      commitCropChange({
        ...dragState.initialCrop,
        x: dragState.initialCrop.x + deltaX,
        y: dragState.initialCrop.y + deltaY,
      })
      return
    }

    commitCropChange(
      getResizedCrop(
        dragState.initialCrop,
        dragState.handle,
        point.x,
        point.y,
        deltaX,
        deltaY,
        aspectRatio,
        minCropWidth,
        minCropHeight
      )
    )
  }

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragStateRef.current) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      dragStateRef.current = null
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
        imageHeight
      )

      dragStateRef.current = {
        handle,
        startX: point.x,
        startY: point.y,
        initialCrop: crop,
      }

      showGrid()
      parentSvg.setPointerCapture(event.pointerId)
    }

  const {
    frameStroke,
    gridStroke,
    handleStroke,
    cornerLength,
    edgeLength,
    hitSize,
  } = getHandleStrokeMetrics(crop)
  const gridOpacity = dragStateRef.current || isGridVisible ? 0.72 : 0
  const displayAspectRatio = imageWidth / imageHeight
  const cornerOffset = frameStroke * 0.5
  const edgeHandleRadius = handleStroke / 2

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
            aspectRatio: `${imageWidth} / ${imageHeight}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed directly in the browser */}
          <img
            src={imageUrl}
            alt="Crop source"
            className="absolute inset-0 size-full object-contain"
          />

          <svg
            viewBox={`0 0 ${imageWidth} ${imageHeight}`}
            className="absolute inset-0 size-full touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <mask id={maskId}>
              <rect
                x={0}
                y={0}
                width={imageWidth}
                height={imageHeight}
                fill="white"
              />
              <rect
                x={crop.x}
                y={crop.y}
                width={crop.width}
                height={crop.height}
                fill="black"
              />
            </mask>

            <rect
              x={0}
              y={0}
              width={imageWidth}
              height={imageHeight}
              fill="rgba(15,23,42,0.56)"
              mask={`url(#${maskId})`}
            />

            <g pointerEvents="none">
              <rect
                x={crop.x}
                y={crop.y}
                width={crop.width}
                height={crop.height}
                fill="transparent"
                stroke="rgba(255,255,255,0.98)"
                strokeWidth={frameStroke}
              />

              <g
              style={{
                opacity: gridOpacity,
                transition: "opacity 180ms ease",
              }}
              >
                <line
                  x1={crop.x + crop.width / 3}
                  y1={crop.y}
                  x2={crop.x + crop.width / 3}
                  y2={crop.y + crop.height}
                  stroke="rgba(255,255,255,0.78)"
                  strokeWidth={gridStroke}
                />
                <line
                  x1={crop.x + (crop.width / 3) * 2}
                  y1={crop.y}
                  x2={crop.x + (crop.width / 3) * 2}
                  y2={crop.y + crop.height}
                  stroke="rgba(255,255,255,0.78)"
                  strokeWidth={gridStroke}
                />
                <line
                  x1={crop.x}
                  y1={crop.y + crop.height / 3}
                  x2={crop.x + crop.width}
                  y2={crop.y + crop.height / 3}
                  stroke="rgba(255,255,255,0.78)"
                  strokeWidth={gridStroke}
                />
                <line
                  x1={crop.x}
                  y1={crop.y + (crop.height / 3) * 2}
                  x2={crop.x + crop.width}
                  y2={crop.y + (crop.height / 3) * 2}
                  stroke="rgba(255,255,255,0.78)"
                  strokeWidth={gridStroke}
                />
              </g>

              <line
                x1={crop.x + cornerOffset}
                y1={crop.y + cornerLength}
                x2={crop.x + cornerOffset}
                y2={crop.y - cornerOffset}
                stroke="white"
                strokeLinecap="round"
                strokeWidth={handleStroke}
              />
              <line
                x1={crop.x - cornerOffset}
                y1={crop.y + cornerOffset}
                x2={crop.x + cornerLength}
                y2={crop.y + cornerOffset}
                stroke="white"
                strokeLinecap="round"
                strokeWidth={handleStroke}
              />
              <line
                x1={crop.x + crop.width - cornerLength}
                y1={crop.y + cornerOffset}
                x2={crop.x + crop.width + cornerOffset}
                y2={crop.y + cornerOffset}
                stroke="white"
                strokeLinecap="round"
                strokeWidth={handleStroke}
              />
              <line
                x1={crop.x + crop.width - cornerOffset}
                y1={crop.y - cornerOffset}
                x2={crop.x + crop.width - cornerOffset}
                y2={crop.y + cornerLength}
                stroke="white"
                strokeLinecap="round"
                strokeWidth={handleStroke}
              />
              <line
                x1={crop.x + cornerOffset}
                y1={crop.y + crop.height - cornerLength}
                x2={crop.x + cornerOffset}
                y2={crop.y + crop.height + cornerOffset}
                stroke="white"
                strokeLinecap="round"
                strokeWidth={handleStroke}
              />
              <line
                x1={crop.x - cornerOffset}
                y1={crop.y + crop.height - cornerOffset}
                x2={crop.x + cornerLength}
                y2={crop.y + crop.height - cornerOffset}
                stroke="white"
                strokeLinecap="round"
                strokeWidth={handleStroke}
              />
              <line
                x1={crop.x + crop.width - cornerLength}
                y1={crop.y + crop.height - cornerOffset}
                x2={crop.x + crop.width + cornerOffset}
                y2={crop.y + crop.height - cornerOffset}
                stroke="white"
                strokeLinecap="round"
                strokeWidth={handleStroke}
              />
              <line
                x1={crop.x + crop.width - cornerOffset}
                y1={crop.y + crop.height - cornerLength}
                x2={crop.x + crop.width - cornerOffset}
                y2={crop.y + crop.height + cornerOffset}
                stroke="white"
                strokeLinecap="round"
                strokeWidth={handleStroke}
              />

              <rect
                x={crop.x + crop.width / 2 - edgeLength / 2}
                y={crop.y - handleStroke / 2}
                width={edgeLength}
                height={handleStroke}
                rx={edgeHandleRadius}
                fill="white"
              />
              <rect
                x={crop.x + crop.width / 2 - edgeLength / 2}
                y={crop.y + crop.height - handleStroke / 2}
                width={edgeLength}
                height={handleStroke}
                rx={edgeHandleRadius}
                fill="white"
              />
              <rect
                x={crop.x - handleStroke / 2}
                y={crop.y + crop.height / 2 - edgeLength / 2}
                width={handleStroke}
                height={edgeLength}
                rx={edgeHandleRadius}
                fill="white"
              />
              <rect
                x={crop.x + crop.width - handleStroke / 2}
                y={crop.y + crop.height / 2 - edgeLength / 2}
                width={handleStroke}
                height={edgeLength}
                rx={edgeHandleRadius}
                fill="white"
              />
            </g>

            <rect
              x={crop.x}
              y={crop.y}
              width={crop.width}
              height={crop.height}
              fill="transparent"
              pointerEvents="all"
              className="cursor-move"
              onPointerDown={startDrag("move")}
            />

            <rect
              x={crop.x + crop.width / 2 - hitSize / 2}
              y={crop.y - hitSize / 2}
              width={hitSize}
              height={hitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-n-resize"
              onPointerDown={startDrag("n")}
            />
            <rect
              x={crop.x + crop.width / 2 - hitSize / 2}
              y={crop.y + crop.height - hitSize / 2}
              width={hitSize}
              height={hitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-s-resize"
              onPointerDown={startDrag("s")}
            />
            <rect
              x={crop.x - hitSize / 2}
              y={crop.y + crop.height / 2 - hitSize / 2}
              width={hitSize}
              height={hitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-w-resize"
              onPointerDown={startDrag("w")}
            />
            <rect
              x={crop.x + crop.width - hitSize / 2}
              y={crop.y + crop.height / 2 - hitSize / 2}
              width={hitSize}
              height={hitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-e-resize"
              onPointerDown={startDrag("e")}
            />
            <rect
              x={crop.x - hitSize / 2}
              y={crop.y - hitSize / 2}
              width={hitSize}
              height={hitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-nw-resize"
              onPointerDown={startDrag("nw")}
            />
            <rect
              x={crop.x + crop.width - hitSize / 2}
              y={crop.y - hitSize / 2}
              width={hitSize}
              height={hitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-ne-resize"
              onPointerDown={startDrag("ne")}
            />
            <rect
              x={crop.x - hitSize / 2}
              y={crop.y + crop.height - hitSize / 2}
              width={hitSize}
              height={hitSize}
              fill="rgba(255,255,255,0.001)"
              className="cursor-sw-resize"
              onPointerDown={startDrag("sw")}
            />
            <rect
              x={crop.x + crop.width - hitSize / 2}
              y={crop.y + crop.height - hitSize / 2}
              width={hitSize}
              height={hitSize}
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
