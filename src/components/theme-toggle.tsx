"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/utils/utils"

interface ThemeToggleProps {
  dropdownItem?: boolean
}

export function ThemeToggle({ dropdownItem = false }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (dropdownItem) {
    return (
      <div className="flex items-center justify-between w-full">
        <span className="text-sm">Theme</span>
        <Button 
          variant="outline"
          size="sm" 
          onClick={toggleTheme}
          className="h-8 w-8"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className={cn(
        "rounded-md w-10 h-10",
        "hover:bg-accent/50 hover:text-accent-foreground/90",
      )}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}