import "./globals.css"
import type { Metadata, Viewport } from "next"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_REPOSITORY_URL,
  getCanonicalUrl,
  getSocialImageUrl,
  getSiteUrl,
} from "@/lib/site-metadata"
import { Analytics } from "@vercel/analytics/next"

const siteUrl = getSiteUrl()
const socialImageUrl = getSocialImageUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  alternates: {
    canonical: "/",
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: getCanonicalUrl("/"),
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
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [socialImageUrl],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#17181c" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: siteUrl,
        inLanguage: "en-US",
        sameAs: [SITE_REPOSITORY_URL],
      },
      {
        "@type": "SoftwareSourceCode",
        name: SITE_NAME,
        codeRepository: SITE_REPOSITORY_URL,
        license: "https://opensource.org/license/mit",
        url: siteUrl,
        programmingLanguage: ["TypeScript"],
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body className="min-h-svh bg-background text-foreground">
        <script
          id="structured-data-site"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Skip to main content
          </a>
          <div className="min-h-svh overflow-x-hidden">
            <SiteHeader />
            <main id="main-content">{children}</main>
            <Analytics />
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
