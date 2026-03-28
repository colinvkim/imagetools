"use client"

import * as React from "react"

import { RectCropEditor } from "@/components/tools/shared/rect-crop-editor"
import { type SquareCrop } from "@/lib/image/crop"

type SquareCropEditorProps = {
  imageUrl: string
  imageWidth: number
  imageHeight: number
  crop: SquareCrop
  onCropChange: (crop: SquareCrop) => void
  minCropSize?: number
  className?: string
}

export function SquareCropEditor({
  imageUrl,
  imageWidth,
  imageHeight,
  crop,
  onCropChange,
  minCropSize = 48,
  className,
}: SquareCropEditorProps) {
  return (
    <RectCropEditor
      imageUrl={imageUrl}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      crop={{
        x: crop.x,
        y: crop.y,
        width: crop.size,
        height: crop.size,
      }}
      onCropChange={(nextCrop) =>
        onCropChange({
          x: nextCrop.x,
          y: nextCrop.y,
          size: nextCrop.width,
        })
      }
      minCropWidth={minCropSize}
      minCropHeight={minCropSize}
      aspectRatio={1}
      className={className}
    />
  )
}
