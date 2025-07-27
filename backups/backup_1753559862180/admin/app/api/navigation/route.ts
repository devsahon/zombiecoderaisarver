import { NextResponse } from 'next/server';
import { getNavigationMenu } from '@/lib/database';

export async function GET() {
  try {
    const menu = await getNavigationMenu();
    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation menu' },
      { status: 500 }
    );
  }
} 