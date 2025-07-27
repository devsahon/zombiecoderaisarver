"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/lib/language-context"

interface SystemSettings {
  site_title: string
  site_title_bn: string
  logo_url: string
  theme: string
  language: string
}

export function DynamicLogo() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { language } = useLanguage()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !settings) {
    return (
      <Link href="/" className="font-bold text-xl text-blue-600">
        AI Dashboard
      </Link>
    )
  }

  return (
    <Link href="/" className="flex items-center space-x-2">
      {settings.logo_url && (
        <Image
          src={settings.logo_url}
          alt="Logo"
          width={32}
          height={32}
          className="rounded"
        />
      )}
      <span className="font-bold text-xl text-blue-600">
        {language === 'bn' ? settings.site_title_bn : settings.site_title}
      </span>
    </Link>
  )
} 