export class ConcurrentMapError<T> extends Error {
  partialResults: T[]
  cause: unknown

  constructor(message: string, partialResults: T[], cause: unknown) {
    super(message)
    this.name = "ConcurrentMapError"
    this.partialResults = partialResults
    this.cause = cause
  }
}

export async function mapAsyncWithConcurrency<T, U>(
  items: T[],
  mapper: (item: T, index: number) => Promise<U>,
  concurrency = 4
) {
  if (items.length === 0) {
    return [] as U[]
  }

  const normalizedConcurrency = Math.max(1, Math.floor(concurrency))
  const results = new Array<U | undefined>(items.length)
  let nextIndex = 0

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1

      try {
        results[currentIndex] = await mapper(items[currentIndex]!, currentIndex)
      } catch (caughtError) {
        const partialResults = results.filter(
          (result): result is U => result !== undefined
        )
        const message =
          caughtError instanceof Error && caughtError.message
            ? caughtError.message
            : "Concurrent batch mapping failed."

        throw new ConcurrentMapError(message, partialResults, caughtError)
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(normalizedConcurrency, items.length) },
      () => runWorker()
    )
  )

  return results.filter((result): result is U => result !== undefined)
}
