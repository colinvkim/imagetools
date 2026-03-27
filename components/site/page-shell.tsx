import * as React from "react"

import { cn } from "@/lib/utils"

export function PageShell({
  children,
  className,
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12",
        className
      )}
    >
      {children}
    </div>
  )
}
