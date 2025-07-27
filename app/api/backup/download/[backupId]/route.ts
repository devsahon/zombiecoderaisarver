import { NextRequest, NextResponse } from 'next/server';
import { backupSystem } from '@/lib/backup-system';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { backupId: string } }
) {
  try {
    const { backupId } = params;
    
    // Get the backup file path
    const backupPath = await backupSystem.downloadBackup(backupId);
    
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json(
        { success: false, error: 'Backup file not found' },
        { status: 404 }
      );
    }

    // Read the backup file
    const fileBuffer = fs.readFileSync(backupPath);
    
    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', 'application/zip');
    response.headers.set('Content-Disposition', `attachment; filename="${backupId}.zip"`);
    
    return response;
  } catch (error) {
    console.error('Error downloading backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download backup' },
      { status: 500 }
    );
  }
} 