import "./globals.css"
import type { Metadata, Viewport } from "next"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/site-metadata"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [...SITE_KEYWORDS],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body className="min-h-svh bg-background text-foreground">
        <ThemeProvider>
          <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.08),transparent_26%),linear-gradient(to_bottom,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.28),transparent_24%),radial-gradient(circle_at_top_right,rgba(15,118,110,0.24),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(13,148,136,0.14),transparent_24%),linear-gradient(to_bottom,rgba(2,6,23,0.98),rgba(15,23,42,0.96))]">
            <SiteHeader />
            {children}
            <Analytics />
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
