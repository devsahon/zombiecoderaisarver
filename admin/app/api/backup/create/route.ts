import { NextResponse } from 'next/server';
import { backupSystem } from '@/lib/backup-system';

export async function POST() {
  try {
    const backupStatus = await backupSystem.createBackup();
    await backupSystem.saveBackupStatus(backupStatus);
    
    return NextResponse.json({ 
      success: true, 
      backup: backupStatus,
      message: 'Backup created successfully' 
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    );
  }
} 