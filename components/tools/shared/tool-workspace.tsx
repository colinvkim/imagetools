"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ToolWorkspaceProps = {
  badge: string
  resetLabel?: string
  onReset?: () => void
  resetIcon?: React.ReactNode
  preview: React.ReactNode
  settings: React.ReactNode
  gridClassName?: string
}

export function ToolWorkspace({
  badge,
  resetLabel = "Choose Another File",
  onReset,
  resetIcon,
  preview,
  settings,
  gridClassName,
}: ToolWorkspaceProps) {
  return (
    <Card className="tool-surface-card">
      <CardHeader className="tool-toolbar">
        <Badge variant="outline" className="tool-toolbar-badge">
          {badge}
        </Badge>
        {onReset ? (
          <div className="shrink-0">
            <Button
              variant="ghost"
              className="tool-toolbar-action"
              onClick={onReset}
            >
              {resetIcon}
              {resetLabel}
            </Button>
          </div>
        ) : null}
      </CardHeader>

      <CardContent
        className={cn(
          "tool-workspace-content lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.95fr)]",
          gridClassName
        )}
      >
        <div className="tool-preview-panel">
          <div className="flex min-w-0 flex-col gap-4">{preview}</div>
        </div>
        <div className="min-w-0">{settings}</div>
      </CardContent>
    </Card>
  )
}

type ToolSettingsCardProps = {
  title: string
  fileName?: string
  children: React.ReactNode
  footer?: React.ReactNode
  contentClassName?: string
}

export function ToolSettingsCard({
  title,
  fileName,
  children,
  footer,
  contentClassName,
}: ToolSettingsCardProps) {
  return (
    <Card className="tool-panel-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {fileName ? (
          <CardDescription className="min-w-0 truncate" title={fileName}>
            {fileName}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className={cn("flex flex-col gap-5", contentClassName)}>
        {children}
      </CardContent>

      {footer}
    </Card>
  )
}

export function ToolStatGrid({
  children,
  className,
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>{children}</div>
  )
}

type ToolStatCardProps = {
  label: string
  value: React.ReactNode
}

export function ToolStatCard({ label, value }: ToolStatCardProps) {
  return (
    <Card size="sm" className="border bg-card shadow-sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-lg tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

export function ToolPrimaryFooter({
  children,
  className,
}: React.ComponentProps<"div">) {
  return (
    <CardFooter className={cn("flex-col gap-2", className)}>
      {children}
    </CardFooter>
  )
}
