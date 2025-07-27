import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDatabase();
    let query = 'SELECT * FROM image_generations';
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
    console.error('Error fetching image generations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch image generations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, width = 512, height = 512, style = 'realistic', provider_id = 16 } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Insert new image generation request
    const result = await db.run(
      'INSERT INTO image_generations (prompt, provider_id, width, height, style, status) VALUES (?, ?, ?, ?, ?, ?)',
      [prompt, provider_id, width, height, style, 'pending']
    );

    // Simulate image generation (in real implementation, this would call the actual provider)
    const generationId = result.lastID;
    
    // Update status to completed after a short delay (simulation)
    setTimeout(async () => {
      try {
        await db.run(
          'UPDATE image_generations SET status = ?, image_url = ?, completed_at = CURRENT_TIMESTAMP, processing_time = ? WHERE id = ?',
          ['completed', `https://example.com/generated/${generationId}.png`, 2000, generationId]
        );
      } catch (error) {
        console.error('Error updating image generation:', error);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      data: {
        id: generationId,
        prompt,
        width,
        height,
        style,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error creating image generation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create image generation' },
      { status: 500 }
    );
  }
} 