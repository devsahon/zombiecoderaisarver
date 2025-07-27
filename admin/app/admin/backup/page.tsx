'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  GitBranch, 
  Cloud, 
  Download, 
  Upload, 
  Clock, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface BackupConfig {
  github: {
    enabled: boolean;
    repository: string;
    branch: string;
    token: string;
    username: string;
    email: string;
  };
  googleDrive: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    folderId: string;
  };
  schedule: {
    enabled: boolean;
    time: string;
    timezone: string;
  };
  backupTypes: {
    database: boolean;
    adminFiles: boolean;
    serverFiles: boolean;
    logs: boolean;
  };
}

interface BackupStatus {
  id: string;
  type: 'github' | 'google_drive' | 'local';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: Date;
  details: string;
  fileSize?: number;
  error?: string;
}

export default function BackupPage() {
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gitStatus, setGitStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [googleDriveStatus, setGoogleDriveStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [currentBackup, setCurrentBackup] = useState<BackupStatus | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchBackupHistory();
    checkConnections();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/backup/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching backup config:', error);
    }
  };

  const fetchBackupHistory = async () => {
    try {
      const response = await fetch('/api/backup/history');
      if (response.ok) {
        const data = await response.json();
        setBackupHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching backup history:', error);
    }
  };

  const checkConnections = async () => {
    try {
      // Check GitHub connection
      const gitResponse = await fetch('/api/backup/test-github');
      if (gitResponse.ok) {
        const gitData = await gitResponse.json();
        setGitStatus(gitData);
      }

      // Check Google Drive connection
      const gdriveResponse = await fetch('/api/backup/test-google-drive');
      if (gdriveResponse.ok) {
        const gdriveData = await gdriveResponse.json();
        setGoogleDriveStatus(gdriveData);
      }
    } catch (error) {
      console.error('Error checking connections:', error);
    }
  };

  const updateConfig = async (newConfig: Partial<BackupConfig>) => {
    try {
      const response = await fetch('/api/backup/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig })
      });

      if (response.ok) {
        await fetchConfig();
      }
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const createBackup = async () => {
    setIsLoading(true);
    setCurrentBackup({
      id: `backup_${Date.now()}`,
      type: 'local',
      status: 'in_progress',
      timestamp: new Date(),
      details: 'Creating backup...'
    });

    try {
      const response = await fetch('/api/backup/create', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setCurrentBackup(data.backup);
        await fetchBackupHistory();
      } else {
        setCurrentBackup({
          id: `backup_${Date.now()}`,
          type: 'local',
          status: 'failed',
          timestamp: new Date(),
          details: 'Backup failed',
          error: data.error
        });
      }
    } catch (error) {
      setCurrentBackup({
        id: `backup_${Date.now()}`,
        type: 'local',
        status: 'failed',
        timestamp: new Date(),
        details: 'Backup failed',
        error: error.toString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/backup/download/${backupId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${backupId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (!config) {
    return <div className="p-6">Loading backup configuration...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup Management</h1>
          <p className="text-muted-foreground">
            Manage system backups, Git integration, and cloud storage
          </p>
        </div>
        <Button onClick={createBackup} disabled={isLoading}>
          <Upload className="h-4 w-4 mr-2" />
          Create Backup
        </Button>
      </div>

      {currentBackup && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {currentBackup.details}
            {currentBackup.status === 'in_progress' && (
              <Progress value={50} className="mt-2" />
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="history">Backup History</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GitHub Status</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {gitStatus?.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {gitStatus?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {gitStatus?.message}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Google Drive Status</CardTitle>
                <Cloud className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {googleDriveStatus?.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {googleDriveStatus?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {googleDriveStatus?.message}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Backup</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {config.schedule.enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {config.schedule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.schedule.enabled ? `Daily at ${config.schedule.time}` : 'No schedule set'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Backup Types</CardTitle>
              <CardDescription>
                Select what to include in backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.backupTypes.database}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        backupTypes: { ...config.backupTypes, database: checked }
                      })
                    }
                  />
                  <Label>Database</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.backupTypes.adminFiles}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        backupTypes: { ...config.backupTypes, adminFiles: checked }
                      })
                    }
                  />
                  <Label>Admin Files</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.backupTypes.serverFiles}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        backupTypes: { ...config.backupTypes, serverFiles: checked }
                      })
                    }
                  />
                  <Label>Server Files</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.backupTypes.logs}
                    onCheckedChange={(checked) =>
                      updateConfig({
                        backupTypes: { ...config.backupTypes, logs: checked }
                      })
                    }
                  />
                  <Label>Logs</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Configuration</CardTitle>
              <CardDescription>
                Configure Git repository for backup storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.github.enabled}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      github: { ...config.github, enabled: checked }
                    })
                  }
                />
                <Label>Enable GitHub Backup</Label>
              </div>

              {config.github.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="github-repo">Repository URL</Label>
                    <Input
                      id="github-repo"
                      value={config.github.repository}
                      onChange={(e) =>
                        updateConfig({
                          github: { ...config.github, repository: e.target.value }
                        })
                      }
                      placeholder="https://github.com/username/repository"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="github-branch">Branch</Label>
                      <Input
                        id="github-branch"
                        value={config.github.branch}
                        onChange={(e) =>
                          updateConfig({
                            github: { ...config.github, branch: e.target.value }
                          })
                        }
                        placeholder="main"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github-token">Access Token</Label>
                      <Input
                        id="github-token"
                        type="password"
                        value={config.github.token}
                        onChange={(e) =>
                          updateConfig({
                            github: { ...config.github, token: e.target.value }
                          })
                        }
                        placeholder="GitHub Personal Access Token"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="github-username">Username</Label>
                      <Input
                        id="github-username"
                        value={config.github.username}
                        onChange={(e) =>
                          updateConfig({
                            github: { ...config.github, username: e.target.value }
                          })
                        }
                        placeholder="GitHub Username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github-email">Email</Label>
                      <Input
                        id="github-email"
                        type="email"
                        value={config.github.email}
                        onChange={(e) =>
                          updateConfig({
                            github: { ...config.github, email: e.target.value }
                          })
                        }
                        placeholder="GitHub Email"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google Drive Configuration</CardTitle>
              <CardDescription>
                Configure Google Drive for cloud backup storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.googleDrive.enabled}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      googleDrive: { ...config.googleDrive, enabled: checked }
                    })
                  }
                />
                <Label>Enable Google Drive Backup</Label>
              </div>

              {config.googleDrive.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gdrive-client-id">Client ID</Label>
                      <Input
                        id="gdrive-client-id"
                        value={config.googleDrive.clientId}
                        onChange={(e) =>
                          updateConfig({
                            googleDrive: { ...config.googleDrive, clientId: e.target.value }
                          })
                        }
                        placeholder="Google Drive Client ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gdrive-client-secret">Client Secret</Label>
                      <Input
                        id="gdrive-client-secret"
                        type="password"
                        value={config.googleDrive.clientSecret}
                        onChange={(e) =>
                          updateConfig({
                            googleDrive: { ...config.googleDrive, clientSecret: e.target.value }
                          })
                        }
                        placeholder="Google Drive Client Secret"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gdrive-refresh-token">Refresh Token</Label>
                      <Input
                        id="gdrive-refresh-token"
                        type="password"
                        value={config.googleDrive.refreshToken}
                        onChange={(e) =>
                          updateConfig({
                            googleDrive: { ...config.googleDrive, refreshToken: e.target.value }
                          })
                        }
                        placeholder="Google Drive Refresh Token"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gdrive-folder-id">Folder ID</Label>
                      <Input
                        id="gdrive-folder-id"
                        value={config.googleDrive.folderId}
                        onChange={(e) =>
                          updateConfig({
                            googleDrive: { ...config.googleDrive, folderId: e.target.value }
                          })
                        }
                        placeholder="Google Drive Folder ID"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule Configuration</CardTitle>
              <CardDescription>
                Configure automatic backup scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.schedule.enabled}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      schedule: { ...config.schedule, enabled: checked }
                    })
                  }
                />
                <Label>Enable Scheduled Backup</Label>
              </div>

              {config.schedule.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule-time">Backup Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={config.schedule.time}
                      onChange={(e) =>
                        updateConfig({
                          schedule: { ...config.schedule, time: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule-timezone">Timezone</Label>
                    <Input
                      id="schedule-timezone"
                      value={config.schedule.timezone}
                      onChange={(e) =>
                        updateConfig({
                          schedule: { ...config.schedule, timezone: e.target.value }
                        })
                      }
                      placeholder="Asia/Dhaka"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>
                Recent backup operations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No backup history available
                  </p>
                ) : (
                  backupHistory.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(backup.status)}
                        <div>
                          <p className="font-medium">{backup.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(backup.timestamp).toLocaleString()}
                          </p>
                          <p className="text-sm">{backup.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'}>
                          {backup.type}
                        </Badge>
                        {backup.fileSize && (
                          <span className="text-sm text-muted-foreground">
                            {formatFileSize(backup.fileSize)}
                          </span>
                        )}
                        {backup.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBackup(backup.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                Test and monitor backup service connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <GitBranch className="h-5 w-5" />
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-sm text-muted-foreground">
                      {gitStatus?.message || 'Not tested'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {gitStatus?.connected ? (
                    <Badge variant="default">Connected</Badge>
                  ) : (
                    <Badge variant="destructive">Disconnected</Badge>
                  )}
                  <Button size="sm" variant="outline" onClick={checkConnections}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Cloud className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Google Drive</p>
                    <p className="text-sm text-muted-foreground">
                      {googleDriveStatus?.message || 'Not tested'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {googleDriveStatus?.connected ? (
                    <Badge variant="default">Connected</Badge>
                  ) : (
                    <Badge variant="destructive">Disconnected</Badge>
                  )}
                  <Button size="sm" variant="outline" onClick={checkConnections}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 