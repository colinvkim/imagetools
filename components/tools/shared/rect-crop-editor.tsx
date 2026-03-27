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

type DragState =
  | {
      mode: "move"
      startX: number
      startY: number
      initialCrop: RectCrop
    }
  | {
      mode: "resize"
      startX: number
      startY: number
      initialCrop: RectCrop
    }

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
  const maskId = React.useId()

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

    if (dragState.mode === "move") {
      commitCropChange({
        ...dragState.initialCrop,
        x: dragState.initialCrop.x + deltaX,
        y: dragState.initialCrop.y + deltaY,
      })
      return
    }

    if (!aspectRatio) {
      commitCropChange({
        ...dragState.initialCrop,
        width: dragState.initialCrop.width + deltaX,
        height: dragState.initialCrop.height + deltaY,
      })
      return
    }

    const widthDeltaFromHeight = deltaY * aspectRatio
    const useHeightDrivenResize =
      Math.abs(widthDeltaFromHeight) > Math.abs(deltaX)
    let width = useHeightDrivenResize
      ? dragState.initialCrop.width + widthDeltaFromHeight
      : dragState.initialCrop.width + deltaX
    let height = width / aspectRatio

    if (height < minCropHeight) {
      height = minCropHeight
      width = height * aspectRatio
    }

    if (width < minCropWidth) {
      width = minCropWidth
      height = width / aspectRatio
    }

    commitCropChange({
      ...dragState.initialCrop,
      width,
      height,
    })
  }

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragStateRef.current) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    dragStateRef.current = null
  }

  const startDrag =
    (mode: DragState["mode"]) =>
    (event: React.PointerEvent<SVGRectElement>) => {
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
        mode,
        startX: point.x,
        startY: point.y,
        initialCrop: crop,
      }

      parentSvg.setPointerCapture(event.pointerId)
    }

  const thirdWidth = crop.width / 3
  const thirdHeight = crop.height / 3
  const resizeHandleSize = Math.max(
    24,
    Math.min(crop.width, crop.height) * 0.08
  )

  return (
    <div className={cn("w-full", className)}>
      <CheckerboardSurface
        className="overflow-hidden rounded-[1.25rem] p-3"
        contentClassName="flex justify-center rounded-[1rem] bg-background/85 p-2"
      >
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs are previewed directly in the browser */}
          <img
            src={imageUrl}
            alt="Crop source"
            className="block max-h-[68vh] w-full max-w-full object-contain"
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
                rx={18}
                ry={18}
                fill="black"
              />
            </mask>

            <rect
              x={0}
              y={0}
              width={imageWidth}
              height={imageHeight}
              fill="rgba(15,23,42,0.58)"
              mask={`url(#${maskId})`}
            />

            <rect
              x={crop.x}
              y={crop.y}
              width={crop.width}
              height={crop.height}
              rx={18}
              ry={18}
              fill="transparent"
              stroke="white"
              strokeWidth={Math.max(
                2,
                Math.min(crop.width, crop.height) * 0.01
              )}
              className="cursor-move"
              onPointerDown={startDrag("move")}
            />

            <line
              x1={crop.x + thirdWidth}
              y1={crop.y}
              x2={crop.x + thirdWidth}
              y2={crop.y + crop.height}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1}
            />
            <line
              x1={crop.x + thirdWidth * 2}
              y1={crop.y}
              x2={crop.x + thirdWidth * 2}
              y2={crop.y + crop.height}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1}
            />
            <line
              x1={crop.x}
              y1={crop.y + thirdHeight}
              x2={crop.x + crop.width}
              y2={crop.y + thirdHeight}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1}
            />
            <line
              x1={crop.x}
              y1={crop.y + thirdHeight * 2}
              x2={crop.x + crop.width}
              y2={crop.y + thirdHeight * 2}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1}
            />

            <rect
              x={crop.x + crop.width - resizeHandleSize}
              y={crop.y + crop.height - resizeHandleSize}
              width={resizeHandleSize}
              height={resizeHandleSize}
              rx={8}
              ry={8}
              fill="white"
              className="cursor-se-resize"
              onPointerDown={startDrag("resize")}
            />
          </svg>
        </div>
      </CheckerboardSurface>
    </div>
  )
}
