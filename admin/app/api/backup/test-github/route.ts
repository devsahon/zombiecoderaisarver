import { NextResponse } from 'next/server';
import { backupSystem } from '@/lib/backup-system';

export async function GET() {
  try {
    const result = await backupSystem.testGitHubConnection();
    return NextResponse.json({
      success: true,
      connected: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('Error testing GitHub connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        connected: false, 
        message: 'Failed to test GitHub connection' 
      },
      { status: 500 }
    );
  }
} 