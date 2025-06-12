"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, FileText, Home } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Button variant={pathname === "/dashboard" ? "default" : "ghost"} className="justify-start" asChild>
        <Link href="/dashboard" className="flex items-center">
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>
      <Button variant={pathname === "/dashboard/logs" ? "default" : "ghost"} className="justify-start" asChild>
        <Link href="/dashboard/logs" className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Logs
        </Link>
      </Button>
      <Button variant={pathname === "/dashboard/analytics" ? "default" : "ghost"} className="justify-start" asChild>
        <Link href="/dashboard/analytics" className="flex items-center">
          <BarChart className="mr-2 h-4 w-4" />
          Analitik
        </Link>
      </Button>
    </nav>
  )
}
