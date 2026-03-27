export type AcceptedFilesConfig = {
  mimeTypes: string[]
  extensions: string[]
}

const MIME_TYPE_EXTENSION_MAP: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
}

export function parseAcceptAttribute(accept: string): AcceptedFilesConfig {
  const entries = accept
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)

  return {
    mimeTypes: entries.filter((entry) => !entry.startsWith(".")),
    extensions: entries.filter((entry) => entry.startsWith(".")),
  }
}

export function matchesAcceptedFile(
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

export function getAcceptedClipboardFiles(
  event: ClipboardEvent,
  mimeTypes: string[],
  extensions: string[]
) {
  const items = event.clipboardData?.items

  if (!items) {
    return []
  }

  return Array.from(items)
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null)
    .filter((file) => matchesAcceptedFile(file, mimeTypes, extensions))
}

export function getDefaultFileExtensionForMimeType(mimeType: string) {
  return MIME_TYPE_EXTENSION_MAP[mimeType] ?? ""
}

export function getNormalizedFileName(
  file: File,
  options: {
    fallbackBaseName?: string
    index?: number
  } = {}
) {
  const trimmedName = file.name.trim()

  if (trimmedName) {
    return trimmedName
  }

  const fallbackBaseName = options.fallbackBaseName ?? "pasted-file"
  const suffix =
    options.index === undefined ? "" : `-${Math.max(1, options.index + 1)}`

  return `${fallbackBaseName}${suffix}${getDefaultFileExtensionForMimeType(file.type)}`
}
