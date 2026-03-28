import type { MetadataRoute } from "next"

import { getCanonicalUrl } from "@/lib/site-metadata"

const SITE_ROUTES = [
  "/",
  "/resize-image",
  "/raster-convert",
  "/svg-to-png",
  "/circle-crop",
  "/aspect-ratio-crop",
  "/rounded-corners",
  "/trim-transparent-pixels",
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.map((path) => ({
    url: getCanonicalUrl(path),
  }))
}
