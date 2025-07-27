import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ServerConfig {
  id: string;
  name: string;
  type: string;
  startCommand: string;
  stopCommand: string;
  restartCommand: string;
  healthCheck: string;
}

const serverConfigs: ServerConfig[] = [
  {
    id: 'admin-panel',
    name: 'Admin Panel',
    type: 'frontend',
    startCommand: 'cd /home/sahon/Desktop/admin && npm run dev',
    stopCommand: 'pkill -f "next dev"',
    restartCommand: 'pkill -f "next dev" && sleep 2 && cd /home/sahon/Desktop/admin && npm run dev',
    healthCheck: 'http://localhost:3001'
  },
  {
    id: 'personal-agent',
    name: 'Personal Agent',
    type: 'ai',
    startCommand: 'cd /home/sahon/Desktop/admin && source .venv/bin/activate && python personal_agent_server.py',
    stopCommand: 'pkill -f "python personal_agent_server.py"',
    restartCommand: 'pkill -f "python personal_agent_server.py" && sleep 2 && cd /home/sahon/Desktop/admin && source .venv/bin/activate && python personal_agent_server.py',
    healthCheck: 'http://localhost:8000/health'
  },
  {
    id: 'main-flask',
    name: 'Main Flask Server',
    type: 'backend',
    startCommand: 'cd /home/sahon/Desktop/admin && source .venv/bin/activate && python sarver/app.py',
    stopCommand: 'pkill -f "python sarver/app.py"',
    restartCommand: 'pkill -f "python sarver/app.py" && sleep 2 && cd /home/sahon/Desktop/admin && source .venv/bin/activate && python sarver/app.py',
    healthCheck: 'http://localhost:5000/health'
  },
  {
    id: 'voice-server',
    name: 'Voice Server',
    type: 'voice',
    startCommand: 'cd /home/sahon/Desktop/admin && source .venv/bin/activate && python sarver/voice_server.py',
    stopCommand: 'pkill -f "python sarver/voice_server.py"',
    restartCommand: 'pkill -f "python sarver/voice_server.py" && sleep 2 && cd /home/sahon/Desktop/admin && source .venv/bin/activate && python sarver/voice_server.py',
    healthCheck: 'http://localhost:8001/health'
  },
  {
    id: 'ai-server',
    name: 'AI Server',
    type: 'ai',
    startCommand: 'cd /home/sahon/Desktop/admin && source .venv/bin/activate && python sarver/ai_server.py',
    stopCommand: 'pkill -f "python sarver/ai_server.py"',
    restartCommand: 'pkill -f "python sarver/ai_server.py" && sleep 2 && cd /home/sahon/Desktop/admin && source .venv/bin/activate && python sarver/ai_server.py',
    healthCheck: 'http://localhost:8002/health'
  },
  {
    id: 'sms-server',
    name: 'SMS Server',
    type: 'communication',
    startCommand: 'cd /home/sahon/Desktop/admin && source .venv/bin/activate && python sarver/sms_server.py',
    stopCommand: 'pkill -f "python sarver/sms_server.py"',
    restartCommand: 'pkill -f "python sarver/sms_server.py" && sleep 2 && cd /home/sahon/Desktop/admin && source .venv/bin/activate && python sarver/sms_server.py',
    healthCheck: 'http://localhost:8003/health'
  },
  {
    id: 'xampp-apache',
    name: 'XAMPP Apache',
    type: 'web',
    startCommand: 'sudo /opt/lampp/lampp startapache',
    stopCommand: 'sudo /opt/lampp/lampp stopapache',
    restartCommand: 'sudo /opt/lampp/lampp restartapache',
    healthCheck: 'http://localhost'
  },
  {
    id: 'xampp-mysql',
    name: 'XAMPP MySQL',
    type: 'database',
    startCommand: 'sudo /opt/lampp/lampp startmysql',
    stopCommand: 'sudo /opt/lampp/lampp stopmysql',
    restartCommand: 'sudo /opt/lampp/lampp restartmysql',
    healthCheck: 'localhost:3306'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { serverId, action } = await request.json();

    if (!serverId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server ID and action are required',
          message: 'সার্ভার আইডি এবং অ্যাকশন প্রয়োজন'
        },
        { status: 400 }
      );
    }

    const serverConfig = serverConfigs.find(config => config.id === serverId);
    if (!serverConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server not found',
          message: 'সার্ভার পাওয়া যায়নি'
        },
        { status: 404 }
      );
    }

    let command: string;
    switch (action) {
      case 'start':
        command = serverConfig.startCommand;
        break;
      case 'stop':
        command = serverConfig.stopCommand;
        break;
      case 'restart':
        command = serverConfig.restartCommand;
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            message: 'অবৈধ অ্যাকশন'
          },
          { status: 400 }
        );
    }

    console.log(`Executing command for ${serverConfig.name}: ${command}`);

    // Execute the command
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
      cwd: '/home/sahon/Desktop/admin'
    });

    if (stderr && !stderr.includes('WARNING')) {
      console.error(`Error executing command: ${stderr}`);
      return NextResponse.json(
        {
          success: false,
          error: stderr,
          message: 'কমান্ড এক্সিকিউট করতে সমস্যা'
        },
        { status: 500 }
      );
    }

    // Wait a bit for the server to start/stop
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check server health
    let healthStatus = 'unknown';
    try {
      const healthResponse = await fetch(serverConfig.healthCheck, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      healthStatus = healthResponse.ok ? 'healthy' : 'error';
    } catch (error) {
      healthStatus = 'error';
    }

    return NextResponse.json({
      success: true,
      data: {
        serverId,
        action,
        status: action === 'stop' ? 'offline' : healthStatus === 'healthy' ? 'online' : 'error',
        health: healthStatus,
        message: `${serverConfig.name} ${action}ed successfully`,
        output: stdout,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Server control error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'সার্ভার কন্ট্রোলে সমস্যা'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get status of all servers
    const serverStatuses = await Promise.all(
      serverConfigs.map(async (config) => {
        try {
          const response = await fetch(config.healthCheck, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
          });
          
          return {
            id: config.id,
            name: config.name,
            type: config.type,
            status: response.ok ? 'online' : 'error',
            health: response.ok ? 'healthy' : 'error',
            lastChecked: new Date().toISOString()
          };
        } catch (error) {
          return {
            id: config.id,
            name: config.name,
            type: config.type,
            status: 'offline',
            health: 'error',
            lastChecked: new Date().toISOString()
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: serverStatuses
    });

  } catch (error) {
    console.error('Error getting server statuses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get server statuses',
        message: 'সার্ভার স্ট্যাটাস পাওয়া যায়নি'
      },
      { status: 500 }
    );
  }
} 