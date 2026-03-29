"use client"

import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ToolEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  editor: React.ReactNode
  sidebar: React.ReactNode
  footerActions?: React.ReactNode
}

export function ToolEditorDialog({
  open,
  onOpenChange,
  title,
  description,
  editor,
  sidebar,
  footerActions,
}: ToolEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        initialFocus={(openType) => (openType === "touch" ? false : true)}
        className="top-auto bottom-2 left-1/2 flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-none -translate-x-1/2 translate-y-0 flex-col overflow-hidden overscroll-contain rounded-[1.5rem] p-0 sm:top-1/2 sm:bottom-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[min(1120px,calc(100%-2rem))] sm:max-w-[min(1120px,calc(100%-2rem))] sm:-translate-y-1/2"
      >
        <DialogHeader className="shrink-0 px-4 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto overscroll-contain px-4 pb-4 sm:gap-6 sm:px-6 sm:pb-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.85fr)]">
          {editor}
          <div className="flex min-w-0 flex-col gap-4">{sidebar}</div>
        </div>

        <DialogFooter
          className="mt-0 shrink-0 flex-col gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:justify-between"
          showCloseButton={false}
          inset={false}
        >
          {footerActions ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {footerActions}
            </div>
          ) : (
            <div />
          )}
          <DialogClose render={<Button variant="outline" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
