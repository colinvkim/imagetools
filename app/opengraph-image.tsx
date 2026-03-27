import { ImageResponse } from "next/og"

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata"

export const alt = `${SITE_NAME} preview`
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top left, rgba(56,189,248,0.35), transparent 30%), radial-gradient(circle at bottom right, rgba(20,184,166,0.28), transparent 28%), linear-gradient(160deg, #020617 0%, #0f172a 52%, #111827 100%)",
        color: "#f8fafc",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 44,
          borderRadius: 36,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(15,23,42,0.64)",
          display: "flex",
          padding: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #38bdf8 0%, #14b8a6 55%, #0f766e 100%)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: "#f8fafc",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: -1,
              }}
            >
              {SITE_NAME}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 860,
            }}
          >
            <div
              style={{
                fontSize: 78,
                lineHeight: 1.02,
                fontWeight: 700,
                letterSpacing: -3,
              }}
            >
              Fast image tools that work right in your browser.
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: "rgba(248,250,252,0.82)",
              }}
            >
              {SITE_DESCRIPTION}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            {[
              "Resize Image",
              "Raster Convert",
              "SVG Export",
              "Circle Crop",
              "Aspect Ratio Crop",
              "Rounded Corners",
            ].map((label) => (
              <div
                key={label}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.16)",
                  padding: "12px 20px",
                  fontSize: 24,
                  color: "rgba(248,250,252,0.92)",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    size
  )
}
