export const MAX_RASTER_OUTPUT_WIDTH = 16_384
export const MAX_RASTER_OUTPUT_HEIGHT = 16_384
export const MAX_RASTER_OUTPUT_PIXELS = 64_000_000

type RasterOutputDimensions = {
  width: number
  height: number
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatMegapixels(value: number) {
  return `${(value / 1_000_000).toFixed(0)} MP`
}

export function getRasterOutputLimitsLabel() {
  return `${formatNumber(MAX_RASTER_OUTPUT_WIDTH)}px wide, ${formatNumber(
    MAX_RASTER_OUTPUT_HEIGHT
  )}px tall, and ${formatMegapixels(MAX_RASTER_OUTPUT_PIXELS)} total`
}

export function validateRasterOutputDimensions({
  width,
  height,
  label = "Output dimensions",
}: RasterOutputDimensions & { label?: string }) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error(`${label} must be greater than 0 pixels.`)
  }

  const normalizedWidth = Math.round(width)
  const normalizedHeight = Math.round(height)

  if (normalizedWidth > MAX_RASTER_OUTPUT_WIDTH) {
    throw new Error(
      `${label} width must be ${formatNumber(MAX_RASTER_OUTPUT_WIDTH)}px or less.`
    )
  }

  if (normalizedHeight > MAX_RASTER_OUTPUT_HEIGHT) {
    throw new Error(
      `${label} height must be ${formatNumber(MAX_RASTER_OUTPUT_HEIGHT)}px or less.`
    )
  }

  if (normalizedWidth * normalizedHeight > MAX_RASTER_OUTPUT_PIXELS) {
    throw new Error(
      `${label} must stay at or below ${formatMegapixels(
        MAX_RASTER_OUTPUT_PIXELS
      )} total pixels.`
    )
  }

  return {
    width: normalizedWidth,
    height: normalizedHeight,
  }
}
