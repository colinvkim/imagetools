export const RASTER_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

export const RASTER_IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const

export const RASTER_IMAGE_ACCEPT = [
  ...RASTER_IMAGE_EXTENSIONS,
  ...RASTER_IMAGE_MIME_TYPES,
].join(",")

export const TRANSPARENT_RASTER_IMAGE_MIME_TYPES = [
  "image/png",
  "image/webp",
] as const

export const TRANSPARENT_RASTER_IMAGE_EXTENSIONS = [".png", ".webp"] as const

export const TRANSPARENT_RASTER_IMAGE_ACCEPT = [
  ...TRANSPARENT_RASTER_IMAGE_EXTENSIONS,
  ...TRANSPARENT_RASTER_IMAGE_MIME_TYPES,
].join(",")

export const GENERIC_IMAGE_EDIT_MIME_TYPES = ["image/*"] as const

export const GENERIC_IMAGE_EDIT_EXTENSIONS = RASTER_IMAGE_EXTENSIONS

export const GENERIC_IMAGE_EDIT_ACCEPT = [
  ...GENERIC_IMAGE_EDIT_MIME_TYPES,
  ...GENERIC_IMAGE_EDIT_EXTENSIONS,
].join(",")
