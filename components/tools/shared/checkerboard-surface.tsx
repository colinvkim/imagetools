import * as React from "react"

import { cn } from "@/lib/utils"

type CheckerboardSurfaceProps = React.ComponentProps<"div"> & {
  contentClassName?: string
}

export function CheckerboardSurface({
  children,
  className,
  contentClassName,
  ...props
}: CheckerboardSurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-border/70 bg-[linear-gradient(45deg,transparent_25%,rgba(148,163,184,0.08)_25%,rgba(148,163,184,0.08)_50%,transparent_50%,transparent_75%,rgba(148,163,184,0.08)_75%)] bg-size-[24px_24px]",
        className
      )}
      {...props}
    >
      <div
        className={cn("rounded-[1.1rem] bg-background/80", contentClassName)}
      >
        {children}
      </div>
    </div>
  )
}
