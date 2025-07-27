'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  Globe, 
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Provider {
  id: number;
  name: string;
  display_name: string;
  type: string;
  category: string;
  is_active: boolean;
  is_free: boolean;
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  usage_count: number;
  last_used: string;
  health_status: string;
}

interface ProviderStats {
  total: number;
  active: number;
  free: number;
  paid: number;
  local: number;
  cloud: number;
  fallback: number;
  usage_today: number;
  errors_today: number;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchProviders();
    fetchStats();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers');
      const data = await response.json();
      if (data.success) {
        setProviders(data.data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/providers/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProviderStatus = async (providerId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/providers/${providerId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });
      
      if (response.ok) {
        fetchProviders();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'local': return <Server className="h-4 w-4" />;
      case 'cloud': return <Globe className="h-4 w-4" />;
      case 'fallback': return <Shield className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredProviders = providers.filter(provider => 
    selectedType === 'all' || provider.type === selectedType
  );

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
        <h1 className="text-3xl font-bold">Provider Management</h1>
        <Button onClick={() => { fetchProviders(); fetchStats(); }}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} active, {stats.total - stats.active} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Providers</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.free}</div>
              <p className="text-xs text-muted-foreground">
                {stats.paid} paid providers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.usage_today}</div>
              <p className="text-xs text-muted-foreground">
                {stats.errors_today} errors today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((stats.active / stats.total) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.active} of {stats.total} healthy
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Provider Type Filter */}
      <div className="flex space-x-2">
        <Button
          variant={selectedType === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedType('all')}
        >
          All ({providers.length})
        </Button>
        <Button
          variant={selectedType === 'local' ? 'default' : 'outline'}
          onClick={() => setSelectedType('local')}
        >
          Local ({providers.filter(p => p.type === 'local').length})
        </Button>
        <Button
          variant={selectedType === 'cloud' ? 'default' : 'outline'}
          onClick={() => setSelectedType('cloud')}
        >
          Cloud ({providers.filter(p => p.type === 'cloud').length})
        </Button>
        <Button
          variant={selectedType === 'fallback' ? 'default' : 'outline'}
          onClick={() => setSelectedType('fallback')}
        >
          Fallback ({providers.filter(p => p.type === 'fallback').length})
        </Button>
      </div>

      {/* Providers List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Provider List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {filteredProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getProviderIcon(provider.type)}
                      <div>
                        <h3 className="font-semibold">{provider.display_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.category} • {provider.type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getHealthStatusIcon(provider.health_status)}
                          <span className="text-sm">
                            {provider.usage_count} requests
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last used: {new Date(provider.last_used).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={provider.is_free ? 'secondary' : 'default'}>
                          {provider.is_free ? 'Free' : 'Paid'}
                        </Badge>
                        <Badge variant={provider.is_active ? 'default' : 'destructive'}>
                          {provider.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProviderStatus(provider.id, provider.is_active)}
                      >
                        {provider.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Rate Limits */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Rate Limit (per minute)</p>
                      <Progress value={(provider.usage_count % provider.rate_limit_per_minute) / provider.rate_limit_per_minute * 100} className="h-2" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rate Limit (per hour)</p>
                      <Progress value={(provider.usage_count % provider.rate_limit_per_hour) / provider.rate_limit_per_hour * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {providers.filter(p => p.type === 'local').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Local Providers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {providers.filter(p => p.type === 'cloud').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Cloud Providers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {providers.filter(p => p.type === 'fallback').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Fallback Providers</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Most Used Providers</h4>
                  {providers
                    .sort((a, b) => b.usage_count - a.usage_count)
                    .slice(0, 5)
                    .map((provider) => (
                      <div key={provider.id} className="flex items-center justify-between py-2">
                        <span className="text-sm">{provider.display_name}</span>
                        <span className="text-sm font-medium">{provider.usage_count} requests</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getHealthStatusIcon(provider.health_status)}
                      <div>
                        <p className="font-medium">{provider.display_name}</p>
                        <p className="text-sm text-muted-foreground">{provider.type}</p>
                      </div>
                    </div>
                    <Badge variant={
                      provider.health_status === 'healthy' ? 'default' :
                      provider.health_status === 'warning' ? 'secondary' : 'destructive'
                    }>
                      {provider.health_status}
                    </Badge>
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