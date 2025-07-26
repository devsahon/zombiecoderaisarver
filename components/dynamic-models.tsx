"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Cpu, MemoryStick, Play, Settings, TrendingUp } from "lucide-react"
import Link from "next/link"

interface AIModel {
  id: number
  name: string
  version: string
  status: 'running' | 'stopped' | 'error'
  usage_type: string
  description: string
  memory_usage: number
  cpu_usage: number
  requests_count: number
  avg_response_time: number
  accuracy: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export function DynamicModels() {
  const [models, setModels] = useState<AIModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      if (data.success) {
        setModels(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading models...</div>
  }

  return (
    <div className="grid gap-6">
      {models.map((model) => (
        <Card key={model.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {model.name}
                    <Badge variant="secondary">{model.version}</Badge>
                    <Badge variant={model.status === "running" ? "default" : "destructive"}>
                      {model.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{model.description}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/models/${model.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                <Button size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Test Model
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{model.requests_count}</div>
                    <div className="text-sm text-slate-600">Total Requests</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{model.avg_response_time}s</div>
                    <div className="text-sm text-slate-600">Avg Response</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{model.accuracy}%</div>
                    <div className="text-sm text-slate-600">Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">Active</div>
                    <div className="text-sm text-slate-600">Status</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4" />
                        <span className="text-sm font-medium">Memory Usage</span>
                      </div>
                      <span className="text-sm text-slate-600">{model.memory_usage}GB</span>
                    </div>
                    <Progress value={(model.memory_usage / 4) * 100} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        <span className="text-sm font-medium">CPU Usage</span>
                      </div>
                      <span className="text-sm text-slate-600">{model.cpu_usage}%</span>
                    </div>
                    <Progress value={model.cpu_usage} className="h-2" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="capabilities" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{model.usage_type}</Badge>
                  <Badge variant="outline">AI Model</Badge>
                  <Badge variant="outline">Local</Badge>
                </div>
                <div className="text-sm text-slate-600">
                  <strong>Primary Use Case:</strong> {model.usage_type}
                </div>
                <div className="text-sm text-slate-600">
                  <strong>Last Updated:</strong> {new Date(model.updated_at).toLocaleDateString()}
                </div>
              </TabsContent>

              <TabsContent value="usage" className="space-y-4">
                <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm">Usage chart would be displayed here</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 