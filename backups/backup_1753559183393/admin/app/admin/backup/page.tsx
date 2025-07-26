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
import { 
  Github, 
  Cloud, 
  Download, 
  Upload, 
  Settings, 
  Clock, 
  Database, 
  Server, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
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
  const [loading, setLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [githubTest, setGithubTest] = useState<{ success: boolean; message: string } | null>(null);
  const [googleTest, setGoogleTest] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadBackupData();
  }, []);

  const loadBackupData = async () => {
    setLoading(true);
    try {
      const [configRes, historyRes] = await Promise.all([
        fetch('/api/backup?action=config'),
        fetch('/api/backup?action=history')
      ]);

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData.data);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setBackupHistory(historyData.data);
      }
    } catch (error) {
      console.error('Error loading backup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<BackupConfig>) => {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-config', ...newConfig })
      });

      if (response.ok) {
        await loadBackupData();
      }
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const createBackup = async () => {
    setCreatingBackup(true);
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
      });

      if (response.ok) {
        await loadBackupData();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const testGitHubConnection = async () => {
    try {
      const response = await fetch('/api/backup?action=test-github');
      if (response.ok) {
        const data = await response.json();
        setGithubTest(data.data);
      }
    } catch (error) {
      console.error('Error testing GitHub connection:', error);
    }
  };

  const testGoogleDriveConnection = async () => {
    try {
      const response = await fetch('/api/backup?action=test-google-drive');
      if (response.ok) {
        const data = await response.json();
        setGoogleTest(data.data);
      }
    } catch (error) {
      console.error('Error testing Google Drive connection:', error);
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download', backupId })
      });

      if (response.ok) {
        const data = await response.json();
        // In a real implementation, this would trigger a file download
        console.log('Download path:', data.data.downloadPath);
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup Management</h1>
          <p className="text-muted-foreground">
            Manage automated backups, GitHub integration, and Google Drive storage
          </p>
        </div>
        <Button onClick={createBackup} disabled={creatingBackup}>
          {creatingBackup ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Backup...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Create Backup
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="github">GitHub Integration</TabsTrigger>
          <TabsTrigger value="google-drive">Google Drive</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GitHub Status</CardTitle>
                <Github className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {config?.github.enabled ? 'Connected' : 'Disconnected'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {config?.github.repository || 'No repository configured'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Google Drive</CardTitle>
                <Cloud className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {config?.googleDrive.enabled ? 'Connected' : 'Disconnected'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {config?.googleDrive.folderId ? 'Folder configured' : 'No folder configured'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto Backup</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {config?.schedule.enabled ? 'Enabled' : 'Disabled'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {config?.schedule.time || '12:00'} daily
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{backupHistory.length}</div>
                <p className="text-xs text-muted-foreground">
                  {backupHistory.filter(b => b.status === 'completed').length} successful
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Backup Types</CardTitle>
              <CardDescription>
                Select what to include in automated backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <Label htmlFor="database-backup">Database</Label>
                </div>
                <Switch
                  id="database-backup"
                  checked={config?.backupTypes.database}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      backupTypes: { ...config!.backupTypes, database: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <Label htmlFor="admin-files-backup">Admin Files</Label>
                </div>
                <Switch
                  id="admin-files-backup"
                  checked={config?.backupTypes.adminFiles}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      backupTypes: { ...config!.backupTypes, adminFiles: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <Label htmlFor="server-files-backup">Server Files</Label>
                </div>
                <Switch
                  id="server-files-backup"
                  checked={config?.backupTypes.serverFiles}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      backupTypes: { ...config!.backupTypes, serverFiles: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <Label htmlFor="logs-backup">Logs</Label>
                </div>
                <Switch
                  id="logs-backup"
                  checked={config?.backupTypes.logs}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      backupTypes: { ...config!.backupTypes, logs: checked }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="github" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Connect to GitHub for automated repository backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="github-enabled">Enable GitHub Backup</Label>
                <Switch
                  id="github-enabled"
                  checked={config?.github.enabled}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      github: { ...config!.github, enabled: checked }
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github-repo">Repository URL</Label>
                  <Input
                    id="github-repo"
                    placeholder="https://github.com/username/repo"
                    value={config?.github.repository}
                    onChange={(e) =>
                      updateConfig({
                        github: { ...config!.github, repository: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github-branch">Branch</Label>
                  <Input
                    id="github-branch"
                    placeholder="main"
                    value={config?.github.branch}
                    onChange={(e) =>
                      updateConfig({
                        github: { ...config!.github, branch: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github-token">Access Token</Label>
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_..."
                    value={config?.github.token}
                    onChange={(e) =>
                      updateConfig({
                        github: { ...config!.github, token: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github-username">Username</Label>
                  <Input
                    id="github-username"
                    placeholder="your-username"
                    value={config?.github.username}
                    onChange={(e) =>
                      updateConfig({
                        github: { ...config!.github, username: e.target.value }
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button onClick={testGitHubConnection}>
                  Test Connection
                </Button>
                {githubTest && (
                  <Alert className={githubTest.success ? 'border-green-500' : 'border-red-500'}>
                    <AlertDescription>{githubTest.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google-drive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Drive Integration</CardTitle>
              <CardDescription>
                Connect to Google Drive for cloud storage backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="google-enabled">Enable Google Drive Backup</Label>
                <Switch
                  id="google-enabled"
                  checked={config?.googleDrive.enabled}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      googleDrive: { ...config!.googleDrive, enabled: checked }
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="google-client-id">Client ID</Label>
                  <Input
                    id="google-client-id"
                    placeholder="your-client-id.apps.googleusercontent.com"
                    value={config?.googleDrive.clientId}
                    onChange={(e) =>
                      updateConfig({
                        googleDrive: { ...config!.googleDrive, clientId: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-client-secret">Client Secret</Label>
                  <Input
                    id="google-client-secret"
                    type="password"
                    placeholder="GOCSPX-..."
                    value={config?.googleDrive.clientSecret}
                    onChange={(e) =>
                      updateConfig({
                        googleDrive: { ...config!.googleDrive, clientSecret: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-refresh-token">Refresh Token</Label>
                  <Input
                    id="google-refresh-token"
                    type="password"
                    placeholder="1//..."
                    value={config?.googleDrive.refreshToken}
                    onChange={(e) =>
                      updateConfig({
                        googleDrive: { ...config!.googleDrive, refreshToken: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-folder-id">Folder ID</Label>
                  <Input
                    id="google-folder-id"
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    value={config?.googleDrive.folderId}
                    onChange={(e) =>
                      updateConfig({
                        googleDrive: { ...config!.googleDrive, folderId: e.target.value }
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button onClick={testGoogleDriveConnection}>
                  Test Connection
                </Button>
                {googleTest && (
                  <Alert className={googleTest.success ? 'border-green-500' : 'border-red-500'}>
                    <AlertDescription>{googleTest.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Backup Schedule</CardTitle>
              <CardDescription>
                Configure automatic daily backups at 12:00 PM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="schedule-enabled">Enable Automated Backups</Label>
                <Switch
                  id="schedule-enabled"
                  checked={config?.schedule.enabled}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      schedule: { ...config!.schedule, enabled: checked }
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-time">Backup Time</Label>
                  <Input
                    id="backup-time"
                    type="time"
                    value={config?.schedule.time}
                    onChange={(e) =>
                      updateConfig({
                        schedule: { ...config!.schedule, time: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    placeholder="Asia/Dhaka"
                    value={config?.schedule.timezone}
                    onChange={(e) =>
                      updateConfig({
                        schedule: { ...config!.schedule, timezone: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>
                View recent backup operations and download files
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
                          <p className="text-sm text-muted-foreground">
                            {backup.details}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(backup.status)}
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
      </Tabs>
    </div>
  );
} 