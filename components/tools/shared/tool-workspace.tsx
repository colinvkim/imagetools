"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
  title: string
  description: string
  resetLabel?: string
  onReset?: () => void
  resetIcon?: React.ReactNode
  preview: React.ReactNode
  settings: React.ReactNode
  gridClassName?: string
}

export function ToolWorkspace({
  badge,
  title,
  description,
  resetLabel = "Choose another file",
  onReset,
  resetIcon,
  preview,
  settings,
  gridClassName,
}: ToolWorkspaceProps) {
  return (
    <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
      <CardHeader className="bg-linear-to-r from-sky-500/12 via-teal-400/8 to-transparent">
        <Badge variant="outline" className="self-start">
          {badge}
        </Badge>
        <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {onReset ? (
          <CardAction>
            <Button variant="outline" onClick={onReset}>
              {resetIcon}
              {resetLabel}
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>

      <CardContent
        className={cn(
          "grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.95fr)]",
          gridClassName
        )}
      >
        <div className="flex min-w-0 flex-col gap-4">{preview}</div>
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
    <Card className="rounded-[1.5rem] border-border/70 bg-background/65">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {fileName ? (
          <CardDescription
            className="min-w-0 truncate"
            title={fileName}
          >
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
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  )
}

type ToolStatCardProps = {
  label: string
  value: React.ReactNode
}

export function ToolStatCard({ label, value }: ToolStatCardProps) {
  return (
    <Card size="sm">
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
  return <CardFooter className={cn("flex-col gap-2", className)}>{children}</CardFooter>
}
