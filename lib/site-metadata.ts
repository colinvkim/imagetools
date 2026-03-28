import type { Metadata } from "next"

export const SITE_NAME = "imagetools"
export const SITE_URL = "https://imagetools.colinkim.dev"
export const SITE_REPOSITORY_URL = "https://github.com/colinvkim/imagetools"
export const SITE_TAGLINE =
  "Free, open-source image utilities that keep files on your device."
export const SITE_DESCRIPTION =
  "Free, open-source image tools for resizing, cropping, converting, and cleaning up files directly in your browser."
export const SITE_LOCALE = "en_US"
export const SITE_KEYWORDS = [
  "image tools",
  "free image tools",
  "open source image tools",
  "online image tools",
  "browser image tools",
  "private image tools",
  "image converter",
  "image resizer",
  "image cropper",
  "svg to png converter",
  "webp to png",
  "circle crop image",
  "aspect ratio crop image",
  "trim transparent pixels",
  "rounded corners image",
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

export function createToolStructuredData({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern web browser.",
    description,
    url: getCanonicalUrl(path),
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    codeRepository: SITE_REPOSITORY_URL,
  }
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
