"use client"

import { ChevronLeft, ChevronRight, Images } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type BatchPreviewControlsProps = {
  currentIndex: number
  totalCount: number
  currentLabel: string
  itemLabel: string
  onPrevious: () => void
  onNext: () => void
}

export function BatchPreviewControls({
  currentIndex,
  totalCount,
  currentLabel,
  itemLabel,
  onPrevious,
  onNext,
}: BatchPreviewControlsProps) {
  const canNavigate = totalCount > 1

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
      <div className="min-w-0 space-y-2">
        <Badge variant="outline">
          <Images data-icon="inline-start" />
          {itemLabel} {currentIndex + 1} of {totalCount}
        </Badge>
        <p className="truncate text-sm font-medium" title={currentLabel}>
          {currentLabel}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNavigate}
          onClick={onPrevious}
        >
          <ChevronLeft data-icon="inline-start" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNavigate}
          onClick={onNext}
        >
          Next
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
