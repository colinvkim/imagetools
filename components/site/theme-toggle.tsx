"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

type ThemeName = "light" | "dark"

type ViewTransition = {
  finished: Promise<void>
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    updateCallback: () => void | Promise<void>
  ) => ViewTransition
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  const commitTheme = React.useCallback(
    (nextTheme: ThemeName) => {
      const root = document.documentElement
      root.classList.toggle("dark", nextTheme === "dark")
      root.style.colorScheme = nextTheme
      setTheme(nextTheme)
    },
    [setTheme]
  )

  const handleThemeToggle = React.useCallback(
    () => {
      const nextTheme: ThemeName = isDark ? "light" : "dark"
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches

      const transitionDocument = document as DocumentWithViewTransition

      if (!transitionDocument.startViewTransition || prefersReducedMotion) {
        commitTheme(nextTheme)
        return
      }

      transitionDocument
        .startViewTransition(() => {
          commitTheme(nextTheme)
        })
        .finished.catch(() => {})
    },
    [commitTheme, isDark]
  )

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full px-3 leading-none"
      onClick={handleThemeToggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun data-icon="inline-start" />
      ) : (
        <Moon data-icon="inline-start" />
      )}
      <span className="hidden sm:inline">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
      <span className="sm:hidden">Theme</span>
    </Button>
  )
}
