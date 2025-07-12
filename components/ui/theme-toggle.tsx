"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

interface ThemeToggleProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ 
  variant = "outline", 
  size = "icon", 
  className,
  showLabel = false
}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Sun className="h-4 w-4 transition-transform duration-200" />
        {showLabel && <span className="ml-2">Theme</span>}
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative h-4 w-4">
        <Sun 
          className={`absolute h-4 w-4 transition-all duration-300 ${isDark 
            ? 'scale-0 rotate-90 opacity-0' 
            : 'scale-100 rotate-0 opacity-100'
          }`} 
        />
        <Moon 
          className={`absolute h-4 w-4 transition-all duration-300 ${isDark 
            ? 'scale-100 rotate-0 opacity-100' 
            : 'scale-0 -rotate-90 opacity-0'
          }`} 
        />
      </div>
      {showLabel && (
        <span className="ml-2">
          {isDark ? "Light" : "Dark"} Mode
        </span>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
