#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const execAsync = promisify(exec);

class BackupScheduler {
  constructor() {
    this.configPath = path.join(process.cwd(), 'data', 'backup-config.json');
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureDirectories();
    this.loadConfig();
  }

  ensureDirectories() {
    if (!fs.existsSync(path.dirname(this.configPath))) {
      fs.mkdirSync(path.dirname(this.configPath), { recursive: true });
    }
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  loadConfig() {
    if (fs.existsSync(this.configPath)) {
      this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } else {
      this.config = {
        schedule: {
          enabled: false,
          time: '12:00',
          timezone: 'Asia/Dhaka'
        }
      };
      this.saveConfig();
    }
  }

  saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup_${Date.now()}`;
    const backupPath = path.join(this.backupDir, backupId);

    console.log(`Starting backup: ${backupId}`);

    try {
      // Create backup directory
      fs.mkdirSync(backupPath, { recursive: true });

      // Backup database
      const dbPath = path.join(process.cwd(), 'data', 'admin.db');
      if (fs.existsSync(dbPath)) {
        const dbBackupPath = path.join(backupPath, 'database');
        fs.mkdirSync(dbBackupPath, { recursive: true });
        fs.copyFileSync(dbPath, path.join(dbBackupPath, 'admin.db'));
        console.log('Database backed up successfully');
      }

      // Backup admin files
      const adminBackupPath = path.join(backupPath, 'admin');
      fs.mkdirSync(adminBackupPath, { recursive: true });

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
      console.log('Admin files backed up successfully');

      // Backup server files
      const serverBackupPath = path.join(backupPath, 'server');
      fs.mkdirSync(serverBackupPath, { recursive: true });

      const serverDir = path.join(process.cwd(), 'sarver');
      if (fs.existsSync(serverDir)) {
        this.copyDirectory(serverDir, serverBackupPath);
        console.log('Server files backed up successfully');
      }

      // Create backup manifest
      const manifest = {
        id: backupId,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
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

      console.log(`Backup completed successfully: ${backupId}`);
      return { success: true, backupId, path: backupPath };

    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, error: error.message };
    }
  }

  copyDirectory(source, destination) {
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

  getFileList(dirPath) {
    const files = [];
    
    const scanDirectory = (currentPath, relativePath = '') => {
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

  async pushToGitHub(backupPath, backupId) {
    try {
      console.log('Pushing backup to GitHub...');
      
      // Check if git is initialized
      const { stdout: gitStatus } = await execAsync('git status');
      
      // Add backup files
      await execAsync(`git add ${backupPath}`);
      
      // Commit
      await execAsync(`git commit -m "Backup: ${backupId} - ${new Date().toISOString()}"`);
      
      // Push
      await execAsync('git push origin main');
      
      console.log('Backup pushed to GitHub successfully');
      return { success: true };
    } catch (error) {
      console.error('GitHub push failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async uploadToGoogleDrive(backupPath, backupId) {
    try {
      console.log('Uploading backup to Google Drive...');
      
      // This would require Google Drive API implementation
      // For now, just log that it would happen
      console.log(`Would upload ${backupPath} to Google Drive with ID ${backupId}`);
      
      return { success: true, message: 'Google Drive upload not implemented yet' };
    } catch (error) {
      console.error('Google Drive upload failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async saveBackupStatus(backupId, type, status, details, fileSize, error) {
    try {
      // This would save to the database
      // For now, just log the status
      console.log(`Backup Status: ${backupId} - ${status} - ${details}`);
      
      const statusLog = {
        backupId,
        type,
        status,
        details,
        fileSize,
        error,
        timestamp: new Date().toISOString()
      };

      const logPath = path.join(this.backupDir, 'backup-status.json');
      let logs = [];
      
      if (fs.existsSync(logPath)) {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      }
      
      logs.push(statusLog);
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
      
    } catch (error) {
      console.error('Error saving backup status:', error);
    }
  }

  startScheduler() {
    if (!this.config.schedule.enabled) {
      console.log('Backup scheduler is disabled');
      return;
    }

    const [hour, minute] = this.config.schedule.time.split(':').map(Number);
    
    // Schedule backup for the specified time daily
    const cronExpression = `${minute} ${hour} * * *`;
    
    console.log(`Starting backup scheduler for daily backup at ${this.config.schedule.time}`);
    
    cron.schedule(cronExpression, async () => {
      console.log('Starting scheduled backup...');
      
      const backupResult = await this.createBackup();
      
      if (backupResult.success) {
        await this.saveBackupStatus(
          backupResult.backupId,
          'local',
          'completed',
          'Scheduled backup completed successfully',
          this.calculateDirectorySize(backupResult.path)
        );

        // Push to GitHub if enabled
        if (this.config.github?.enabled) {
          await this.pushToGitHub(backupResult.path, backupResult.backupId);
        }

        // Upload to Google Drive if enabled
        if (this.config.googleDrive?.enabled) {
          await this.uploadToGoogleDrive(backupResult.path, backupResult.backupId);
        }
      } else {
        await this.saveBackupStatus(
          backupResult.backupId || `backup_${Date.now()}`,
          'local',
          'failed',
          'Scheduled backup failed',
          null,
          backupResult.error
        );
      }
    }, {
      timezone: this.config.schedule.timezone
    });

    console.log('Backup scheduler started successfully');
  }

  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    const calculateSize = (currentPath) => {
      const stats = fs.statSync(currentPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
          calculateSize(path.join(currentPath, file));
        }
      } else {
        totalSize += stats.size;
      }
    };

    calculateSize(dirPath);
    return totalSize;
  }

  async runManualBackup() {
    console.log('Running manual backup...');
    const result = await this.createBackup();
    
    if (result.success) {
      await this.saveBackupStatus(
        result.backupId,
        'local',
        'completed',
        'Manual backup completed successfully',
        this.calculateDirectorySize(result.path)
      );
    } else {
      await this.saveBackupStatus(
        result.backupId || `backup_${Date.now()}`,
        'local',
        'failed',
        'Manual backup failed',
        null,
        result.error
      );
    }
    
    return result;
  }
}

// Create and start the scheduler
const scheduler = new BackupScheduler();

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--manual')) {
  scheduler.runManualBackup().then(result => {
    console.log('Manual backup result:', result);
    process.exit(result.success ? 0 : 1);
  });
} else {
  scheduler.startScheduler();
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('Backup scheduler stopped');
    process.exit(0);
  });
}

module.exports = BackupScheduler; 