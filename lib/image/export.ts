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
