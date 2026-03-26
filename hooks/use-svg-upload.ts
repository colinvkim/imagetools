"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { createSvgObjectUrl, parseSvgMetadata } from "@/lib/image/svg"

type UploadedSvg = {
  file: File
  fileName: string
  mimeType: string
  content: string
  objectUrl: string
  width: number
  height: number
  aspectRatio: number
  fileSize: number
}

function isAcceptedSvg(file: File) {
  return (
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")
  )
}

function isSvgMarkup(value: string) {
  return /<svg[\s>]/i.test(value)
}

function getSvgMarkupFromClipboard(event: ClipboardEvent) {
  const items = event.clipboardData?.items

  if (!items) {
    return null
  }

  for (const item of Array.from(items)) {
    if (item.type !== "text/plain" && item.type !== "text/html") {
      continue
    }

    const text = event.clipboardData?.getData(item.type)?.trim()

    if (text && isSvgMarkup(text)) {
      return text
    }
  }

  return null
}

type UseSvgUploadOptions = {
  enablePaste?: boolean
}

export function useSvgUpload(options: UseSvgUploadOptions = {}) {
  const { enablePaste = false } = options
  const [svg, setSvg] = useState<UploadedSvg | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const requestIdRef = useRef(0)

  const selectSvgContent = useCallback(
    async (
      content: string,
      fileName: string,
      mimeType: string,
      fileSize: number
    ) => {
      const currentRequestId = requestIdRef.current + 1
      requestIdRef.current = currentRequestId
      setError(null)
      setIsLoading(true)

      try {
        const metadata = parseSvgMetadata(content)
        const objectUrl = createSvgObjectUrl(content)

        if (requestIdRef.current !== currentRequestId) {
          URL.revokeObjectURL(objectUrl)
          return
        }

        setSvg({
          file: new File([content], fileName, { type: mimeType }),
          fileName,
          mimeType,
          content,
          objectUrl,
          width: metadata.width,
          height: metadata.height,
          aspectRatio: metadata.aspectRatio,
          fileSize,
        })
      } catch {
        setError("We couldn't read that SVG. Please try another file.")
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false)
        }
      }
    },
    []
  )

  const selectFile = useCallback(
    async (file: File) => {
      if (!isAcceptedSvg(file)) {
        setError("That file is not an SVG.")
        return
      }

      try {
        const content = await file.text()

        await selectSvgContent(
          content,
          file.name,
          file.type || "image/svg+xml",
          file.size
        )
      } catch {
        setError("We couldn't read that SVG. Please try another file.")
      }
    },
    [selectSvgContent]
  )

  const selectMarkup = useCallback(
    async (content: string) => {
      await selectSvgContent(
        content,
        "pasted-artwork.svg",
        "image/svg+xml",
        new Blob([content]).size
      )
    },
    [selectSvgContent]
  )

  const clear = useCallback(() => {
    requestIdRef.current += 1
    setSvg(null)
    setError(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!svg) {
      return
    }

    return () => {
      URL.revokeObjectURL(svg.objectUrl)
    }
  }, [svg])

  useEffect(() => {
    if (!enablePaste) {
      return
    }

    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items

      if (!items) {
        return
      }

      for (const item of Array.from(items)) {
        if (item.type !== "image/svg+xml") {
          continue
        }

        const file = item.getAsFile()

        if (!file) {
          continue
        }

        event.preventDefault()
        void selectFile(file)
        return
      }

      const markup = getSvgMarkupFromClipboard(event)

      if (!markup) {
        return
      }

      event.preventDefault()
      void selectMarkup(markup)
    }

    document.addEventListener("paste", onPaste)

    return () => {
      document.removeEventListener("paste", onPaste)
    }
  }, [enablePaste, selectFile, selectMarkup])

  return {
    svg,
    error,
    isLoading,
    clear,
    selectFile,
  }
}
