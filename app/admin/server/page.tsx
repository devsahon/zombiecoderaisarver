"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Server,
    Activity,
    Cpu,
    HardDrive,
    Wifi,
    WifiOff,
    Play,
    Stop,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    Settings,
    Terminal,
    Database,
    Brain,
    MessageSquare,
    FileText,
    Code,
    Sparkles
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ServerStatus {
    dispatcher_active: boolean
    latency_log: Array<{
        timestamp: string
        latency_ms: number
        agent?: string
        error?: string
    }>
    agents_status: Record<string, {
        status: string
        last_used?: string
        memory_usage: string
    }>
    fallback_info: {
        provider: string
        fallback: boolean
        last_error: string | null
        fallback_chain: string[]
    }
    system: {
        ram_percent: number
        ram_total_gb: number
        ram_available_gb: number
        cpu_percent: number
        disk_percent: number
        disk_total_gb: number
        disk_free_gb: number
        timestamp: string
    }
    server_info: {
        port: number
        uptime: number
        version: string
    }
}

interface Agent {
    name: string
    description: string
}

export default function ServerManagementPage() {
    const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
    const [agents, setAgents] = useState<Agent[]>([])
    const [providers, setProviders] = useState<any>({})
    const [logs, setLogs] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [serverUrl, setServerUrl] = useState('http://localhost:8000')
    const [serverStatuses, setServerStatuses] = useState<any[]>([])
    const [serverSummary, setServerSummary] = useState<any>(null)

    const fetchServerStatus = async () => {
        try {
            const response = await fetch('/api/server-status')
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setServerStatuses(data.servers)
                    setServerSummary(data.summary)
                    setError(null)
                } else {
                    setError('Failed to fetch server status')
                }
            } else {
                setError('Server status API not responding')
            }
        } catch (err) {
            setError('Cannot connect to server status API')
        }
    }

    const fetchMainServerStatus = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/status`)
            if (response.ok) {
                const data = await response.json()
                setServerStatus(data)
                setError(null)
            } else {
                setError('Main server not responding')
            }
        } catch (err) {
            setError('Cannot connect to main server')
        }
    }

    const fetchAgents = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/agents`)
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    const agentsList = Object.entries(data.agents).map(([name, description]) => ({
                        name,
                        description: description as string
                    }))
                    setAgents(agentsList)
                }
            }
        } catch (err) {
            console.error('Error fetching agents:', err)
        }
    }

    const fetchProviders = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/providers`)
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setProviders(data.providers)
                }
            }
        } catch (err) {
            console.error('Error fetching providers:', err)
        }
    }

    const fetchLogs = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/logs`)
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setLogs(data.logs)
                }
            }
        } catch (err) {
            console.error('Error fetching logs:', err)
        }
    }

    const testAgent = async (agentName: string) => {
        try {
            const response = await fetch(`${serverUrl}/api/dispatch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agent: agentName,
                    text: "Hello, this is a test message."
                })
            })

            if (response.ok) {
                const data = await response.json()
                alert(`Agent test successful! Response: ${data.result?.result || 'No response'}`)
            } else {
                alert('Agent test failed')
            }
        } catch (err) {
            alert('Error testing agent')
        }
    }

    const clearProviderMemory = async (providerId: string) => {
        try {
            const response = await fetch(`${serverUrl}/api/provider/${providerId}/clear_memory`, {
                method: 'POST'
            })

            if (response.ok) {
                alert(`Memory cleared for ${providerId}`)
            } else {
                alert('Failed to clear memory')
            }
        } catch (err) {
            alert('Error clearing memory')
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([
                fetchServerStatus(),
                fetchMainServerStatus(),
                fetchAgents(),
                fetchProviders(),
                fetchLogs()
            ])
            setLoading(false)
        }

        loadData()
        const interval = setInterval(loadData, 10000) // Refresh every 10 seconds
        return () => clearInterval(interval)
    }, [serverUrl])

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading server status...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Server Management</h1>
                    <p className="text-slate-600">Monitor and manage your AI server and agents</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                        fetchServerStatus()
                        fetchAgents()
                        fetchProviders()
                        fetchLogs()
                    }}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Server Connection Status */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error} - Server URL: {serverUrl}
                    </AlertDescription>
                </Alert>
            )}

            {/* Server Status Overview */}
            {serverSummary && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            Server Status Overview
                        </CardTitle>
                        <CardDescription>
                            Real-time status of all system servers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">{serverSummary.total}</div>
                                <div className="text-sm text-slate-600">Total Servers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{serverSummary.online}</div>
                                <div className="text-sm text-slate-600">Online</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{serverSummary.offline}</div>
                                <div className="text-sm text-slate-600">Offline</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {Math.round((serverSummary.online / serverSummary.total) * 100)}%
                                </div>
                                <div className="text-sm text-slate-600">Uptime</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {serverStatuses.map((server) => (
                                <div key={server.name} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${server.status === 'online' ? 'bg-green-500' :
                                                server.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`}></div>
                                        <div>
                                            <div className="font-medium text-sm">{server.name}</div>
                                            <div className="text-xs text-slate-500">Port {server.port}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={
                                            server.status === 'online' ? 'default' :
                                                server.status === 'offline' ? 'destructive' : 'secondary'
                                        }>
                                            {server.status}
                                        </Badge>
                                        {server.responseTime && (
                                            <div className="text-xs text-slate-500 mt-1">
                                                {server.responseTime}ms
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-xs text-slate-500">
                            Last updated: {new Date(serverSummary.timestamp).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            )}

            {serverStatus && (
                <>
                    {/* System Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Server Status</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {serverStatus.dispatcher_active ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                    <div className={`rounded-full w-12 h-12 flex items-center justify-center ${serverStatus.dispatcher_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {serverStatus.dispatcher_active ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">CPU Usage</p>
                                        <p className="text-2xl font-bold text-slate-900">{serverStatus.system.cpu_percent}%</p>
                                    </div>
                                    <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center">
                                        <Cpu className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">RAM Usage</p>
                                        <p className="text-2xl font-bold text-slate-900">{serverStatus.system.ram_percent}%</p>
                                    </div>
                                    <div className="bg-purple-100 text-purple-800 rounded-full w-12 h-12 flex items-center justify-center">
                                        <Database className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Disk Usage</p>
                                        <p className="text-2xl font-bold text-slate-900">{serverStatus.system.disk_percent}%</p>
                                    </div>
                                    <div className="bg-orange-100 text-orange-800 rounded-full w-12 h-12 flex items-center justify-center">
                                        <HardDrive className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Tabs defaultValue="agents" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="agents">Agents</TabsTrigger>
                            <TabsTrigger value="providers">Providers</TabsTrigger>
                            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                            <TabsTrigger value="logs">Logs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="agents" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5" />
                                        AI Agents
                                    </CardTitle>
                                    <CardDescription>Manage and monitor your AI agents</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {agents.map((agent) => {
                                            const status = serverStatus.agents_status[agent.name]
                                            return (
                                                <div key={agent.name} className="p-4 border rounded-lg">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="font-semibold capitalize">{agent.name.replace('_', ' ')}</h3>
                                                            <p className="text-sm text-slate-600">{agent.description}</p>
                                                        </div>
                                                        <Badge variant={status?.status === 'active' ? 'default' : 'secondary'}>
                                                            {status?.status || 'unknown'}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="text-xs text-slate-500">
                                                            Memory: {status?.memory_usage || '0KB'}
                                                        </div>
                                                        {status?.last_used && (
                                                            <div className="text-xs text-slate-500">
                                                                Last used: {new Date(status.last_used).toLocaleString()}
                                                            </div>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => testAgent(agent.name)}
                                                            className="w-full"
                                                        >
                                                            <Play className="h-3 w-3 mr-1" />
                                                            Test Agent
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="providers" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Server className="h-5 w-5" />
                                        AI Providers
                                    </CardTitle>
                                    <CardDescription>Manage AI model providers and their status</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(providers).map(([providerId, provider]: [string, any]) => (
                                            <div key={providerId} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className={`rounded-full w-10 h-10 flex items-center justify-center ${provider.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        <Server className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold capitalize">{providerId}</h3>
                                                        <p className="text-sm text-slate-600">Type: {provider.type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                                                        {provider.status}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => clearProviderMemory(providerId)}
                                                    >
                                                        Clear Memory
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="monitoring" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Performance Monitoring
                                    </CardTitle>
                                    <CardDescription>Real-time performance metrics and latency tracking</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Latency Chart */}
                                        <div>
                                            <h3 className="font-semibold mb-3">Recent Latency</h3>
                                            <div className="space-y-2">
                                                {serverStatus.latency_log.slice(-5).reverse().map((log, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-slate-500" />
                                                            <span className="text-sm">
                                                                {log.agent ? `${log.agent}: ` : ''}{log.latency_ms}ms
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* System Resources */}
                                        <div>
                                            <h3 className="font-semibold mb-3">System Resources</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>RAM Usage</span>
                                                        <span>{serverStatus.system.ram_percent}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${serverStatus.system.ram_percent}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {serverStatus.system.ram_available_gb}GB / {serverStatus.system.ram_total_gb}GB available
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Disk Usage</span>
                                                        <span>{serverStatus.system.disk_percent}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full"
                                                            style={{ width: `${serverStatus.system.disk_percent}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {serverStatus.system.disk_free_gb}GB / {serverStatus.system.disk_total_gb}GB free
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="logs" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Terminal className="h-5 w-5" />
                                        Server Logs
                                    </CardTitle>
                                    <CardDescription>Recent server activity and error logs</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                                        {logs.length > 0 ? (
                                            logs.map((log, index) => (
                                                <div key={index} className="mb-1">
                                                    {log}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-slate-400">No logs available</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
} 