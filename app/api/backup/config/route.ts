import { NextRequest, NextResponse } from 'next/server';
import { backupSystem } from '@/lib/backup-system';

export async function GET() {
  try {
    const config = backupSystem.getConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching backup config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch backup configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config: newConfig } = body;

    await backupSystem.updateConfig(newConfig);
    
    return NextResponse.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Error updating backup config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update backup configuration' },
      { status: 500 }
    );
  }
} 