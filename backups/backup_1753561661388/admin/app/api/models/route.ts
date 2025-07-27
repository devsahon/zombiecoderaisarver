import { NextResponse } from 'next/server';
import { getAIModels } from '@/lib/database';

export async function GET() {
  try {
    const models = await getAIModels();
    return NextResponse.json({ success: true, data: models });
  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
} 