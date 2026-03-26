"use client"

import { type ChangeEvent, useId, useRef, useState } from "react"
import { ImageUp, LoaderCircle, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FileDropzoneProps = {
  title: string
  description: string
  accept: string
  onFileSelect: (file: File) => void | Promise<void>
  isLoading?: boolean
  error?: string | null
  helperText?: string
  className?: string
}

export function FileDropzone({
  title,
  description,
  accept,
  onFileSelect,
  isLoading = false,
  error,
  helperText,
  className,
}: FileDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    await onFileSelect(file)
    event.target.value = ""
  }

  return (
    <div
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-br from-sky-500/12 via-teal-400/8 to-transparent" />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5" />
              Client-side only
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <div className="hidden rounded-3xl border border-border/70 bg-background/80 p-4 md:block">
            <ImageUp className="size-6 text-sky-600 dark:text-sky-300" />
          </div>
        </div>

        <label
          htmlFor={inputId}
          className={cn(
            "group flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-dashed px-6 py-10 text-center transition",
            isDragging
              ? "border-sky-500 bg-sky-500/8"
              : "border-border/80 bg-background/60 hover:border-sky-400/70 hover:bg-accent/30"
          )}
          onDragOver={(event) => {
            event.preventDefault()
            if (!isDragging) {
              setIsDragging(true)
            }
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            if (
              event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              return
            }
            setIsDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            const file = event.dataTransfer.files?.[0]
            if (!file) {
              return
            }
            void onFileSelect(file)
          }}
        >
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-sm transition group-hover:scale-[1.02]">
            {isLoading ? (
              <LoaderCircle className="size-7 animate-spin text-sky-600 dark:text-sky-300" />
            ) : (
              <ImageUp className="size-7 text-sky-600 dark:text-sky-300" />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium">
              Drop a file here or choose one from your device
            </p>
            <p className="text-sm text-muted-foreground">
              Accepted:{" "}
              <span className="font-medium text-foreground">{accept}</span>
            </p>
            {helperText ? (
              <p className="text-sm text-muted-foreground">{helperText}</p>
            ) : null}
          </div>
          <Button type="button" size="lg" className="mt-2">
            Choose File
          </Button>
        </label>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleInputChange}
        />

        {error ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
