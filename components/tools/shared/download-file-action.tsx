"use client"

import * as React from "react"
import { Download, PencilLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  buildDownloadFileName,
  getFileNameWithoutExtension,
} from "@/lib/image/export"

type DownloadFileActionProps = {
  buttonLabel: string
  defaultFileName: string
  outputExtension: string
  resetKey: string
  disabled?: boolean
  dialogTitle?: string
  dialogDescription?: string
  onDownload: (fileName: string) => void | Promise<void>
}

export function DownloadFileAction({
  buttonLabel,
  defaultFileName,
  outputExtension,
  resetKey,
  disabled = false,
  dialogTitle = "Customize download name",
  dialogDescription,
  onDownload,
}: DownloadFileActionProps) {
  const inputId = React.useId()
  const suggestedBaseName = React.useMemo(
    () => getFileNameWithoutExtension(defaultFileName),
    [defaultFileName]
  )
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [fileNameInput, setFileNameInput] = React.useState(suggestedBaseName)
  const [hasCustomName, setHasCustomName] = React.useState(false)
  const previousResetKey = React.useRef(resetKey)

  React.useEffect(() => {
    if (previousResetKey.current !== resetKey) {
      previousResetKey.current = resetKey
      setFileNameInput(suggestedBaseName)
      setHasCustomName(false)
      setIsDialogOpen(false)
      return
    }

    if (!hasCustomName) {
      setFileNameInput(suggestedBaseName)
    }
  }, [hasCustomName, resetKey, suggestedBaseName])

  const resolvedFileName = React.useMemo(
    () =>
      buildDownloadFileName({
        baseName: fileNameInput,
        fallbackFileName: defaultFileName,
        extension: outputExtension,
      }),
    [defaultFileName, fileNameInput, outputExtension]
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value

    setFileNameInput(nextValue)
    setHasCustomName(
      getFileNameWithoutExtension(nextValue.trim()) !== suggestedBaseName
    )
  }

  const handleDownload = React.useCallback(async () => {
    await onDownload(resolvedFileName)
  }, [onDownload, resolvedFileName])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsDialogOpen(false)
    await handleDownload()
  }

  return (
    <>
      <div className="flex w-full gap-2">
        <Button
          size="lg"
          className="min-w-0 flex-1"
          disabled={disabled}
          onClick={() => void handleDownload()}
        >
          <Download data-icon="inline-start" />
          {buttonLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="shrink-0"
          disabled={disabled}
          aria-label="Customize output file name"
          title="Customize output file name"
          onClick={() => setIsDialogOpen(true)}
        >
          <PencilLine />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={(event) => void handleSubmit(event)}>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>
                {dialogDescription ??
                  "Pick the name you want before starting the download."}
              </DialogDescription>
            </DialogHeader>

            <div className="pt-2">
              <Field>
                <FieldLabel htmlFor={inputId}>File name</FieldLabel>
                <FieldContent>
                  <Input
                    id={inputId}
                    value={fileNameInput}
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                    onChange={handleInputChange}
                  />
                  <FieldDescription>
                    The extension stays {outputExtension}. Download will save as{" "}
                    <span className="font-mono text-foreground">
                      {resolvedFileName}
                    </span>
                    .
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>

            <DialogFooter className="mt-4" inset>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{buttonLabel}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
