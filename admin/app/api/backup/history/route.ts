import { NextResponse } from 'next/server';
import { backupSystem } from '@/lib/backup-system';

export async function GET() {
  try {
    const history = await backupSystem.getBackupHistory();
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching backup history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch backup history' },
      { status: 500 }
    );
  }
} 