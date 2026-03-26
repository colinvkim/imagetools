"use client"

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

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
  enablePaste?: boolean
}

function matchesAcceptedFile(
  file: File,
  mimeTypes: string[],
  extensions: string[]
) {
  const lowerName = file.name.toLowerCase()

  const matchesMimeType =
    mimeTypes.length === 0 ||
    mimeTypes.some((mimeType) => {
      if (mimeType === "image/*") {
        return file.type.startsWith("image/")
      }

      return file.type === mimeType
    })

  const matchesExtension =
    extensions.length === 0 ||
    extensions.some((extension) => lowerName.endsWith(extension.toLowerCase()))

  return matchesMimeType || matchesExtension
}

function getPasteImageFile(
  event: ClipboardEvent,
  mimeTypes: string[],
  extensions: string[]
) {
  const items = event.clipboardData?.items

  if (!items) {
    return null
  }

  for (const item of Array.from(items)) {
    if (!item.type.startsWith("image/")) {
      continue
    }

    const file = item.getAsFile()

    if (file && matchesAcceptedFile(file, mimeTypes, extensions)) {
      return file
    }
  }

  return null
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    mimeTypes = ["image/*"],
    extensions = [],
    enablePaste = false,
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
          fileName: file.name,
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

  const handleInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (!file) {
        return
      }

      await selectFile(file)
      event.target.value = ""
    },
    [selectFile]
  )

  const handleDrop = useCallback(
    async (fileList: FileList | File[]) => {
      const [file] = Array.from(fileList)

      if (!file) {
        return
      }

      await selectFile(file)
    },
    [selectFile]
  )

  useEffect(() => {
    if (!image) {
      return
    }

    return () => {
      URL.revokeObjectURL(image.objectUrl)
    }
  }, [image])

  useEffect(() => {
    if (!enablePaste) {
      return
    }

    const onPaste = (event: ClipboardEvent) => {
      const file = getPasteImageFile(event, mimeTypes, extensions)

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
  }, [enablePaste, extensions, mimeTypes, selectFile])

  return {
    image,
    error,
    isLoading,
    clear,
    handleDrop,
    handleInputChange,
    selectFile,
  }
}
