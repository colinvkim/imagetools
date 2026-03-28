"use client"

import { getDefaultFileExtensionForMimeType } from "@/lib/file-input"

const HTTP_PROTOCOLS = new Set(["http:", "https:"])
const FALLBACK_MIME_TYPES = new Set([
  "",
  "application/octet-stream",
  "application/xml",
  "text/plain",
  "text/xml",
])

function matchesMimeType(fileType: string, acceptedMimeTypes: string[]) {
  if (acceptedMimeTypes.length === 0) {
    return true
  }

  return acceptedMimeTypes.some((mimeType) => {
    if (mimeType === "image/*") {
      return fileType.startsWith("image/")
    }

    return fileType === mimeType
  })
}

function matchesExtension(fileName: string, acceptedExtensions: string[]) {
  if (acceptedExtensions.length === 0) {
    return true
  }

  const lowerCaseName = fileName.toLowerCase()

  return acceptedExtensions.some((extension) =>
    lowerCaseName.endsWith(extension.toLowerCase())
  )
}

function canUseExtensionFallback(fileType: string) {
  return FALLBACK_MIME_TYPES.has(fileType)
}

function normalizeUrlInput(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    throw new Error("Enter a file URL to upload.")
  }

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`

  let parsedUrl: URL

  try {
    parsedUrl = new URL(candidate)
  } catch {
    throw new Error("Enter a valid file URL.")
  }

  if (!HTTP_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error("Only http:// and https:// URLs are supported.")
  }

  return parsedUrl
}

function stripWrappingQuotes(value: string) {
  return value.replace(/^['"]|['"]$/g, "")
}

function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim()
}

function decodeFileName(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function getFileNameFromContentDisposition(headerValue: string | null) {
  if (!headerValue) {
    return null
  }

  const encodedFileNameMatch = headerValue.match(
    /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i
  )

  if (encodedFileNameMatch?.[1]) {
    return sanitizeFileName(
      decodeFileName(stripWrappingQuotes(encodedFileNameMatch[1]))
    )
  }

  const fileNameMatch = headerValue.match(/filename\s*=\s*([^;]+)/i)

  if (!fileNameMatch?.[1]) {
    return null
  }

  return sanitizeFileName(stripWrappingQuotes(fileNameMatch[1]))
}

function getFileNameFromUrlPath(urlValue: string) {
  const pathname = new URL(urlValue).pathname
  const lastSegment = pathname.split("/").filter(Boolean).at(-1)

  if (!lastSegment) {
    return null
  }

  return sanitizeFileName(decodeFileName(lastSegment))
}

function hasFileExtension(fileName: string) {
  return /\.[a-z\d]{1,10}$/i.test(fileName)
}

function buildFileName({
  response,
  requestUrl,
  blobType,
  fallbackBaseName = "url-upload",
}: {
  response: Response
  requestUrl: URL
  blobType: string
  fallbackBaseName?: string
}) {
  const contentDispositionFileName = getFileNameFromContentDisposition(
    response.headers.get("content-disposition")
  )
  const resolvedUrlFileName =
    getFileNameFromUrlPath(response.url) ?? getFileNameFromUrlPath(requestUrl.href)
  const baseFileName =
    contentDispositionFileName || resolvedUrlFileName || fallbackBaseName

  if (hasFileExtension(baseFileName)) {
    return baseFileName
  }

  const extension = getDefaultFileExtensionForMimeType(blobType)

  return extension ? `${baseFileName}${extension}` : baseFileName
}

function isAcceptedRemoteFile(
  file: File,
  acceptedMimeTypes: string[],
  acceptedExtensions: string[]
) {
  const normalizedType = file.type.toLowerCase()
  const mimeTypeMatches = matchesMimeType(normalizedType, acceptedMimeTypes)
  const extensionMatches = matchesExtension(file.name, acceptedExtensions)

  return mimeTypeMatches || (canUseExtensionFallback(normalizedType) && extensionMatches)
}

export async function fetchFileFromUrl(
  value: string,
  options: {
    acceptedMimeTypes: string[]
    acceptedExtensions: string[]
    fallbackBaseName?: string
  }
) {
  const requestUrl = normalizeUrlInput(value)

  let response: Response

  try {
    response = await fetch(requestUrl.href)
  } catch {
    throw new Error(
      "We couldn't fetch that URL. Make sure it points directly to a file and allows cross-origin requests."
    )
  }

  if (!response.ok) {
    throw new Error(
      `We couldn't fetch that URL (${response.status} ${response.statusText}).`
    )
  }

  let blob: Blob

  try {
    blob = await response.blob()
  } catch {
    throw new Error("We fetched that URL, but the file data could not be read.")
  }

  const fileName = buildFileName({
    response,
    requestUrl,
    blobType: blob.type,
    fallbackBaseName: options.fallbackBaseName,
  })
  const file = new File([blob], fileName, { type: blob.type })

  if (
    !isAcceptedRemoteFile(
      file,
      options.acceptedMimeTypes,
      options.acceptedExtensions
    )
  ) {
    throw new Error("That URL did not return a supported file for this tool.")
  }

  return file
}
