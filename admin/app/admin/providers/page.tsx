"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    XCircle,
    Heart,
    TrendingUp,
    Route,
    Brain,
    Memory,
    Gauge,
    BarChart3,
    RefreshCw,
    Plus,
    Trash2,
    Edit
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
    health_status?: boolean
    usage_stats?: {
        total_requests: number
        successful_requests: number
        failed_requests: number
        average_response_time: number
    }
}

interface RoutingRule {
    id: string
    name: string
    input_pattern: string
    provider_type: string
    provider_id: number
    priority: number
    is_active: boolean
}

export default function ProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<number | null>(null)
    const [healthCheckLoading, setHealthCheckLoading] = useState(false)
    const [routingRules, setRoutingRules] = useState<RoutingRule[]>([])
    const [showAddRule, setShowAddRule] = useState(false)
    const [newRule, setNewRule] = useState<Partial<RoutingRule>>({
        name: '',
        input_pattern: '',
        provider_type: 'ai',
        priority: 1,
        is_active: true
    })
    const { language } = useLanguage()

    useEffect(() => {
        fetchProviders()
        fetchRoutingRules()
        // Start periodic health checks
        const healthCheckInterval = setInterval(performHealthCheck, 300000) // 5 minutes
        return () => clearInterval(healthCheckInterval)
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

    const fetchRoutingRules = async () => {
        try {
            const response = await fetch('/api/dispatcher/rules')
            const data = await response.json()
            if (data.success) {
                setRoutingRules(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch routing rules:', error)
        }
    }

    const performHealthCheck = async () => {
        setHealthCheckLoading(true)
        try {
            const response = await fetch('/api/providers/health-check')
            const data = await response.json()
            if (data.success) {
                setProviders(prev =>
                    prev.map(provider => ({
                        ...provider,
                        health_status: data.health_status[provider.id] || false
                    }))
                )
            }
        } catch (error) {
            console.error('Health check failed:', error)
        } finally {
            setHealthCheckLoading(false)
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

    const updateProviderPriority = async (providerId: number, priority: number) => {
        try {
            const response = await fetch('/api/providers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update_priority',
                    providerId,
                    priority
                }),
            })

            const data = await response.json()
            if (data.success) {
                setProviders(prev =>
                    prev.map(p =>
                        p.id === providerId ? { ...p, priority } : p
                    )
                )
            }
        } catch (error) {
            console.error('Failed to update priority:', error)
        }
    }

    const addRoutingRule = async () => {
        try {
            const response = await fetch('/api/dispatcher/rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'add_rule',
                    rule: newRule
                }),
            })

            const data = await response.json()
            if (data.success) {
                setRoutingRules(prev => [...prev, data.rule])
                setShowAddRule(false)
                setNewRule({
                    name: '',
                    input_pattern: '',
                    provider_type: 'ai',
                    priority: 1,
                    is_active: true
                })
            }
        } catch (error) {
            console.error('Failed to add routing rule:', error)
        }
    }

    const deleteRoutingRule = async (ruleId: string) => {
        try {
            const response = await fetch('/api/dispatcher/rules', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete_rule',
                    ruleId
                }),
            })

            const data = await response.json()
            if (data.success) {
                setRoutingRules(prev => prev.filter(rule => rule.id !== ruleId))
            }
        } catch (error) {
            console.error('Failed to delete routing rule:', error)
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

    const getStatusIcon = (isActive: boolean, healthStatus?: boolean) => {
        if (!isActive) return <XCircle className="h-4 w-4 text-red-500" />
        if (healthStatus === false) return <AlertCircle className="h-4 w-4 text-yellow-500" />
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }

    const getHealthStatus = (provider: Provider) => {
        if (!provider.is_active) return 'inactive'
        if (provider.health_status === false) return 'unhealthy'
        return 'healthy'
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
            <div className="flex items-center justify-between">
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
                <Button
                    onClick={performHealthCheck}
                    disabled={healthCheckLoading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${healthCheckLoading ? 'animate-spin' : ''}`} />
                    {language === 'bn' ? 'হেলথ চেক' : 'Health Check'}
                </Button>
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
                                    {language === 'bn' ? 'সুস্থ' : 'Healthy'}
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {providers.filter(p => getHealthStatus(p) === 'healthy').length}
                                </p>
                            </div>
                            <Heart className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">
                                    {language === 'bn' ? 'মোট রিকোয়েস্ট' : 'Total Requests'}
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {providers.reduce((sum, p) => sum + (p.usage_stats?.total_requests || 0), 0)}
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="providers" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="providers" className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        {language === 'bn' ? 'প্রোভাইডার' : 'Providers'}
                    </TabsTrigger>
                    <TabsTrigger value="routing" className="flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        {language === 'bn' ? 'রাউটিং রুল' : 'Routing Rules'}
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics'}
                    </TabsTrigger>
                    <TabsTrigger value="memory" className="flex items-center gap-2">
                        <Memory className="h-4 w-4" />
                        {language === 'bn' ? 'মেমরি' : 'Memory'}
                    </TabsTrigger>
                </TabsList>

                {/* Providers Tab */}
                <TabsContent value="providers" className="space-y-4">
                    {Object.entries(groupedProviders).map(([type, typeProviders]) => (
                        <div key={type} className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                {getProviderIcon(type)}
                                {getProviderTypeName(type)}
                            </h3>
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
                                                {getStatusIcon(provider.is_active, provider.health_status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600">
                                                        {language === 'bn' ? 'অগ্রাধিকার' : 'Priority'}
                                                    </span>
                                                    <Select
                                                        value={provider.priority.toString()}
                                                        onValueChange={(value) => updateProviderPriority(provider.id, parseInt(value))}
                                                    >
                                                        <SelectTrigger className="w-20">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[1, 2, 3, 4, 5].map(p => (
                                                                <SelectItem key={p} value={p.toString()}>{p}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600">
                                                        {language === 'bn' ? 'হেলথ স্ট্যাটাস' : 'Health Status'}
                                                    </span>
                                                    <Badge variant={
                                                        getHealthStatus(provider) === 'healthy' ? 'default' :
                                                            getHealthStatus(provider) === 'unhealthy' ? 'destructive' : 'secondary'
                                                    }>
                                                        {getHealthStatus(provider)}
                                                    </Badge>
                                                </div>

                                                {provider.usage_stats && (
                                                    <>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-slate-600">
                                                                {language === 'bn' ? 'মোট রিকোয়েস্ট' : 'Total Requests'}
                                                            </span>
                                                            <span className="font-mono">{provider.usage_stats.total_requests}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-slate-600">
                                                                {language === 'bn' ? 'সফল রিকোয়েস্ট' : 'Successful'}
                                                            </span>
                                                            <span className="font-mono text-green-600">{provider.usage_stats.successful_requests}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-slate-600">
                                                                {language === 'bn' ? 'ব্যর্থ রিকোয়েস্ট' : 'Failed'}
                                                            </span>
                                                            <span className="font-mono text-red-600">{provider.usage_stats.failed_requests}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-slate-600">
                                                                {language === 'bn' ? 'গড় রেসপন্স টাইম' : 'Avg Response Time'}
                                                            </span>
                                                            <span className="font-mono">{provider.usage_stats.average_response_time}ms</span>
                                                        </div>
                                                    </>
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
                        </div>
                    ))}
                </TabsContent>

                {/* Routing Rules Tab */}
                <TabsContent value="routing" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                            {language === 'bn' ? 'রাউটিং রুল' : 'Routing Rules'}
                        </h3>
                        <Button onClick={() => setShowAddRule(true)} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            {language === 'bn' ? 'নতুন রুল' : 'Add Rule'}
                        </Button>
                    </div>

                    {showAddRule && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{language === 'bn' ? 'নতুন রাউটিং রুল' : 'New Routing Rule'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{language === 'bn' ? 'রুলের নাম' : 'Rule Name'}</Label>
                                        <Input
                                            value={newRule.name}
                                            onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder={language === 'bn' ? 'রুলের নাম দিন' : 'Enter rule name'}
                                        />
                                    </div>
                                    <div>
                                        <Label>{language === 'bn' ? 'প্রোভাইডার টাইপ' : 'Provider Type'}</Label>
                                        <Select
                                            value={newRule.provider_type}
                                            onValueChange={(value) => setNewRule(prev => ({ ...prev, provider_type: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ai">AI</SelectItem>
                                                <SelectItem value="tts">TTS</SelectItem>
                                                <SelectItem value="stt">STT</SelectItem>
                                                <SelectItem value="news">News</SelectItem>
                                                <SelectItem value="weather">Weather</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label>{language === 'bn' ? 'ইনপুট প্যাটার্ন' : 'Input Pattern'}</Label>
                                    <Textarea
                                        value={newRule.input_pattern}
                                        onChange={(e) => setNewRule(prev => ({ ...prev, input_pattern: e.target.value }))}
                                        placeholder={language === 'bn' ? 'রেজেক্স প্যাটার্ন (যেমন: .*code.*)' : 'Regex pattern (e.g., .*code.*)'}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <Label>{language === 'bn' ? 'অগ্রাধিকার' : 'Priority'}</Label>
                                        <Select
                                            value={newRule.priority?.toString()}
                                            onValueChange={(value) => setNewRule(prev => ({ ...prev, priority: parseInt(value) }))}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5].map(p => (
                                                    <SelectItem key={p} value={p.toString()}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={newRule.is_active}
                                            onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, is_active: checked }))}
                                        />
                                        <Label>{language === 'bn' ? 'সক্রিয়' : 'Active'}</Label>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={addRoutingRule}>
                                        {language === 'bn' ? 'রুল যোগ করুন' : 'Add Rule'}
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowAddRule(false)}>
                                        {language === 'bn' ? 'বাতিল' : 'Cancel'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {routingRules.map((rule) => (
                            <Card key={rule.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteRoutingRule(rule.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            {language === 'bn' ? 'প্যাটার্ন' : 'Pattern'}
                                        </span>
                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                            {rule.input_pattern}
                                        </code>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            {language === 'bn' ? 'টাইপ' : 'Type'}
                                        </span>
                                        <Badge variant="outline">{rule.provider_type.toUpperCase()}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            {language === 'bn' ? 'অগ্রাধিকার' : 'Priority'}
                                        </span>
                                        <Badge variant="outline">{rule.priority}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                                        </span>
                                        <Switch
                                            checked={rule.is_active}
                                            disabled
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <h3 className="text-lg font-semibold">
                        {language === 'bn' ? 'প্রোভাইডার অ্যানালিটিক্স' : 'Provider Analytics'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {providers.map((provider) => (
                            <Card key={provider.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {getProviderIcon(provider.type)}
                                        {provider.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {provider.usage_stats ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">
                                                    {language === 'bn' ? 'মোট রিকোয়েস্ট' : 'Total Requests'}
                                                </span>
                                                <span className="font-semibold">{provider.usage_stats.total_requests}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">
                                                    {language === 'bn' ? 'সফলতা হার' : 'Success Rate'}
                                                </span>
                                                <span className="font-semibold text-green-600">
                                                    {provider.usage_stats.total_requests > 0
                                                        ? Math.round((provider.usage_stats.successful_requests / provider.usage_stats.total_requests) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">
                                                    {language === 'bn' ? 'গড় রেসপন্স টাইম' : 'Avg Response Time'}
                                                </span>
                                                <span className="font-semibold">{provider.usage_stats.average_response_time}ms</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-sm">
                                            {language === 'bn' ? 'কোন ডেটা নেই' : 'No data available'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Memory Tab */}
                <TabsContent value="memory" className="space-y-4">
                    <h3 className="text-lg font-semibold">
                        {language === 'bn' ? 'মেমরি সিস্টেম' : 'Memory System'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Memory className="h-5 w-5" />
                                    {language === 'bn' ? 'ক্যাশ স্ট্যাটাস' : 'Cache Status'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">
                                            {language === 'bn' ? 'সক্রিয়' : 'Active'}
                                        </span>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">
                                            {language === 'bn' ? 'ক্যাশ হিট রেট' : 'Cache Hit Rate'}
                                        </span>
                                        <span className="font-semibold">75%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gauge className="h-5 w-5" />
                                    {language === 'bn' ? 'পারফরমেন্স' : 'Performance'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">
                                            {language === 'bn' ? 'গড় লেটেন্সি' : 'Avg Latency'}
                                        </span>
                                        <span className="font-semibold">150ms</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">
                                            {language === 'bn' ? 'মেমরি ব্যবহার' : 'Memory Usage'}
                                        </span>
                                        <span className="font-semibold">45%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5" />
                                    {language === 'bn' ? 'স্মার্ট রাউটিং' : 'Smart Routing'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">
                                            {language === 'bn' ? 'সক্রিয়' : 'Active'}
                                        </span>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">
                                            {language === 'bn' ? 'রাউটিং রুল' : 'Routing Rules'}
                                        </span>
                                        <span className="font-semibold">{routingRules.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
} 