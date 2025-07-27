"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Database,
    Server,
    HardDrive,
    Activity,
    Settings,
    Download,
    Upload,
    Play,
    Stop,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Clock,
    BarChart3,
    Table,
    Search,
    Plus,
    Trash2,
    Edit
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminDatabasePage() {
    const [connectionStatus, setConnectionStatus] = useState('connected')
    const [databaseInfo, setDatabaseInfo] = useState({
        name: 'ai_dashboard',
        size: '9.7MB',
        tables: 8,
        connections: 5
    })
    const [tables, setTables] = useState([
        { name: 'admin_users', records: 1, size: '2.1KB', status: 'active' },
        { name: 'navigation_menu', records: 12, size: '1.8KB', status: 'active' },
        { name: 'admin_sidebar', records: 8, size: '1.5KB', status: 'active' },
        { name: 'system_settings', records: 15, size: '3.2KB', status: 'active' },
        { name: 'ai_models', records: 5, size: '2.8KB', status: 'active' },
        { name: 'user_sessions', records: 0, size: '0KB', status: 'empty' },
        { name: 'activity_logs', records: 0, size: '0KB', status: 'empty' },
        { name: 'backup_history', records: 0, size: '0KB', status: 'empty' }
    ])
    const [backups, setBackups] = useState([
        { id: 1, name: 'backup_2024_07_25.sql', size: '8.5MB', date: '2024-07-25 14:30', status: 'completed' },
        { id: 2, name: 'backup_2024_07_24.sql', size: '8.2MB', date: '2024-07-24 14:30', status: 'completed' },
        { id: 3, name: 'backup_2024_07_23.sql', size: '8.0MB', date: '2024-07-23 14:30', status: 'completed' }
    ])
    const [query, setQuery] = useState('SELECT * FROM admin_users LIMIT 10;')
    const [queryResult, setQueryResult] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const testConnection = () => {
        setLoading(true)
        setTimeout(() => {
            setConnectionStatus('connected')
            setLoading(false)
        }, 1000)
    }

    const executeQuery = () => {
        setLoading(true)
        setTimeout(() => {
            setQueryResult([
                { id: 1, username: 'admin', email: 'admin@example.com', role: 'super_admin', last_login: '2024-07-26 00:42:00' }
            ])
            setLoading(false)
        }, 1500)
    }

    const createBackup = () => {
        setLoading(true)
        setTimeout(() => {
            const newBackup = {
                id: backups.length + 1,
                name: `backup_${new Date().toISOString().split('T')[0]}.sql`,
                size: '9.7MB',
                date: new Date().toISOString().replace('T', ' ').split('.')[0],
                status: 'completed'
            }
            setBackups([newBackup, ...backups])
            setLoading(false)
        }, 2000)
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Database Management</h1>
                    <p className="text-slate-600">Manage your MySQL database and monitor performance</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={testConnection} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Test Connection
                    </Button>
                    <Button onClick={createBackup} disabled={loading}>
                        <Download className="h-4 w-4 mr-2" />
                        Create Backup
                    </Button>
                </div>
            </div>

            {/* Connection Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Connection</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                                </p>
                            </div>
                            <div className={`rounded-full w-12 h-12 flex items-center justify-center ${connectionStatus === 'connected'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                <Database className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Database</p>
                                <p className="text-2xl font-bold text-slate-900">{databaseInfo.name}</p>
                            </div>
                            <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center">
                                <Server className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Size</p>
                                <p className="text-2xl font-bold text-slate-900">{databaseInfo.size}</p>
                            </div>
                            <div className="bg-purple-100 text-purple-800 rounded-full w-12 h-12 flex items-center justify-center">
                                <HardDrive className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Tables</p>
                                <p className="text-2xl font-bold text-slate-900">{databaseInfo.tables}</p>
                            </div>
                            <div className="bg-orange-100 text-orange-800 rounded-full w-12 h-12 flex items-center justify-center">
                                <Table className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="tables" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="tables">Tables</TabsTrigger>
                    <TabsTrigger value="query">Query Builder</TabsTrigger>
                    <TabsTrigger value="backups">Backups</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="tables" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Table className="h-5 w-5" />
                                Database Tables
                            </CardTitle>
                            <CardDescription>Manage and monitor your database tables</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {tables.map((table) => (
                                    <div key={table.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`rounded-full w-10 h-10 flex items-center justify-center ${table.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                <Table className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{table.name}</h3>
                                                <p className="text-sm text-slate-600">
                                                    {table.records} records • {table.size}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={table.status === 'active' ? 'default' : 'secondary'}>
                                                {table.status}
                                            </Badge>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="query" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                SQL Query Builder
                            </CardTitle>
                            <CardDescription>Execute SQL queries and view results</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="query" className="text-sm font-medium">SQL Query</Label>
                                <div className="mt-2">
                                    <textarea
                                        id="query"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
                                        placeholder="Enter your SQL query here..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={executeQuery} disabled={loading}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Execute Query
                                </Button>
                                <Button variant="outline" onClick={() => setQuery('')}>
                                    Clear
                                </Button>
                            </div>

                            {queryResult.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">Query Results</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    {Object.keys(queryResult[0]).map((key) => (
                                                        <th key={key} className="px-4 py-2 text-left font-medium">
                                                            {key}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {queryResult.map((row, index) => (
                                                    <tr key={index} className="border-t">
                                                        {Object.values(row).map((value, i) => (
                                                            <td key={i} className="px-4 py-2">
                                                                {String(value)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="backups" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Database Backups
                            </CardTitle>
                            <CardDescription>Manage your database backups and restore points</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {backups.map((backup) => (
                                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center">
                                                <Download className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{backup.name}</h3>
                                                <p className="text-sm text-slate-600">
                                                    {backup.size} • {backup.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default">{backup.status}</Badge>
                                            <Button variant="outline" size="sm">
                                                <Upload className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Database Analytics
                            </CardTitle>
                            <CardDescription>Monitor database performance and usage statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Performance Metrics</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Query Response Time</span>
                                            <span className="text-sm font-medium">0.15ms</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Connection Pool</span>
                                            <span className="text-sm font-medium">5/10</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "50%" }}></div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Cache Hit Rate</span>
                                            <span className="text-sm font-medium">92%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Recent Activity</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Backup completed</p>
                                                <p className="text-xs text-slate-600">2 minutes ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                                            <Activity className="h-4 w-4 text-blue-600" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Query executed</p>
                                                <p className="text-xs text-slate-600">5 minutes ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Connection restored</p>
                                                <p className="text-xs text-slate-600">10 minutes ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 