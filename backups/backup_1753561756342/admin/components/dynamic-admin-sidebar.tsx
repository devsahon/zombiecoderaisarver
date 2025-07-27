"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import * as Icons from "lucide-react"

interface SidebarItem {
  id: number
  title: string
  title_bn: string
  href: string
  icon: string
  category: string
  order_index: number
}

export function DynamicAdminSidebar() {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    fetchAdminSidebar()
  }, [])

  const fetchAdminSidebar = async () => {
    try {
      const response = await fetch('/api/admin-sidebar')
      const data = await response.json()
      if (data.success) {
        // Transform the new API structure to match the component expectations
        const transformedItems: SidebarItem[] = []
        data.data.forEach((section: any, sectionIndex: number) => {
          section.items.forEach((item: any, itemIndex: number) => {
            transformedItems.push({
              id: sectionIndex * 100 + itemIndex,
              title: item.name,
              title_bn: item.name, // For now, use same name
              href: item.href,
              icon: item.icon,
              category: section.title,
              order_index: sectionIndex * 100 + itemIndex
            })
          })
        })
        setSidebarItems(transformedItems)
      }
    } catch (error) {
      console.error('Failed to fetch admin sidebar:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName]
    return IconComponent || Icons.Home
  }

  if (loading) {
    return <div className="bg-white border-r border-slate-200 w-64 h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-slate-200 flex flex-col transition-all duration-300 h-screen",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'bn' ? 'এআই ব্যবস্থাপনা' : 'AI Management'}
              </p>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                {language === 'bn' ? 'প্রশাসন' : 'Administration'}
              </p>
            )}
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              const IconComponent = getIconComponent(item.icon)
              return (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed ? "px-2" : "px-3",
                      isActive && "bg-blue-600 text-white hover:bg-blue-700",
                    )}
                  >
                    <IconComponent className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                    {!collapsed && (
                      <span>{language === 'bn' ? item.title_bn : item.title}</span>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                {language === 'bn' ? 'পাবলিক অ্যাক্সেস' : 'Public Access'}
              </p>
            )}
            {[
              { href: "/", title: "Public Dashboard", title_bn: "পাবলিক ড্যাশবোর্ড", icon: "Globe" },
              { href: "/ai-chat", title: "AI Chat", title_bn: "এআই চ্যাট", icon: "MessageSquare" },
              { href: "/documentation", title: "Documentation", title_bn: "ডকুমেন্টেশন", icon: "BookOpen" },
              { href: "/setup", title: "Setup Guide", title_bn: "সেটআপ গাইড", icon: "Settings" },
            ].map((item) => {
              const IconComponent = getIconComponent(item.icon)
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-slate-600 hover:text-slate-900",
                      collapsed ? "px-2" : "px-3",
                    )}
                  >
                    <IconComponent className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                    {!collapsed && <span>{language === 'bn' ? item.title_bn : item.title}</span>}
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Language Selector */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'ভাষা' : 'Language'}
            </p>
            <div className="flex gap-2">
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("en")}
                className="flex-1"
              >
                English
              </Button>
              <Button
                variant={language === "bn" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("bn")}
                className="flex-1"
              >
                বাংলা
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="p-4 border-t border-slate-200">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {!collapsed && (
            <div>
              <p className="text-xs font-medium text-slate-900">
                {language === 'bn' ? 'সিস্টেম স্ট্যাটাস' : 'System Status'}
              </p>
              <p className="text-xs text-slate-600">
                {language === 'bn' ? 'সব সিস্টেম চালু' : 'All Systems Operational'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 