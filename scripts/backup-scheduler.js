#!/usr/bin/env node

const { backupSystem } = require('../lib/backup-system');
const path = require('path');

// Set the working directory to the project root
process.chdir(path.join(__dirname, '..'));

console.log('🚀 Starting Backup Scheduler...');
console.log('📅 Time:', new Date().toLocaleString());
console.log('📍 Working Directory:', process.cwd());

// Start the scheduled backup system
backupSystem.startScheduledBackup();

console.log('✅ Backup scheduler started successfully');
console.log('⏰ Will run at:', backupSystem.getConfig().schedule.time, 'daily');

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n🛑 Backup scheduler stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Backup scheduler stopped');
  process.exit(0);
});

// Log every hour to show the process is still running
setInterval(() => {
  console.log('💓 Backup scheduler heartbeat:', new Date().toLocaleString());
}, 3600000); // Every hour 