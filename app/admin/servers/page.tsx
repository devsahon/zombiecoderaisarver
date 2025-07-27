'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Play, 
  Square, 
  RotateCcw, 
  Activity, 
  Cpu,
  HardDrive,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Brain,
  Gauge,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface ServerInfo {
  id: string;
  name: string;
  type: string;
  url: string;
  port: number;
  status: 'online' | 'offline' | 'starting' | 'stopping' | 'error';
  health: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime?: number;
  error?: string;
  lastSeen?: string;
  uptime?: string;
  cpu?: number;
  memory?: number;
  disk?: number;
  network?: number;
  processes?: number;
  connections?: number;
}

interface OptimizerAgent {
  status: 'active' | 'inactive' | 'optimizing';
  lastOptimization?: string;
  optimizations: Optimization[];
  recommendations: Recommendation[];
}

interface Optimization {
  id: string;
  server: string;
  type: 'performance' | 'memory' | 'network' | 'security';
  description: string;
  impact: 'high' | 'medium' | 'low';
  applied: boolean;
  timestamp: string;
}

interface Recommendation {
  id: string;
  server: string;
  type: 'performance' | 'memory' | 'network' | 'security';
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  estimatedImpact: string;
}

export default function ServersPage() {
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [optimizerAgent, setOptimizerAgent] = useState<OptimizerAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Define all servers
  const allServers: ServerInfo[] = [
    {
      id: 'admin-panel',
      name: 'Admin Panel',
      type: 'frontend',
      url: 'http://localhost:3001',
      port: 3001,
      status: 'offline',
      health: 'unknown'
    },
    {
      id: 'personal-agent',
      name: 'Personal Agent',
      type: 'ai',
      url: 'http://localhost:8000',
      port: 8000,
      status: 'offline',
      health: 'unknown'
    },
    {
      id: 'main-flask',
      name: 'Main Flask Server',
      type: 'backend',
      url: 'http://localhost:5000',
      port: 5000,
      status: 'offline',
      health: 'unknown'
    },
    {
      id: 'voice-server',
      name: 'Voice Server',
      type: 'voice',
      url: 'http://localhost:8001',
      port: 8001,
      status: 'offline',
      health: 'unknown'
    },
    {
      id: 'ai-server',
      name: 'AI Server',
      type: 'ai',
      url: 'http://localhost:8002',
      port: 8002,
      status: 'offline',
      health: 'unknown'
    },
    {
      id: 'sms-server',
      name: 'SMS Server',
      type: 'communication',
      url: 'http://localhost:8003',
      port: 8003,
      status: 'offline',
      health: 'unknown'
    },
    {
      id: 'xampp-apache',
      name: 'XAMPP Apache',
      type: 'web',
      url: 'http://localhost',
      port: 80,
      status: 'offline',
      health: 'unknown'
    },
    {
      id: 'xampp-mysql',
      name: 'XAMPP MySQL',
      type: 'database',
      url: 'localhost',
      port: 3306,
      status: 'offline',
      health: 'unknown'
    }
  ];

  useEffect(() => {
    fetchServerStatus();
    fetchOptimizerAgent();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchServerStatus();
        fetchOptimizerAgent();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchServerStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/servers/status');
      const data = await response.json();
      
      if (data.success) {
        setServers(data.data.servers);
      } else {
        console.error('Failed to fetch server status:', data.error);
      }
    } catch (error) {
      console.error('Error fetching server status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizerAgent = async () => {
    try {
      const response = await fetch('/api/optimizer-agent/status');
      if (response.ok) {
        const data = await response.json();
        setOptimizerAgent(data.data);
      } else {
        // Mock data for now
        setOptimizerAgent({
          status: 'active',
          lastOptimization: new Date().toISOString(),
          optimizations: [
            {
              id: '1',
              server: 'personal-agent',
              type: 'performance',
              description: 'Optimized memory usage by 15%',
              impact: 'high',
              applied: true,
              timestamp: new Date().toISOString()
            }
          ],
          recommendations: [
            {
              id: '1',
              server: 'main-flask',
              type: 'performance',
              description: 'High CPU usage detected',
              priority: 'high',
              action: 'Restart server to clear memory',
              estimatedImpact: 'Reduce CPU usage by 30%'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching optimizer agent:', error);
    }
  };

  const controlServer = async (serverId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const server = servers.find(s => s.id === serverId);
      if (!server) return;

      // Update server status immediately
      setServers(prev => prev.map(s => 
        s.id === serverId 
          ? { ...s, status: action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'starting' }
          : s
      ));

      const response = await fetch('/api/servers/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, action })
      });

      if (response.ok) {
        // Refresh status after a delay
        setTimeout(() => {
          fetchServerStatus();
        }, 2000);
      } else {
        // Revert status on error
        setServers(prev => prev.map(s => 
          s.id === serverId 
            ? { ...s, status: 'error' as const, error: 'Control action failed' }
            : s
        ));
      }
    } catch (error) {
      console.error(`Error ${action}ing server:`, error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'starting': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'stopping': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getServerIcon = (type: string) => {
    switch (type) {
      case 'frontend': return <Server className="h-4 w-4" />;
      case 'backend': return <Cpu className="h-4 w-4" />;
      case 'ai': return <Brain className="h-4 w-4" />;
      case 'database': return <HardDrive className="h-4 w-4" />;
      case 'web': return <Activity className="h-4 w-4" />;
      case 'voice': return <Zap className="h-4 w-4" />;
      case 'communication': return <Activity className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const onlineServers = servers.filter(s => s.status === 'online').length;
  const totalServers = servers.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Server Management</h1>
        <div className="flex items-center space-x-4">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button onClick={fetchServerStatus}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Server Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServers}</div>
            <p className="text-xs text-muted-foreground">
              {onlineServers} online, {totalServers - onlineServers} offline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Servers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineServers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((onlineServers / totalServers) * 100)}% uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((onlineServers / totalServers) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {servers.filter(s => s.health === 'healthy').length} healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimizer Agent</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {optimizerAgent?.status === 'active' ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {optimizerAgent?.optimizations.length || 0} optimizations applied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Server Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Server Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="optimizer">Optimizer Agent</TabsTrigger>
          <TabsTrigger value="logs">Server Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {servers.map((server) => (
              <Card key={server.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getServerIcon(server.type)}
                      <div>
                        <h3 className="font-semibold">{server.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {server.type} • {server.url}:{server.port}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(server.status)}
                          {getHealthIcon(server.health)}
                          <span className="text-sm">
                            {server.responseTime ? `${server.responseTime}ms` : 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {server.lastSeen ? new Date(server.lastSeen).toLocaleTimeString() : 'Never'}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          server.status === 'online' ? 'default' :
                          server.status === 'starting' || server.status === 'stopping' ? 'secondary' :
                          'destructive'
                        }>
                          {server.status}
                        </Badge>
                        <Badge variant={
                          server.health === 'healthy' ? 'default' :
                          server.health === 'warning' ? 'secondary' : 'destructive'
                        }>
                          {server.health}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => controlServer(server.id, 'start')}
                          disabled={server.status === 'online' || server.status === 'starting'}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => controlServer(server.id, 'stop')}
                          disabled={server.status === 'offline' || server.status === 'stopping'}
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => controlServer(server.id, 'restart')}
                          disabled={server.status === 'offline'}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Server Metrics */}
                  {server.status === 'online' && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">CPU Usage</p>
                        <Progress value={server.cpu || 0} className="h-2" />
                        <p className="text-xs">{Math.round(server.cpu || 0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Memory Usage</p>
                        <Progress value={server.memory || 0} className="h-2" />
                        <p className="text-xs">{Math.round(server.memory || 0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Disk Usage</p>
                        <Progress value={server.disk || 0} className="h-2" />
                        <p className="text-xs">{Math.round(server.disk || 0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Network</p>
                        <Progress value={server.network || 0} className="h-2" />
                        <p className="text-xs">{Math.round(server.network || 0)}%</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Server Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servers.map((server) => (
                  <div key={server.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{server.name}</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(server.status)}
                        <span className="text-sm">{server.status}</span>
                      </div>
                    </div>
                    
                    {server.status === 'online' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <Cpu className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                          <p className="text-sm font-medium">{Math.round(server.cpu || 0)}%</p>
                          <p className="text-xs text-muted-foreground">CPU</p>
                        </div>
                        <div className="text-center">
                          <Activity className="h-6 w-6 mx-auto mb-1 text-green-500" />
                          <p className="text-sm font-medium">{Math.round(server.memory || 0)}%</p>
                          <p className="text-xs text-muted-foreground">Memory</p>
                        </div>
                        <div className="text-center">
                          <HardDrive className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                          <p className="text-sm font-medium">{Math.round(server.disk || 0)}%</p>
                          <p className="text-xs text-muted-foreground">Disk</p>
                        </div>
                        <div className="text-center">
                          <Activity className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                          <p className="text-sm font-medium">{Math.round(server.network || 0)}%</p>
                          <p className="text-xs text-muted-foreground">Network</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Server Optimizer Agent</CardTitle>
            </CardHeader>
            <CardContent>
              {optimizerAgent && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Agent Status</h4>
                      <p className="text-sm text-muted-foreground">
                        Last optimization: {optimizerAgent.lastOptimization ? 
                          new Date(optimizerAgent.lastOptimization).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <Badge variant={optimizerAgent.status === 'active' ? 'default' : 'secondary'}>
                      {optimizerAgent.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Recent Optimizations</h5>
                      <div className="space-y-2">
                        {optimizerAgent.optimizations.map((opt) => (
                          <div key={opt.id} className="border rounded p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{opt.server}</span>
                              <Badge variant={opt.applied ? 'default' : 'secondary'}>
                                {opt.applied ? 'Applied' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Recommendations</h5>
                      <div className="space-y-2">
                        {optimizerAgent.recommendations.map((rec) => (
                          <div key={rec.id} className="border rounded p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{rec.server}</span>
                              <Badge variant={
                                rec.priority === 'critical' ? 'destructive' :
                                rec.priority === 'high' ? 'default' : 'secondary'
                              }>
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{rec.description}</p>
                            <p className="text-xs text-blue-600">{rec.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button>
                      <Brain className="h-4 w-4 mr-2" />
                      Run Optimization
                    </Button>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Agent
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {servers.map((server) => (
                  <div key={server.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{server.name}</h4>
                      <Button variant="outline" size="sm">
                        View Logs
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Status: {server.status}</p>
                      <p>Health: {server.health}</p>
                      {server.error && <p className="text-red-600">Error: {server.error}</p>}
                      <p>Last seen: {server.lastSeen ? new Date(server.lastSeen).toLocaleString() : 'Never'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 