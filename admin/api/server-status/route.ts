import { NextResponse } from 'next/server';
import { updateServerStatus, getServerStatus, addServerLog } from '@/lib/database';

interface ServerInfo {
  name: string;
  url: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  responseTime?: number;
  error?: string;
}

const servers: ServerInfo[] = [
  { name: 'Main Server', url: 'http://localhost:8000', port: 8000 },
  { name: 'API Server', url: 'http://localhost:8000', port: 8000 },
  { name: 'Voice Server', url: 'http://localhost:8001', port: 8001 },
  { name: 'AI Server', url: 'http://localhost:8002', port: 8002 },
];

async function checkServerStatus(server: ServerInfo): Promise<ServerInfo> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${server.url}/api/status`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const responseTime = Date.now() - startTime;
      return {
        ...server,
        status: 'online',
        responseTime,
      };
    } else {
      return {
        ...server,
        status: 'error',
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      ...server,
      status: 'offline',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

export async function GET() {
  try {
    const statusPromises = servers.map(checkServerStatus);
    const serverStatuses = await Promise.all(statusPromises);
    
    // Update database with server statuses
    for (const server of serverStatuses) {
      await updateServerStatus(
        server.name,
        server.status,
        server.responseTime,
        server.error
      );
      
      // Log status change
      await addServerLog(
        server.name,
        server.status === 'online' ? 'info' : 'warning',
        `Server status: ${server.status}${server.responseTime ? ` (${server.responseTime}ms)` : ''}`
      );
    }
    
    const onlineServers = serverStatuses.filter(s => s.status === 'online').length;
    const totalServers = servers.length;
    
    return NextResponse.json({
      success: true,
      servers: serverStatuses,
      summary: {
        total: totalServers,
        online: onlineServers,
        offline: totalServers - onlineServers,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Server status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check server status',
        servers: servers.map(s => ({ ...s, status: 'error' as const, error: 'Check failed' })),
      },
      { status: 500 }
    );
  }
} 