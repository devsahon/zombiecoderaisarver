import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

const serverConfigs = [
  { id: 'admin-panel', name: 'Admin Panel', type: 'frontend', url: 'http://localhost:3001', port: 3001 },
  { id: 'personal-agent', name: 'Personal Agent', type: 'ai', url: 'http://localhost:8000', port: 8000 },
  { id: 'main-flask', name: 'Main Flask Server', type: 'backend', url: 'http://localhost:5000', port: 5000 },
  { id: 'voice-server', name: 'Voice Server', type: 'voice', url: 'http://localhost:8001', port: 8001 },
  { id: 'ai-server', name: 'AI Server', type: 'ai', url: 'http://localhost:8002', port: 8002 },
  { id: 'sms-server', name: 'SMS Server', type: 'communication', url: 'http://localhost:8003', port: 8003 },
  { id: 'xampp-apache', name: 'XAMPP Apache', type: 'web', url: 'http://localhost', port: 80 },
  { id: 'xampp-mysql', name: 'XAMPP MySQL', type: 'database', url: 'localhost', port: 3306 }
];

async function checkServerHealth(server: any): Promise<ServerInfo> {
  const startTime = Date.now();
  let status: 'online' | 'offline' | 'starting' | 'stopping' | 'error' = 'offline';
  let health: 'healthy' | 'warning' | 'error' | 'unknown' = 'unknown';
  let responseTime: number | undefined;
  let error: string | undefined;

  try {
    // Check if process is running
    const processCheck = await checkProcessRunning(server);
    
    if (processCheck.running) {
      // Try HTTP health check for web servers
      if (server.type !== 'database') {
        try {
          const response = await fetch(`${server.url}/health`, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            status = 'online';
            health = 'healthy';
            responseTime = Date.now() - startTime;
          } else {
            status = 'error';
            health = 'error';
            error = `HTTP ${response.status}`;
          }
        } catch (httpError) {
          // If HTTP check fails, but process is running, mark as starting
          status = 'starting';
          health = 'warning';
          error = httpError instanceof Error ? httpError.message : 'HTTP check failed';
        }
      } else {
        // For database, just check if process is running
        status = 'online';
        health = 'healthy';
        responseTime = Date.now() - startTime;
      }
    } else {
      status = 'offline';
      health = 'error';
      error = 'Process not running';
    }

    // Get system metrics
    const metrics = await getSystemMetrics();

    return {
      id: server.id,
      name: server.name,
      type: server.type,
      url: server.url,
      port: server.port,
      status,
      health,
      responseTime,
      error,
      lastSeen: new Date().toISOString(),
      uptime: processCheck.uptime,
      ...metrics
    };

  } catch (err) {
    return {
      id: server.id,
      name: server.name,
      type: server.type,
      url: server.url,
      port: server.port,
      status: 'error',
      health: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
      lastSeen: new Date().toISOString()
    };
  }
}

async function checkProcessRunning(server: any) {
  try {
    let processName = '';
    
    switch (server.id) {
      case 'admin-panel':
        processName = 'next dev';
        break;
      case 'personal-agent':
        processName = 'personal_agent_server.py';
        break;
      case 'main-flask':
        processName = 'sarver/app.py';
        break;
      case 'voice-server':
        processName = 'voice_server.py';
        break;
      case 'ai-server':
        processName = 'ai_server.py';
        break;
      case 'sms-server':
        processName = 'sms_server.py';
        break;
      case 'xampp-apache':
        processName = 'httpd';
        break;
      case 'xampp-mysql':
        processName = 'mysqld';
        break;
      default:
        processName = server.name.toLowerCase();
    }

    const { stdout } = await execAsync(`pgrep -f "${processName}"`);
    const pids = stdout.trim().split('\n').filter(pid => pid.length > 0);
    
    if (pids.length > 0) {
      // Get uptime for the first process
      try {
        const { stdout: uptimeOutput } = await execAsync(`ps -o etime= -p ${pids[0]}`);
        return { running: true, uptime: uptimeOutput.trim() };
      } catch {
        return { running: true, uptime: 'Unknown' };
      }
    }
    
    return { running: false, uptime: null };
  } catch {
    return { running: false, uptime: null };
  }
}

async function getSystemMetrics() {
  try {
    const { stdout: cpuOutput } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1");
    const { stdout: memOutput } = await execAsync("free | grep Mem | awk '{printf \"%.1f\", $3/$2 * 100.0}'");
    const { stdout: diskOutput } = await execAsync("df / | tail -1 | awk '{print $5}' | cut -d'%' -f1");
    const { stdout: processOutput } = await execAsync("ps aux | wc -l");
    const { stdout: connectionOutput } = await execAsync("netstat -an | grep ESTABLISHED | wc -l");

    return {
      cpu: parseFloat(cpuOutput.trim()) || 0,
      memory: parseFloat(memOutput.trim()) || 0,
      disk: parseFloat(diskOutput.trim()) || 0,
      network: Math.random() * 100, // Mock network usage
      processes: parseInt(processOutput.trim()) || 0,
      connections: parseInt(connectionOutput.trim()) || 0
    };
  } catch {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: Math.random() * 100,
      processes: Math.floor(Math.random() * 200) + 50,
      connections: Math.floor(Math.random() * 50) + 10
    };
  }
}

export async function GET() {
  try {
    const servers: ServerInfo[] = [];
    
    // Check all servers in parallel
    const serverChecks = serverConfigs.map(server => checkServerHealth(server));
    const results = await Promise.allSettled(serverChecks);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        servers.push(result.value);
      } else {
        // Add error server info
        const server = serverConfigs[index];
        servers.push({
          id: server.id,
          name: server.name,
          type: server.type,
          url: server.url,
          port: server.port,
          status: 'error',
          health: 'error',
          error: result.reason?.message || 'Check failed',
          lastSeen: new Date().toISOString()
        });
      }
    });

    // Calculate overall system status
    const onlineServers = servers.filter(s => s.status === 'online').length;
    const totalServers = servers.length;
    const systemHealth = onlineServers === totalServers ? 'healthy' : 
                        onlineServers > totalServers / 2 ? 'warning' : 'error';

    return NextResponse.json({
      success: true,
      data: {
        servers,
        summary: {
          total: totalServers,
          online: onlineServers,
          offline: totalServers - onlineServers,
          health: systemHealth,
          lastUpdated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error checking server status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check server status',
        message: 'সার্ভার স্ট্যাটাস চেক করতে সমস্যা হয়েছে'
      },
      { status: 500 }
    );
  }
} 