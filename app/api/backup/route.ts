import { NextRequest, NextResponse } from 'next/server';
import { backupSystem, BackupConfig } from '@/lib/backup-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'config':
        const config = backupSystem.getConfig();
        return NextResponse.json({ success: true, data: config });

      case 'history':
        const history = await backupSystem.getBackupHistory();
        return NextResponse.json({ success: true, data: history });

      case 'test-github':
        const githubTest = await backupSystem.testGitHubConnection();
        return NextResponse.json({ success: true, data: githubTest });

      case 'test-google-drive':
        const googleTest = await backupSystem.testGoogleDriveConnection();
        return NextResponse.json({ success: true, data: googleTest });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create':
        const backupStatus = await backupSystem.createBackup();
        await backupSystem.saveBackupStatus(backupStatus);
        return NextResponse.json({ success: true, data: backupStatus });

      case 'update-config':
        await backupSystem.updateConfig(data as Partial<BackupConfig>);
        return NextResponse.json({ success: true, message: 'Configuration updated' });

      case 'download':
        const { backupId } = data;
        if (!backupId) {
          return NextResponse.json(
            { success: false, error: 'Backup ID is required' },
            { status: 400 }
          );
        }
        
        const downloadPath = await backupSystem.downloadBackup(backupId);
        return NextResponse.json({ 
          success: true, 
          data: { downloadPath, backupId } 
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 