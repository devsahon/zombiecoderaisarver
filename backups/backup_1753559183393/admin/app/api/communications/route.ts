import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDatabase();
    let query = 'SELECT * FROM communications';
    const params: any[] = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
    } else if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const communications = await db.all(query, params);

    return NextResponse.json({
      success: true,
      data: communications
    });
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, recipient, subject, content, provider_id } = body;

    if (!type || !recipient || !content) {
      return NextResponse.json(
        { success: false, error: 'Type, recipient, and content are required' },
        { status: 400 }
      );
    }

    if (!['email', 'sms'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be either "email" or "sms"' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Determine provider_id based on type if not provided
    let finalProviderId = provider_id;
    if (!finalProviderId) {
      if (type === 'email') {
        finalProviderId = 29; // Mailgun
      } else {
        finalProviderId = 30; // Twilio SMS
      }
    }

    // Insert new communication request
    const result = await db.run(
      'INSERT INTO communications (type, provider_id, recipient, subject, content, status) VALUES (?, ?, ?, ?, ?, ?)',
      [type, finalProviderId, recipient, subject, content, 'pending']
    );

    // Simulate sending (in real implementation, this would call the actual provider)
    const communicationId = result.lastID;
    
    // Update status to sent after a short delay (simulation)
    setTimeout(async () => {
      try {
        await db.run(
          'UPDATE communications SET status = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['sent', communicationId]
        );

        // Simulate delivery after another delay
        setTimeout(async () => {
          try {
            await db.run(
              'UPDATE communications SET status = ?, delivered_at = CURRENT_TIMESTAMP WHERE id = ?',
              ['delivered', communicationId]
            );
          } catch (error) {
            console.error('Error updating communication delivery:', error);
          }
        }, 3000);
      } catch (error) {
        console.error('Error updating communication sent status:', error);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      data: {
        id: communicationId,
        type,
        recipient,
        subject,
        content,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error creating communication:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create communication' },
      { status: 500 }
    );
  }
} 