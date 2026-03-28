"use client"

import * as React from "react"

type ObjectUrlItem = {
  objectUrl: string
}

export function revokeObjectUrls<T extends ObjectUrlItem>(items: T[]) {
  for (const item of items) {
    URL.revokeObjectURL(item.objectUrl)
  }
}

type RunBatchActionOptions = {
  action: () => Promise<void>
  successMessage: string
  fallbackErrorMessage: string
}

export function useObjectUrlBatch<T extends ObjectUrlItem>() {
  const [items, setItems] = React.useState<T[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isRunningAction, setIsRunningAction] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null)
  const itemsRef = React.useRef<T[]>([])
  const requestIdRef = React.useRef(0)

  const replaceItems = React.useCallback((nextItems: T[]) => {
    setItems((currentItems) => {
      revokeObjectUrls(currentItems)
      itemsRef.current = nextItems
      return nextItems
    })
  }, [])

  const resetActionState = React.useCallback(() => {
    setActionError(null)
    setActionSuccess(null)
  }, [])

  const beginRequest = React.useCallback(() => {
    const nextRequestId = requestIdRef.current + 1
    requestIdRef.current = nextRequestId
    return nextRequestId
  }, [])

  const isRequestCurrent = React.useCallback(
    (requestId: number) => requestIdRef.current === requestId,
    []
  )

  const clear = React.useCallback(() => {
    beginRequest()
    replaceItems([])
    setError(null)
    setIsLoading(false)
    setIsRunningAction(false)
    resetActionState()
  }, [beginRequest, replaceItems, resetActionState])

  const runAction = React.useCallback(
    async ({
      action,
      successMessage,
      fallbackErrorMessage,
    }: RunBatchActionOptions) => {
      setIsRunningAction(true)
      resetActionState()

      try {
        await action()
        setActionSuccess(successMessage)
      } catch (caughtError) {
        setActionError(
          caughtError instanceof Error
            ? caughtError.message
            : fallbackErrorMessage
        )
      } finally {
        setIsRunningAction(false)
      }
    },
    [resetActionState]
  )

  React.useEffect(() => {
    itemsRef.current = items
  }, [items])

  React.useEffect(() => {
    return () => {
      revokeObjectUrls(itemsRef.current)
    }
  }, [])

  return {
    items,
    error,
    isLoading,
    isRunningAction,
    actionError,
    actionSuccess,
    setError,
    setIsLoading,
    replaceItems,
    beginRequest,
    isRequestCurrent,
    resetActionState,
    clear,
    runAction,
  }
}
