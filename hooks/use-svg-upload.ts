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

export function useSvgUpload() {
  const [svg, setSvg] = useState<UploadedSvg | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const requestIdRef = useRef(0)

  const selectFile = useCallback(async (file: File) => {
    if (!isAcceptedSvg(file)) {
      setError("That file is not an SVG.")
      return
    }

    const currentRequestId = requestIdRef.current + 1
    requestIdRef.current = currentRequestId
    setError(null)
    setIsLoading(true)

    try {
      const content = await file.text()
      const metadata = parseSvgMetadata(content)
      const objectUrl = createSvgObjectUrl(content)

      if (requestIdRef.current !== currentRequestId) {
        URL.revokeObjectURL(objectUrl)
        return
      }

      setSvg({
        file,
        fileName: file.name,
        mimeType: file.type || "image/svg+xml",
        content,
        objectUrl,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.aspectRatio,
        fileSize: file.size,
      })
    } catch {
      setError("We couldn't read that SVG. Please try another file.")
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setIsLoading(false)
      }
    }
  }, [])

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

  return {
    svg,
    error,
    isLoading,
    clear,
    selectFile,
  }
}
