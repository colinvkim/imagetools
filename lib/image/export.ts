export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to export image"))
          return
        }

        resolve(blob)
      },
      type,
      quality
    )
  })
}

export function replaceFileExtension(fileName: string, extension: string) {
  const normalizedExtension = extension.startsWith(".")
    ? extension
    : `.${extension}`

  const lastDotIndex = fileName.lastIndexOf(".")

  if (lastDotIndex === -1) {
    return `${fileName}${normalizedExtension}`
  }

  return `${fileName.slice(0, lastDotIndex)}${normalizedExtension}`
}

export function getFileNameWithoutExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".")

  if (lastDotIndex === -1) {
    return fileName
  }

  return fileName.slice(0, lastDotIndex)
}

function normalizeFileExtension(extension: string) {
  return extension.startsWith(".") ? extension : `.${extension}`
}

export function sanitizeFileNameSegment(value: string) {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/[. ]+$/g, "")
}

export function buildDownloadFileName(params: {
  baseName: string
  fallbackFileName: string
  extension: string
}) {
  const normalizedExtension = normalizeFileExtension(params.extension)
  const preferredBaseName = sanitizeFileNameSegment(
    getFileNameWithoutExtension(params.baseName)
  )
  const fallbackBaseName = sanitizeFileNameSegment(
    getFileNameWithoutExtension(params.fallbackFileName)
  )
  const resolvedBaseName = preferredBaseName || fallbackBaseName || "download"

  return `${resolvedBaseName}${normalizedExtension}`
}

export function getRasterExportConfig(mimeType: string) {
  if (mimeType === "image/jpeg") {
    return {
      mimeType: "image/jpeg",
      extension: ".jpg",
      label: "JPG",
      quality: 0.92,
    }
  }

  if (mimeType === "image/webp") {
    return {
      mimeType: "image/webp",
      extension: ".webp",
      label: "WebP",
      quality: 0.92,
    }
  }

  return {
    mimeType: "image/png",
    extension: ".png",
    label: "PNG",
    quality: undefined,
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = objectUrl
  link.download = fileName
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 0)
}
