"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  getAcceptedClipboardFiles,
  getNormalizedFileName,
  matchesAcceptedFile,
} from "@/lib/file-input"
import { getImageDimensions } from "@/lib/image/load-image"

type UploadedImage = {
  file: File
  fileName: string
  mimeType: string
  objectUrl: string
  width: number
  height: number
  fileSize: number
}

type UseImageUploadOptions = {
  mimeTypes?: string[]
  extensions?: string[]
  pasteMode?: "never" | "always" | "when-empty" | "when-has-image"
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    mimeTypes = ["image/*"],
    extensions = [],
    pasteMode = "never",
  } = options

  const [image, setImage] = useState<UploadedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const requestIdRef = useRef(0)

  const selectFile = useCallback(
    async (file: File) => {
      if (!matchesAcceptedFile(file, mimeTypes, extensions)) {
        setError("That file type is not supported for this tool.")
        return
      }

      const currentRequestId = requestIdRef.current + 1
      requestIdRef.current = currentRequestId
      setError(null)
      setIsLoading(true)

      const objectUrl = URL.createObjectURL(file)

      try {
        const dimensions = await getImageDimensions(objectUrl)

        if (requestIdRef.current !== currentRequestId) {
          URL.revokeObjectURL(objectUrl)
          return
        }

        setImage({
          file,
          fileName: getNormalizedFileName(file, {
            fallbackBaseName: "pasted-image",
          }),
          mimeType: file.type,
          objectUrl,
          width: dimensions.width,
          height: dimensions.height,
          fileSize: file.size,
        })
      } catch {
        URL.revokeObjectURL(objectUrl)
        setError("We couldn't read that image. Please try another file.")
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false)
        }
      }
    },
    [extensions, mimeTypes]
  )

  const clear = useCallback(() => {
    requestIdRef.current += 1
    setImage(null)
    setError(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!image) {
      return
    }

    return () => {
      URL.revokeObjectURL(image.objectUrl)
    }
  }, [image])

  useEffect(() => {
    const shouldEnablePaste =
      pasteMode === "always" ||
      (pasteMode === "when-empty" && !image) ||
      (pasteMode === "when-has-image" && Boolean(image))

    if (!shouldEnablePaste) {
      return
    }

    const onPaste = (event: ClipboardEvent) => {
      const file = getAcceptedClipboardFiles(event, mimeTypes, extensions)[0]

      if (!file) {
        return
      }

      event.preventDefault()
      void selectFile(file)
    }

    document.addEventListener("paste", onPaste)

    return () => {
      document.removeEventListener("paste", onPaste)
    }
  }, [extensions, image, mimeTypes, pasteMode, selectFile])

  return {
    image,
    error,
    isLoading,
    clear,
    selectFile,
  }
}
