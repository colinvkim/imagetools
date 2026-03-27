import type { Metadata } from "next"

export const SITE_NAME = "imagetools"
export const SITE_DESCRIPTION =
  "Fast, client-side image tools for conversion, resizing, cropping, and rounded corners."
export const SITE_KEYWORDS = [
  "image tools",
  "client-side image tools",
  "webp to png",
  "svg to png",
  "circle crop",
  "aspect ratio crop",
  "trim transparent pixels",
  "rounded corners",
  "resize image",
  "browser image editor",
] as const

function normalizeSiteUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value
  }

  return `https://${value}`
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL

  return normalizeSiteUrl(configuredUrl ?? "http://localhost:3000")
}

export function createPageMetadata({
  title,
  description,
}: {
  title: string
  description: string
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}
