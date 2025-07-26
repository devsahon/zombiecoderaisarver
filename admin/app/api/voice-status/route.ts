import { NextResponse } from 'next/server';

interface VoiceServerStatus {
  status: string;
  timestamp: string;
  stats: {
    cpu_usage: number;
    memory_usage: number;
    active_connections: number;
    tts_requests: number;
    stt_requests: number;
  };
  audio_config: {
    volume: number;
    speed: number;
    format: string;
  };
  is_playing: boolean;
  queue_size: number;
}

export async function GET() {
  try {
    const response = await fetch('http://localhost:8001/api/status', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data: VoiceServerStatus = await response.json();
      return NextResponse.json({
        success: true,
        status: data,
        server_online: true,
      });
    } else {
      return NextResponse.json({
        success: false,
        server_online: false,
        error: `HTTP ${response.status}`,
        status: {
          status: 'offline',
          timestamp: new Date().toISOString(),
          stats: {
            cpu_usage: 0,
            memory_usage: 0,
            active_connections: 0,
            tts_requests: 0,
            stt_requests: 0,
          },
          audio_config: {
            volume: 0,
            speed: 0,
            format: 'wav',
          },
          is_playing: false,
          queue_size: 0,
        },
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      server_online: false,
      error: error instanceof Error ? error.message : 'Connection failed',
      status: {
        status: 'offline',
        timestamp: new Date().toISOString(),
        stats: {
          cpu_usage: 0,
          memory_usage: 0,
          active_connections: 0,
          tts_requests: 0,
          stt_requests: 0,
        },
        audio_config: {
          volume: 0,
          speed: 0,
          format: 'wav',
        },
        is_playing: false,
        queue_size: 0,
      },
    });
  }
} 