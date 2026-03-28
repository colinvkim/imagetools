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
      <DialogContent className="max-h-[calc(100%-2rem)] w-[min(1120px,calc(100%-2rem))] max-w-[calc(100%-2rem)] overflow-hidden overscroll-contain p-0 sm:max-w-[min(1120px,calc(100%-2rem))]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 overflow-y-auto overscroll-contain px-6 pb-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.85fr)]">
          {editor}
          <div className="flex min-w-0 flex-col gap-4">{sidebar}</div>
        </div>

        <DialogFooter
          className="mt-0 flex-col gap-2 sm:justify-between"
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
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Done
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
