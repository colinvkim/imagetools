import type { Metadata } from "next"

export const SITE_NAME = "imagetools"
export const SITE_URL = "https://imagetools.colinkim.dev"
export const SITE_REPOSITORY_URL = "https://github.com/colinvkim/imagetools"
export const SITE_TAGLINE =
  "Lightning-fast image utilities that keep files on your device."
export const SITE_DESCRIPTION =
  "Lightning-fast image utilities for resizing, cropping, converting, and cleaning up files directly on your device."
export const SITE_LOCALE = "en_US"
export const SITE_KEYWORDS = [
  "image tools",
  "open source image tools",
  "free image tools",
  "online image tools",
  "client-side image tools",
  "private image tools",
  "on-device image editor",
  "webp to png",
  "svg to png",
  "circle crop",
  "aspect ratio crop",
  "trim transparent pixels",
  "rounded corners",
  "resize image",
  "browser image editor",
] as const

export function getSiteUrl() {
  return SITE_URL
}

export function getCanonicalUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString()
}

export function getSocialImageUrl() {
  return getCanonicalUrl("/opengraph-image")
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}: {
  title: string
  description: string
  path?: string
  keywords?: string[]
}): Metadata {
  const url = getCanonicalUrl(path)
  const socialImageUrl = getSocialImageUrl()

  return {
    title,
    description,
    keywords: [...SITE_KEYWORDS, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: "website",
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} preview image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImageUrl],
    },
  }
}
