import { NextResponse } from 'next/server';
import { getStorageValue, setStorageValue, deleteStorageValue } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    if (key) {
      const value = await getStorageValue(key);
      return NextResponse.json({
        success: true,
        data: value
      });
    }

    // For now, return empty array for list requests
    // In production, implement pagination and filtering
    return NextResponse.json({
      success: true,
      data: [],
      count: 0
    });
  } catch (error) {
    console.error('Storage API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch storage data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { key, value, type, userId, agentId, ttl } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    await setStorageValue(key, value, type, userId, agentId, ttl);

    return NextResponse.json({
      success: true,
      message: 'Storage value set successfully'
    });
  } catch (error) {
    console.error('Storage set error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set storage value' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Key is required' },
        { status: 400 }
      );
    }

    await deleteStorageValue(key);

    return NextResponse.json({
      success: true,
      message: 'Storage value deleted successfully'
    });
  } catch (error) {
    console.error('Storage delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete storage value' },
      { status: 500 }
    );
  }
} 