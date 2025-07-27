import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DynamicNavigation } from "@/components/dynamic-navigation"
import { DynamicLogo } from "@/components/dynamic-logo"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Management Dashboard",
  description: "Comprehensive AI model management and development toolkit",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                  <DynamicLogo />
                  <DynamicNavigation />
                </div>
              </div>
            </nav>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
