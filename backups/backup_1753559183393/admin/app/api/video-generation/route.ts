import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDatabase();
    let query = 'SELECT * FROM video_generations';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const generations = await db.all(query, params);

    return NextResponse.json({
      success: true,
      data: generations
    });
  } catch (error) {
    console.error('Error fetching video generations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video generations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      duration = 5, 
      fps = 24, 
      resolution = '1920x1080', 
      provider_id = 19 
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Insert new video generation request
    const result = await db.run(
      'INSERT INTO video_generations (prompt, provider_id, duration, fps, resolution, status) VALUES (?, ?, ?, ?, ?, ?)',
      [prompt, provider_id, duration, fps, resolution, 'pending']
    );

    // Simulate video generation (in real implementation, this would call the actual provider)
    const generationId = result.lastID;
    
    // Update status to completed after a longer delay (video generation takes more time)
    setTimeout(async () => {
      try {
        await db.run(
          'UPDATE video_generations SET status = ?, video_url = ?, completed_at = CURRENT_TIMESTAMP, processing_time = ? WHERE id = ?',
          ['completed', `https://example.com/generated/video_${generationId}.mp4`, 15000, generationId]
        );
      } catch (error) {
        console.error('Error updating video generation:', error);
      }
    }, 15000);

    return NextResponse.json({
      success: true,
      data: {
        id: generationId,
        prompt,
        duration,
        fps,
        resolution,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error creating video generation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create video generation' },
      { status: 500 }
    );
  }
} 