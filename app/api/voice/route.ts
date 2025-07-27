import { NextRequest, NextResponse } from 'next/server';

const VOICE_SERVER_URL = 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, engine } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Forward request to voice server
    const response = await fetch(`${VOICE_SERVER_URL}/api/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: voice || 'default',
        engine: engine || 'coqui'
      })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data,
        message: 'বাংলা টেক্সট স্পিচে রূপান্তরিত হয়েছে'
      });
    } else {
      return NextResponse.json(
        { success: false, error: data.error || 'Voice generation failed' },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('Voice API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Voice server connection failed',
        message: 'ভয়েস সার্ভার সংযোগ ব্যর্থ হয়েছে'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      // Get available voices
      const response = await fetch(`${VOICE_SERVER_URL}/api/voices`);
      const data = await response.json();

      if (response.ok) {
        return NextResponse.json({
          success: true,
          data
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch voices' },
          { status: response.status }
        );
      }
    }

    // Handle different actions
    let endpoint = '';
    let method = 'POST';

    switch (action) {
      case 'pause':
        endpoint = '/api/pause';
        break;
      case 'resume':
        endpoint = '/api/resume';
        break;
      case 'stop':
        endpoint = '/api/stop';
        break;
      case 'status':
        endpoint = '/api/status';
        method = 'GET';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const response = await fetch(`${VOICE_SERVER_URL}${endpoint}`, {
      method
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data
      });
    } else {
      return NextResponse.json(
        { success: false, error: data.error || 'Action failed' },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('Voice API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Voice server connection failed',
        message: 'ভয়েস সার্ভার সংযোগ ব্যর্থ হয়েছে'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { voice } = body;

    if (!voice) {
      return NextResponse.json(
        { success: false, error: 'Voice configuration is required' },
        { status: 400 }
      );
    }

    // Change voice configuration
    const response = await fetch(`${VOICE_SERVER_URL}/api/voice`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voice })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data,
        message: `ভয়েস ${voice} সেট করা হয়েছে`
      });
    } else {
      return NextResponse.json(
        { success: false, error: data.error || 'Voice change failed' },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('Voice API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Voice server connection failed',
        message: 'ভয়েস সার্ভার সংযোগ ব্যর্থ হয়েছে'
      },
      { status: 500 }
    );
  }
} 