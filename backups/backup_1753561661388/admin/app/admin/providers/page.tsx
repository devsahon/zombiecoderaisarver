"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Server, 
  Cloud, 
  Database, 
  Mic, 
  Volume2, 
  Globe, 
  CloudRain,
  Settings,
  Activity,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface Provider {
  id: number
  name: string
  type: string
  category: string
  api_url: string
  is_active: boolean
  priority: number
  latency_threshold: number
  max_requests_per_minute: number
  current_requests: number
  last_used: string
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const { language } = useLanguage()

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers')
      const data = await response.json()
      if (data.success) {
        setProviders(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProvider = async (providerId: number, isActive: boolean) => {
    setUpdating(providerId)
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_status',
          providerId,
          isActive
        }),
      })

      const data = await response.json()
      if (data.success) {
        setProviders(prev => 
          prev.map(p => 
            p.id === providerId ? { ...p, is_active: isActive } : p
          )
        )
      }
    } catch (error) {
      console.error('Failed to toggle provider:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'ai': return <Database className="h-5 w-5" />
      case 'tts': return <Volume2 className="h-5 w-5" />
      case 'stt': return <Mic className="h-5 w-5" />
      case 'news': return <Globe className="h-5 w-5" />
      case 'weather': return <CloudRain className="h-5 w-5" />
      default: return <Server className="h-5 w-5" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'local': return <Server className="h-4 w-4" />
      case 'cloud': return <Cloud className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />
  }

  const getProviderTypeName = (type: string) => {
    switch (type) {
      case 'ai': return language === 'bn' ? 'এআই মডেল' : 'AI Model'
      case 'tts': return language === 'bn' ? 'টেক্সট-টু-স্পিচ' : 'Text-to-Speech'
      case 'stt': return language === 'bn' ? 'স্পিচ-টু-টেক্সট' : 'Speech-to-Text'
      case 'news': return language === 'bn' ? 'নিউজ' : 'News'
      case 'weather': return language === 'bn' ? 'আবহাওয়া' : 'Weather'
      default: return type.toUpperCase()
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'local': return language === 'bn' ? 'লোকাল' : 'Local'
      case 'cloud': return language === 'bn' ? 'ক্লাউড' : 'Cloud'
      case 'fallback': return language === 'bn' ? 'ফলব্যাক' : 'Fallback'
      default: return category
    }
  }

  const groupedProviders = providers.reduce((acc, provider) => {
    if (!acc[provider.type]) {
      acc[provider.type] = []
    }
    acc[provider.type].push(provider)
    return acc
  }, {} as Record<string, Provider[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'bn' ? 'প্রোভাইডার লোড হচ্ছে...' : 'Loading providers...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {language === 'bn' ? 'প্রোভাইডার ব্যবস্থাপনা' : 'Provider Management'}
        </h1>
        <p className="text-slate-600 mt-2">
          {language === 'bn' 
            ? 'এআই, টিটিএস, এসটিটি এবং অন্যান্য সার্ভিস প্রোভাইডার পরিচালনা করুন' 
            : 'Manage AI, TTS, STT, and other service providers'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {language === 'bn' ? 'মোট প্রোভাইডার' : 'Total Providers'}
                </p>
                <p className="text-2xl font-bold">{providers.length}</p>
              </div>
              <Server className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {language === 'bn' ? 'সক্রিয়' : 'Active'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {providers.filter(p => p.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {language === 'bn' ? 'লোকাল' : 'Local'}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {providers.filter(p => p.category === 'local' && p.is_active).length}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {language === 'bn' ? 'ক্লাউড' : 'Cloud'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {providers.filter(p => p.category === 'cloud' && p.is_active).length}
                </p>
              </div>
              <Cloud className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Providers by Type */}
      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {language === 'bn' ? 'এআই' : 'AI'}
          </TabsTrigger>
          <TabsTrigger value="tts" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            TTS
          </TabsTrigger>
          <TabsTrigger value="stt" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            STT
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {language === 'bn' ? 'নিউজ' : 'News'}
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2">
            <CloudRain className="h-4 w-4" />
            {language === 'bn' ? 'আবহাওয়া' : 'Weather'}
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedProviders).map(([type, typeProviders]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeProviders.map((provider) => (
                <Card key={provider.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getProviderIcon(provider.type)}
                        <div>
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {getCategoryIcon(provider.category)}
                            {getCategoryName(provider.category)}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(provider.is_active)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {language === 'bn' ? 'অগ্রাধিকার' : 'Priority'}
                        </span>
                        <Badge variant="outline">{provider.priority}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {language === 'bn' ? 'লেটেন্সি থ্রেশহোল্ড' : 'Latency Threshold'}
                        </span>
                        <span className="font-mono">{provider.latency_threshold}ms</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {language === 'bn' ? 'রিকোয়েস্ট/মিনিট' : 'Requests/min'}
                        </span>
                        <span className="font-mono">
                          {provider.current_requests}/{provider.max_requests_per_minute}
                        </span>
                      </div>

                      {provider.last_used && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            {language === 'bn' ? 'শেষ ব্যবহার' : 'Last Used'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(provider.last_used).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium">
                        {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                      </span>
                      <Switch
                        checked={provider.is_active}
                        onCheckedChange={(checked) => toggleProvider(provider.id, checked)}
                        disabled={updating === provider.id}
                      />
                    </div>

                    {updating === provider.id && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 