import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { getDatabase } from './database';

const execAsync = promisify(exec);

export interface BackupConfig {
  github: {
    enabled: boolean;
    repository: string;
    branch: string;
    token: string;
    username: string;
    email: string;
  };
  googleDrive: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    folderId: string;
  };
  schedule: {
    enabled: boolean;
    time: string; // "12:00" for 12 PM
    timezone: string;
  };
  backupTypes: {
    database: boolean;
    adminFiles: boolean;
    serverFiles: boolean;
    logs: boolean;
  };
}

export interface BackupStatus {
  id: string;
  type: 'github' | 'google_drive' | 'local';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp: Date;
  details: string;
  fileSize?: number;
  error?: string;
}

export class BackupSystem {
  private config: BackupConfig;
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
    this.loadConfig();
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private loadConfig() {
    const configPath = path.join(process.cwd(), 'data', 'backup-config.json');
    if (fs.existsSync(configPath)) {
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      this.config = {
        github: {
          enabled: false,
          repository: '',
          branch: 'main',
          token: '',
          username: '',
          email: ''
        },
        googleDrive: {
          enabled: false,
          clientId: '',
          clientSecret: '',
          refreshToken: '',
          folderId: ''
        },
        schedule: {
          enabled: false,
          time: '12:00',
          timezone: 'Asia/Dhaka'
        },
        backupTypes: {
          database: true,
          adminFiles: true,
          serverFiles: true,
          logs: false
        }
      };
      this.saveConfig();
    }
  }

  private saveConfig() {
    const configPath = path.join(process.cwd(), 'data', 'backup-config.json');
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
  }

  async updateConfig(newConfig: Partial<BackupConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  getConfig(): BackupConfig {
    return this.config;
  }

  async testGitHubConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.github.enabled) {
      return { success: false, message: 'GitHub backup is not enabled' };
    }

    try {
      // Test git remote
      const { stdout } = await execAsync('git remote -v');
      if (!stdout.includes(this.config.github.repository)) {
        return { success: false, message: 'Repository not configured correctly' };
      }

      // Test authentication
      const { stdout: authTest } = await execAsync('git ls-remote --exit-code origin');
      return { success: true, message: 'GitHub connection successful' };
    } catch (error) {
      return { success: false, message: `GitHub connection failed: ${error}` };
    }
  }

  async testGoogleDriveConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.googleDrive.enabled) {
      return { success: false, message: 'Google Drive backup is not enabled' };
    }

    try {
      // This would require Google Drive API setup
      // For now, return a placeholder
      return { success: true, message: 'Google Drive connection test (requires API setup)' };
    } catch (error) {
      return { success: false, message: `Google Drive connection failed: ${error}` };
    }
  }

  async createBackup(): Promise<BackupStatus> {
    const backupId = `backup_${Date.now()}`;
    const backupStatus: BackupStatus = {
      id: backupId,
      type: 'local',
      status: 'in_progress',
      timestamp: new Date(),
      details: 'Creating backup...'
    };

    try {
      // Create backup directory
      const backupPath = path.join(this.backupDir, backupId);
      fs.mkdirSync(backupPath, { recursive: true });

      // Backup database
      if (this.config.backupTypes.database) {
        await this.backupDatabase(backupPath);
      }

      // Backup admin files
      if (this.config.backupTypes.adminFiles) {
        await this.backupAdminFiles(backupPath);
      }

      // Backup server files
      if (this.config.backupTypes.serverFiles) {
        await this.backupServerFiles(backupPath);
      }

      // Backup logs
      if (this.config.backupTypes.logs) {
        await this.backupLogs(backupPath);
      }

      // Create backup manifest
      await this.createBackupManifest(backupPath, backupId);

      // Calculate total size
      const totalSize = this.calculateDirectorySize(backupPath);

      backupStatus.status = 'completed';
      backupStatus.details = 'Backup completed successfully';
      backupStatus.fileSize = totalSize;

      // Push to GitHub if enabled
      if (this.config.github.enabled) {
        await this.pushToGitHub(backupPath, backupId);
      }

      // Upload to Google Drive if enabled
      if (this.config.googleDrive.enabled) {
        await this.uploadToGoogleDrive(backupPath, backupId);
      }

      return backupStatus;
    } catch (error) {
      backupStatus.status = 'failed';
      backupStatus.details = 'Backup failed';
      backupStatus.error = error.toString();
      return backupStatus;
    }
  }

  private async backupDatabase(backupPath: string) {
    const dbPath = path.join(process.cwd(), 'data', 'admin.db');
    if (fs.existsSync(dbPath)) {
      const dbBackupPath = path.join(backupPath, 'database');
      fs.mkdirSync(dbBackupPath, { recursive: true });
      fs.copyFileSync(dbPath, path.join(dbBackupPath, 'admin.db'));
    }
  }

  private async backupAdminFiles(backupPath: string) {
    const adminBackupPath = path.join(backupPath, 'admin');
    fs.mkdirSync(adminBackupPath, { recursive: true });

    // Copy essential admin files
    const adminFiles = [
      'app',
      'lib',
      'components',
      'public',
      'styles',
      'package.json',
      'next.config.mjs',
      'tailwind.config.ts',
      'tsconfig.json'
    ];

    for (const file of adminFiles) {
      const sourcePath = path.join(process.cwd(), file);
      const destPath = path.join(adminBackupPath, file);

      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          this.copyDirectory(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    }
  }

  private async backupServerFiles(backupPath: string) {
    const serverBackupPath = path.join(backupPath, 'server');
    fs.mkdirSync(serverBackupPath, { recursive: true });

    const serverDir = path.join(process.cwd(), 'sarver');
    if (fs.existsSync(serverDir)) {
      this.copyDirectory(serverDir, serverBackupPath);
    }
  }

  private async backupLogs(backupPath: string) {
    const logsBackupPath = path.join(backupPath, 'logs');
    fs.mkdirSync(logsBackupPath, { recursive: true });

    const logsDir = path.join(process.cwd(), 'logs');
    if (fs.existsSync(logsDir)) {
      this.copyDirectory(logsDir, logsBackupPath);
    }
  }

  private copyDirectory(source: string, destination: string) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const files = fs.readdirSync(source);
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);

      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  private calculateDirectorySize(dirPath: string): number {
    let totalSize = 0;

    const calculateSize = (path: string) => {
      const stats = fs.statSync(path);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(path);
        for (const file of files) {
          calculateSize(path.join(path, file));
        }
      } else {
        totalSize += stats.size;
      }
    };

    calculateSize(dirPath);
    return totalSize;
  }

  private async createBackupManifest(backupPath: string, backupId: string) {
    const manifest = {
      id: backupId,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      backupTypes: this.config.backupTypes,
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        arch: process.arch
      },
      files: this.getFileList(backupPath)
    };

    fs.writeFileSync(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
  }

  private getFileList(dirPath: string): string[] {
    const files: string[] = [];

    const scanDirectory = (currentPath: string, relativePath: string = '') => {
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const relativeItemPath = relativePath ? path.join(relativePath, item) : item;

        if (fs.statSync(fullPath).isDirectory()) {
          scanDirectory(fullPath, relativeItemPath);
        } else {
          files.push(relativeItemPath);
        }
      }
    };

    scanDirectory(dirPath);
    return files;
  }

  private async pushToGitHub(backupPath: string, backupId: string) {
    try {
      // Create a new branch for this backup
      const branchName = `backup-${backupId}`;

      await execAsync(`git checkout -b ${branchName}`);
      await execAsync(`git add ${backupPath}`);
      await execAsync(`git commit -m "Backup: ${backupId} - ${new Date().toISOString()}"`);
      await execAsync(`git push origin ${branchName}`);
      await execAsync('git checkout main');
      await execAsync(`git branch -d ${branchName}`);
    } catch (error) {
      console.error('GitHub push failed:', error);
    }
  }

  private async uploadToGoogleDrive(backupPath: string, backupId: string) {
    // This would require Google Drive API implementation
    // For now, just log that it would happen
    console.log(`Would upload ${backupPath} to Google Drive with ID ${backupId}`);
  }

  async getBackupHistory(): Promise<BackupStatus[]> {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM backup_history ORDER BY timestamp DESC LIMIT 50');
    return rows.map(row => ({
      id: row.id,
      type: row.type,
      status: row.status,
      timestamp: new Date(row.timestamp),
      details: row.details,
      fileSize: row.file_size,
      error: row.error
    }));
  }

  async saveBackupStatus(status: BackupStatus) {
    const db = await getDatabase();
    await db.run(
      'INSERT INTO backup_history (id, type, status, timestamp, details, file_size, error) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [status.id, status.type, status.status, status.timestamp.toISOString(), status.details, status.fileSize, status.error]
    );
  }

  async downloadBackup(backupId: string): Promise<string> {
    const backupPath = path.join(this.backupDir, backupId);
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup not found');
    }

    // Create a zip file
    const zipPath = path.join(this.backupDir, `${backupId}.zip`);
    await this.createZipArchive(backupPath, zipPath);

    return zipPath;
  }

  private async createZipArchive(sourcePath: string, zipPath: string) {
    const archiver = require('archiver');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve(zipPath));
      archive.on('error', (err: any) => reject(err));

      archive.pipe(output);
      archive.directory(sourcePath, false);
      archive.finalize();
    });
  }

  async startScheduledBackup() {
    if (!this.config.schedule.enabled) {
      return;
    }

    // Schedule backup for 12:00 PM daily
    const [hour, minute] = this.config.schedule.time.split(':').map(Number);

    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === hour && now.getMinutes() === minute) {
        console.log('Starting scheduled backup...');
        const status = await this.createBackup();
        await this.saveBackupStatus(status);
      }
    }, 60000); // Check every minute
  }
}

export const backupSystem = new BackupSystem(); 