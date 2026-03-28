"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type PresetToggleOption = {
  value: string
  label: React.ReactNode
}

type PresetToggleGroupProps = {
  value?: string
  onValueChange: (value: string) => void
  options: PresetToggleOption[]
  className?: string
  itemClassName?: string
}

export function PresetToggleGroup({
  value,
  onValueChange,
  options,
  className,
  itemClassName,
}: PresetToggleGroupProps) {
  return (
    <ToggleGroup
      multiple={false}
      spacing={2}
      value={value ? [value] : []}
      onValueChange={(groupValue) => onValueChange(groupValue[0] ?? "")}
      className={cn("flex w-full flex-wrap gap-2", className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            "min-h-9 rounded-full border border-border/80 bg-background px-4 text-sm font-medium text-foreground/90 shadow-xs transition-colors hover:border-foreground/15 hover:bg-muted/70 data-[state=on]:border-foreground/10 data-[state=on]:bg-foreground data-[state=on]:text-background",
            itemClassName
          )}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
