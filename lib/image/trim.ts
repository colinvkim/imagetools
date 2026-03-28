import { loadImageElement } from "@/lib/image/load-image"
import {
  buildTrimDetectionResult,
  findOpaqueBounds,
  type OpaqueBounds,
  type TrimDetectionResult,
} from "@/lib/image/trim-core"

const FALLBACK_SAMPLE_MAX_SIDE = 1024
const LARGE_TRIM_ANALYSIS_PIXELS = 20_000_000

type DetectTransparentBoundsParams = {
  file: File
  imageUrl: string
  signal?: AbortSignal
}

type TrimWorkerResponse =
  | {
      ok: true
      result: TrimDetectionResult | null
    }
  | {
      ok: false
      error: string
    }

function createAbortError() {
  return new DOMException("The operation was aborted.", "AbortError")
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw createAbortError()
  }
}

function canUseTrimWorker() {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof createImageBitmap === "function"
  )
}

function getSampleDimensions(width: number, height: number) {
  const longestSide = Math.max(width, height)
  const scale =
    longestSide > FALLBACK_SAMPLE_MAX_SIDE
      ? FALLBACK_SAMPLE_MAX_SIDE / longestSide
      : 1

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function findOpaqueColumnInStrip(
  pixels: Uint8ClampedArray,
  stripWidth: number,
  stripHeight: number,
  fromEnd = false
) {
  const startX = fromEnd ? stripWidth - 1 : 0
  const endX = fromEnd ? -1 : stripWidth
  const stepX = fromEnd ? -1 : 1

  for (let x = startX; x !== endX; x += stepX) {
    for (let y = 0; y < stripHeight; y += 1) {
      if (pixels[(y * stripWidth + x) * 4 + 3]) {
        return x
      }
    }
  }

  return null
}

function findOpaqueRowInStrip(
  pixels: Uint8ClampedArray,
  stripWidth: number,
  stripHeight: number,
  fromEnd = false
) {
  const startY = fromEnd ? stripHeight - 1 : 0
  const endY = fromEnd ? -1 : stripHeight
  const stepY = fromEnd ? -1 : 1

  for (let y = startY; y !== endY; y += stepY) {
    for (let x = 0; x < stripWidth; x += 1) {
      if (pixels[(y * stripWidth + x) * 4 + 3]) {
        return y
      }
    }
  }

  return null
}

function getSearchWindow(
  sampleStart: number,
  sampleEnd: number,
  fullSize: number,
  sampleSize: number
) {
  const scale = fullSize / sampleSize
  const margin = Math.max(4, Math.ceil(scale) * 3)

  return {
    start: Math.max(0, Math.floor(sampleStart * scale) - margin),
    end: Math.min(fullSize - 1, Math.ceil((sampleEnd + 1) * scale) + margin - 1),
  }
}

function refineBoundsFromSample(
  context: CanvasRenderingContext2D,
  imageWidth: number,
  imageHeight: number,
  sampleBounds: OpaqueBounds,
  sampleWidth: number,
  sampleHeight: number
) {
  const horizontalWindow = {
    left: getSearchWindow(
      sampleBounds.minX,
      sampleBounds.minX,
      imageWidth,
      sampleWidth
    ),
    right: getSearchWindow(
      sampleBounds.maxX,
      sampleBounds.maxX,
      imageWidth,
      sampleWidth
    ),
  }
  const verticalWindow = {
    top: getSearchWindow(
      sampleBounds.minY,
      sampleBounds.minY,
      imageHeight,
      sampleHeight
    ),
    bottom: getSearchWindow(
      sampleBounds.maxY,
      sampleBounds.maxY,
      imageHeight,
      sampleHeight
    ),
  }

  const leftStripWidth = horizontalWindow.left.end - horizontalWindow.left.start + 1
  const rightStripWidth =
    horizontalWindow.right.end - horizontalWindow.right.start + 1
  const topStripHeight = verticalWindow.top.end - verticalWindow.top.start + 1
  const bottomStripHeight =
    verticalWindow.bottom.end - verticalWindow.bottom.start + 1

  const leftStrip = context.getImageData(
    horizontalWindow.left.start,
    0,
    leftStripWidth,
    imageHeight
  )
  const rightStrip = context.getImageData(
    horizontalWindow.right.start,
    0,
    rightStripWidth,
    imageHeight
  )
  const topStrip = context.getImageData(
    0,
    verticalWindow.top.start,
    imageWidth,
    topStripHeight
  )
  const bottomStrip = context.getImageData(
    0,
    verticalWindow.bottom.start,
    imageWidth,
    bottomStripHeight
  )

  const refinedMinX = findOpaqueColumnInStrip(
    leftStrip.data,
    leftStrip.width,
    leftStrip.height
  )
  const refinedMaxX = findOpaqueColumnInStrip(
    rightStrip.data,
    rightStrip.width,
    rightStrip.height,
    true
  )
  const refinedMinY = findOpaqueRowInStrip(
    topStrip.data,
    topStrip.width,
    topStrip.height
  )
  const refinedMaxY = findOpaqueRowInStrip(
    bottomStrip.data,
    bottomStrip.width,
    bottomStrip.height,
    true
  )

  if (
    refinedMinX === null ||
    refinedMaxX === null ||
    refinedMinY === null ||
    refinedMaxY === null
  ) {
    return null
  }

  return {
    minX: horizontalWindow.left.start + refinedMinX,
    maxX: horizontalWindow.right.start + refinedMaxX,
    minY: verticalWindow.top.start + refinedMinY,
    maxY: verticalWindow.bottom.start + refinedMaxY,
  }
}

async function detectTransparentBoundsOnMainThread({
  imageUrl,
  signal,
}: Omit<DetectTransparentBoundsParams, "file">) {
  throwIfAborted(signal)

  const sourceImage = await loadImageElement(imageUrl)
  throwIfAborted(signal)

  const imageWidth = Math.max(
    1,
    Math.round(sourceImage.naturalWidth || sourceImage.width)
  )
  const imageHeight = Math.max(
    1,
    Math.round(sourceImage.naturalHeight || sourceImage.height)
  )
  const sampleDimensions = getSampleDimensions(imageWidth, imageHeight)
  const sampleCanvas = document.createElement("canvas")
  sampleCanvas.width = sampleDimensions.width
  sampleCanvas.height = sampleDimensions.height

  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true })

  if (!sampleContext) {
    throw new Error("Canvas is not available in this browser.")
  }

  sampleContext.clearRect(0, 0, sampleDimensions.width, sampleDimensions.height)
  sampleContext.drawImage(sourceImage, 0, 0, sampleDimensions.width, sampleDimensions.height)

  const sampledImageData = sampleContext.getImageData(
    0,
    0,
    sampleDimensions.width,
    sampleDimensions.height
  )
  const sampleBounds = findOpaqueBounds(
    sampledImageData.data,
    sampleDimensions.width,
    sampleDimensions.height
  )

  if (!sampleBounds) {
    return null
  }

  if (
    sampleDimensions.width === imageWidth &&
    sampleDimensions.height === imageHeight
  ) {
    return buildTrimDetectionResult(sampleBounds, imageWidth, imageHeight)
  }

  throwIfAborted(signal)

  const fullCanvas = document.createElement("canvas")
  fullCanvas.width = imageWidth
  fullCanvas.height = imageHeight

  const fullContext = fullCanvas.getContext("2d", { willReadFrequently: true })

  if (!fullContext) {
    throw new Error("Canvas is not available in this browser.")
  }

  fullContext.clearRect(0, 0, imageWidth, imageHeight)
  fullContext.drawImage(sourceImage, 0, 0, imageWidth, imageHeight)

  throwIfAborted(signal)

  const refinedBounds = refineBoundsFromSample(
    fullContext,
    imageWidth,
    imageHeight,
    sampleBounds,
    sampleDimensions.width,
    sampleDimensions.height
  )

  if (refinedBounds) {
    return buildTrimDetectionResult(refinedBounds, imageWidth, imageHeight)
  }

  const fullImageData = fullContext.getImageData(0, 0, imageWidth, imageHeight)
  const fullBounds = findOpaqueBounds(fullImageData.data, imageWidth, imageHeight)

  if (!fullBounds) {
    return null
  }

  return buildTrimDetectionResult(fullBounds, imageWidth, imageHeight)
}

async function detectTransparentBoundsWithWorker({
  file,
  signal,
}: Pick<DetectTransparentBoundsParams, "file" | "signal">) {
  return new Promise<TrimDetectionResult | null>((resolve, reject) => {
    const worker = new Worker(new URL("./trim.worker.ts", import.meta.url), {
      type: "module",
    })

    const cleanup = () => {
      worker.onmessage = null
      worker.onerror = null
      signal?.removeEventListener("abort", handleAbort)
      worker.terminate()
    }

    const handleAbort = () => {
      cleanup()
      reject(createAbortError())
    }

    worker.onmessage = (event: MessageEvent<TrimWorkerResponse>) => {
      cleanup()

      if (event.data.ok) {
        resolve(event.data.result)
        return
      }

      reject(new Error(event.data.error))
    }

    worker.onerror = () => {
      cleanup()
      reject(new Error("Transparent edge detection failed. Please try another image."))
    }

    signal?.addEventListener("abort", handleAbort, { once: true })

    if (signal?.aborted) {
      handleAbort()
      return
    }

    worker.postMessage({ file })
  })
}

export async function detectTransparentBounds({
  file,
  imageUrl,
  signal,
}: DetectTransparentBoundsParams): Promise<TrimDetectionResult | null> {
  throwIfAborted(signal)

  if (canUseTrimWorker()) {
    try {
      return await detectTransparentBoundsWithWorker({ file, signal })
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        throw caughtError
      }
    }
  }

  return detectTransparentBoundsOnMainThread({ imageUrl, signal })
}

export function isLargeTrimAnalysisImage(width: number, height: number) {
  return width * height >= LARGE_TRIM_ANALYSIS_PIXELS
}

export type { TrimDetectionResult }
