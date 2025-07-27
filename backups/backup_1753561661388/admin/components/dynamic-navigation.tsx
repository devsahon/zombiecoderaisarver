"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import * as Icons from "lucide-react"

interface NavigationItem {
  id: number
  title: string
  title_bn: string
  href: string
  icon: string
  category: string
  order_index: number
}

export function DynamicNavigation() {
  const [menuItems, setMenuItems] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  const { language } = useLanguage()

  useEffect(() => {
    fetchNavigationMenu()
  }, [])

  const fetchNavigationMenu = async () => {
    try {
      const response = await fetch('/api/navigation')
      const data = await response.json()
      if (data.success) {
        setMenuItems(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch navigation menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName]
    return IconComponent || Icons.Home
  }

  const groupMenuItems = () => {
    const groups: Record<string, NavigationItem[]> = {}
    menuItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }

  if (loading) {
    return <div className="flex items-center space-x-2">Loading...</div>
  }

  const groupedItems = groupMenuItems()

  return (
    <div className="flex items-center space-x-2">
      {Object.entries(groupedItems).map(([category, items]) => {
        if (category === 'main') {
          return items.map((item) => {
            const IconComponent = getIconComponent(item.icon)
            return (
              <Link key={item.id} href={item.href}>
                <Button variant="ghost" size="sm">
                  <IconComponent className="h-4 w-4 mr-2" />
                  {language === 'bn' ? item.title_bn : item.title}
                </Button>
              </Link>
            )
          })
        } else {
          const IconComponent = getIconComponent(items[0]?.icon || 'Home')
          return (
            <DropdownMenu key={category}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <IconComponent className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 
                    (category === 'ai' ? 'এআই টুলস' : 
                     category === 'tools' ? 'টুলস' : 
                     category === 'help' ? 'সাহায্য' : 
                     category === 'admin' ? 'অ্যাডমিন' : category) : 
                    (category === 'ai' ? 'AI Tools' : 
                     category === 'tools' ? 'Tools' : 
                     category === 'help' ? 'Help' : 
                     category === 'admin' ? 'Admin' : category)}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {items.map((item) => {
                  const ItemIcon = getIconComponent(item.icon)
                  return (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link href={item.href} className="w-full">
                        <ItemIcon className="h-4 w-4 mr-2" />
                        {language === 'bn' ? item.title_bn : item.title}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      })}
    </div>
  )
} 