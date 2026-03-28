/// <reference lib="webworker" />

import {
  buildTrimDetectionResult,
  findOpaqueBounds,
  type TrimDetectionResult,
} from "./trim-core"

type TrimWorkerRequest = {
  file: File
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

function getWorkerErrorMessage(caughtError: unknown) {
  if (caughtError instanceof Error && caughtError.message) {
    return caughtError.message
  }

  return "Transparent edge detection failed. Please try another image."
}

self.onmessage = async (event: MessageEvent<TrimWorkerRequest>) => {
  let bitmap: ImageBitmap | null = null

  try {
    bitmap = await createImageBitmap(event.data.file)
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const context = canvas.getContext("2d", { willReadFrequently: true })

    if (!context) {
      throw new Error("Canvas is not available in this browser.")
    }

    context.clearRect(0, 0, bitmap.width, bitmap.height)
    context.drawImage(bitmap, 0, 0)

    const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height)
    const bounds = findOpaqueBounds(imageData.data, bitmap.width, bitmap.height)

    const response: TrimWorkerResponse = {
      ok: true,
      result: bounds
        ? buildTrimDetectionResult(bounds, bitmap.width, bitmap.height)
        : null,
    }

    self.postMessage(response)
  } catch (caughtError) {
    const response: TrimWorkerResponse = {
      ok: false,
      error: getWorkerErrorMessage(caughtError),
    }

    self.postMessage(response)
  } finally {
    bitmap?.close()
  }
}

export {}
