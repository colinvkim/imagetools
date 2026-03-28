import { ImageResponse } from "next/og"

import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-metadata"

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
        background:
          "radial-gradient(circle at top left, rgba(56,189,248,0.25), transparent 28%), radial-gradient(circle at bottom right, rgba(45,212,191,0.18), transparent 24%), linear-gradient(160deg, #020617 0%, #0f172a 52%, #111827 100%)",
        color: "#f8fafc",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: 32,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          borderRadius: 34,
          border: "1px solid rgba(148,163,184,0.16)",
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.86) 0%, rgba(15,23,42,0.72) 100%)",
          boxShadow: "0 34px 90px rgba(2,6,23,0.42)",
          padding: "54px 58px",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 30,
              maxWidth: 760,
              minHeight: 456,
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
                  width: 84,
                  height: 84,
                  display: "flex",
                  position: "relative",
                  borderRadius: 26,
                  background:
                    "linear-gradient(145deg, #38bdf8 0%, #14b8a6 56%, #0f766e 100%)",
                  boxShadow: "0 18px 42px rgba(20,184,166,0.32)",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    display: "flex",
                    position: "absolute",
                    left: 18,
                    top: 16,
                    borderRadius: 999,
                    background: "#f8fafc",
                  }}
                />
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    position: "absolute",
                    right: 14,
                    bottom: 14,
                    borderRadius: 14,
                    border: "5px solid #f8fafc",
                    borderLeftColor: "transparent",
                    borderTopColor: "transparent",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: -1.2,
                  }}
                >
                  {SITE_NAME}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 18,
                    textTransform: "uppercase",
                    letterSpacing: 1.4,
                    color: "rgba(226,232,240,0.7)",
                  }}
                >
                  Open-source image utilities
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 84,
                  lineHeight: 0.94,
                  fontWeight: 800,
                  letterSpacing: -4.2,
                  maxWidth: 740,
                }}
              >
                Image tools that stay on your device.
              </div>
              <div
                style={{
                  display: "flex",
                  maxWidth: 620,
                  fontSize: 30,
                  lineHeight: 1.35,
                  color: "rgba(226,232,240,0.82)",
                }}
              >
                {SITE_TAGLINE}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    size
  )
}
