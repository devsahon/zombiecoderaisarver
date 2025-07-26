import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Static settings data
    const settings = {
      system: {
        name: 'AI Management System',
        version: '1.0.0',
        environment: 'development',
        debug_mode: true
      },
      servers: {
        main_server_port: 8000,
        voice_server_port: 8001,
        ai_server_port: 8002,
        api_server_port: 8000
      },
      voice: {
        default_language: 'bn',
        default_voice: 'female',
        sample_rate: 16000,
        channels: 1
      },
      ai: {
        default_model: 'gpt-3.5-turbo',
        max_tokens: 2048,
        temperature: 0.7
      },
      security: {
        session_timeout: 3600,
        max_login_attempts: 5,
        password_min_length: 8
      }
    };

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    // For now, just return success
    // In production, implement actual settings update
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update setting' },
      { status: 500 }
    );
  }
} 