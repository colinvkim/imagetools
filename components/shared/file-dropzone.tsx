"use client"

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
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
import { Separator } from "@/components/ui/separator"
import {
  getAcceptedClipboardFiles,
  parseAcceptAttribute,
} from "@/lib/file-input"
import { cn } from "@/lib/utils"

type FileDropzoneProps = {
  title: string
  description: string
  accept: string
  onFileSelect?: (file: File) => void | Promise<void>
  onFilesSelect?: (files: File[]) => void | Promise<void>
  isLoading?: boolean
  error?: string | null
  acceptedFormatsLabel?: string
  helperText?: string
  supportsPaste?: boolean
  multiple?: boolean
  className?: string
}

export function FileDropzone({
  title,
  description,
  accept,
  onFileSelect,
  onFilesSelect,
  isLoading = false,
  error,
  acceptedFormatsLabel,
  helperText,
  supportsPaste = false,
  multiple = false,
  className,
}: FileDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const acceptedFiles = useMemo(() => parseAcceptAttribute(accept), [accept])

  const handleSelectedFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return
      }

      if (multiple && onFilesSelect) {
        await onFilesSelect(files)
        return
      }

      if (onFileSelect) {
        await onFileSelect(files[0]!)
      }
    },
    [multiple, onFileSelect, onFilesSelect]
  )

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    await handleSelectedFiles(files)
    event.target.value = ""
  }

  useEffect(() => {
    if (!supportsPaste) {
      return
    }

    const onPaste = (event: ClipboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"]'))
      ) {
        return
      }

      const files = getAcceptedClipboardFiles(
        event,
        acceptedFiles.mimeTypes,
        acceptedFiles.extensions
      )

      if (files.length === 0) {
        return
      }

      void handleSelectedFiles(files)
    }

    document.addEventListener("paste", onPaste)

    return () => {
      document.removeEventListener("paste", onPaste)
    }
  }, [
    acceptedFiles.extensions,
    acceptedFiles.mimeTypes,
    handleSelectedFiles,
    supportsPaste,
  ])

  return (
    <Card
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      aria-busy={isLoading}
      className={cn("gap-0 rounded-[1.5rem] border bg-card shadow-sm", className)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Badge variant="outline" className="gap-2 self-start">
              <Sparkles aria-hidden="true" />
              Client-Side Only
            </Badge>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
              <CardDescription className="max-w-xl leading-6">
                {description}
              </CardDescription>
            </div>
          </div>
          <div className="hidden rounded-2xl border bg-muted p-4 md:block">
            <ImageUp aria-hidden="true" className="size-6 text-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 pb-6 pt-4 sm:pb-8 sm:pt-5">
        <label
          htmlFor={inputId}
          className={cn(
            "group flex min-h-64 cursor-pointer flex-col items-center justify-center gap-5 rounded-[1.25rem] border border-dashed px-6 py-10 text-center transition-[background-color,border-color,box-shadow] motion-reduce:transition-none",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/70"
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
            const files = Array.from(event.dataTransfer.files ?? [])

            if (files.length === 0) {
              return
            }

            void handleSelectedFiles(files)
          }}
        >
          <div className="rounded-2xl border bg-background p-4">
            {isLoading ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-7 animate-spin text-primary"
              />
            ) : (
              <ImageUp aria-hidden="true" className="size-7 text-primary" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium">
              {multiple
                ? "Drop files here or choose them from your device"
                : "Drop a file here or choose one from your device"}
            </p>
            {acceptedFormatsLabel ? (
              <p className="text-sm text-muted-foreground">
                Accepted formats:{" "}
                <span className="font-medium text-foreground">
                  {acceptedFormatsLabel}
                </span>
              </p>
            ) : null}
            {helperText ? (
              <p className="text-sm text-muted-foreground">{helperText}</p>
            ) : null}
          </div>
          <Separator className="max-w-sm" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary">Drag & Drop</Badge>
            <Badge variant="secondary">Browse</Badge>
            {supportsPaste ? <Badge variant="secondary">Paste</Badge> : null}
          </div>
          <Button
            type="button"
            size="lg"
            className="mt-2"
            onClick={(event) => {
              event.preventDefault()
              inputRef.current?.click()
            }}
          >
            <ImageUp data-icon="inline-start" />
            {multiple ? "Choose Files" : "Choose File"}
          </Button>
        </label>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={handleInputChange}
        />

        {error ? (
          <Alert variant="destructive">
            <Sparkles aria-hidden="true" />
            <AlertTitle>Upload problem</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
