export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = "async"

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to load image"))
    image.src = src
  })
}

export async function getImageDimensions(src: string) {
  const image = await loadImageElement(src)

  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  }
}
