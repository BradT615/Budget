"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/utils/utils"

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme } = useTheme()

  return (
    <div className={cn("flex items-center space-x-1 border border-border/50 rounded-md", className)}>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTheme('light');
        }}
        className="h-8 w-8 rounded-l flex items-center justify-center hover:bg-accent"
        aria-label="Light theme"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTheme('system');
        }}
        className="h-8 w-8 flex items-center justify-center hover:bg-accent"
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTheme('dark');
        }}
        className="h-8 w-8 rounded-r flex items-center justify-center hover:bg-accent"
        aria-label="Dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  )
}