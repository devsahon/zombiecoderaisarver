import { NextResponse } from 'next/server';
import { backupSystem } from '@/lib/backup-system';

export async function GET() {
  try {
    const result = await backupSystem.testGoogleDriveConnection();
    return NextResponse.json({
      success: true,
      connected: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('Error testing Google Drive connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        connected: false, 
        message: 'Failed to test Google Drive connection' 
      },
      { status: 500 }
    );
  }
} 