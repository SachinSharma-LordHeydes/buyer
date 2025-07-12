"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useThemeConfig() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"
  const isLight = resolvedTheme === "light"
  const isSystem = theme === "system"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const setLightMode = () => setTheme("light")
  const setDarkMode = () => setTheme("dark")
  const setSystemMode = () => setTheme("system")

  return {
    theme,
    systemTheme,
    resolvedTheme,
    isDark,
    isLight,
    isSystem,
    mounted,
    toggleTheme,
    setLightMode,
    setDarkMode,
    setSystemMode,
    setTheme,
  }
}
