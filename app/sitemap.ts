import type { MetadataRoute } from "next"

import { getCanonicalUrl } from "@/lib/site-metadata"

const SITE_ROUTES: Array<{
  path: string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
  priority: number
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/resize-image", changeFrequency: "monthly", priority: 0.9 },
  { path: "/raster-convert", changeFrequency: "monthly", priority: 0.9 },
  { path: "/svg-to-png", changeFrequency: "monthly", priority: 0.85 },
  { path: "/circle-crop", changeFrequency: "monthly", priority: 0.8 },
  { path: "/aspect-ratio-crop", changeFrequency: "monthly", priority: 0.8 },
  { path: "/rounded-corners", changeFrequency: "monthly", priority: 0.8 },
  {
    path: "/trim-transparent-pixels",
    changeFrequency: "monthly",
    priority: 0.8,
  },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return SITE_ROUTES.map((route) => ({
    url: getCanonicalUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
