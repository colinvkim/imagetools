"use client"

import { type ChangeEvent, useId, useRef, useState } from "react"
import { ImageUp, LoaderCircle, Sparkles } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
    <Card
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      className={cn(
        "relative rounded-[2rem] border-border/70 bg-card/80 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-br from-sky-500/12 via-teal-400/8 to-transparent" />
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Badge variant="outline" className="gap-2 self-start">
              <Sparkles />
              Client-side only
            </Badge>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
              <CardDescription className="max-w-xl leading-6">
                {description}
              </CardDescription>
            </div>
          </div>
          <div className="hidden rounded-3xl border border-border/70 bg-background/80 p-4 md:block">
            <ImageUp className="size-6 text-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex flex-col gap-6 pb-6">
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
              <LoaderCircle className="size-7 animate-spin text-primary" />
            ) : (
              <ImageUp className="size-7 text-primary" />
            )}
          </div>
          <div className="flex flex-col gap-2">
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
            <ImageUp data-icon="inline-start" />
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
          <Alert variant="destructive">
            <Sparkles />
            <AlertTitle>Upload problem</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
