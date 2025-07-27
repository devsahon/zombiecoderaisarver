import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'admin.db');

    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Initialize database schema
    await initializeDatabase(db);
  }

  return db;
}

async function initializeDatabase(db: Database) {
  const schemaPath = path.join(process.cwd(), 'lib', 'database-schema.sql');

  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.exec(statement);
        } catch (error) {
          console.error('Error executing schema statement:', error);
        }
      }
    }
  }
}

// Server management functions
export async function updateServerStatus(
  name: string,
  status: 'online' | 'offline' | 'error',
  responseTime?: number,
  errorMessage?: string
) {
  const db = await getDatabase();
  await db.run(
    `UPDATE servers SET 
     status = ?, 
     response_time = ?, 
     error_message = ?, 
     last_check = CURRENT_TIMESTAMP,
     updated_at = CURRENT_TIMESTAMP 
     WHERE name = ?`,
    [status, responseTime, errorMessage, name]
  );
}

export async function getServerStatus() {
  const db = await getDatabase();
  return await db.all('SELECT * FROM servers ORDER BY name');
}

export async function addServerLog(
  serverName: string,
  level: 'info' | 'warning' | 'error',
  message: string
) {
  const db = await getDatabase();
  const server = await db.get('SELECT id FROM servers WHERE name = ?', [serverName]);

  if (server) {
    await db.run(
      'INSERT INTO server_logs (server_id, level, message) VALUES (?, ?, ?)',
      [server.id, level, message]
    );
  }
}

export async function addServerMetrics(
  serverName: string,
  cpuUsage: number,
  memoryUsage: number,
  diskUsage: number,
  activeConnections: number,
  requestsPerMinute: number
) {
  const db = await getDatabase();
  const server = await db.get('SELECT id FROM servers WHERE name = ?', [serverName]);

  if (server) {
    await db.run(
      `INSERT INTO server_metrics 
       (server_id, cpu_usage, memory_usage, disk_usage, active_connections, requests_per_minute) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [server.id, cpuUsage, memoryUsage, diskUsage, activeConnections, requestsPerMinute]
    );
  }
}

export async function updateAgentStatus(
  name: string,
  status: 'active' | 'inactive' | 'error',
  memoryUsage?: string,
  lastUsed?: Date
) {
  const db = await getDatabase();
  await db.run(
    `UPDATE agents SET 
     status = ?, 
     memory_usage = ?, 
     last_used = ?, 
     updated_at = CURRENT_TIMESTAMP 
     WHERE name = ?`,
    [status, memoryUsage, lastUsed, name]
  );
}

export async function getAgents() {
  const db = await getDatabase();
  return await db.all('SELECT * FROM agents ORDER BY name');
}

export async function addAgentLog(
  agentName: string,
  action: string,
  message: string,
  processingTime?: number
) {
  const db = await getDatabase();
  const agent = await db.get('SELECT id FROM agents WHERE name = ?', [agentName]);

  if (agent) {
    await db.run(
      'INSERT INTO agent_logs (agent_id, action, message, processing_time) VALUES (?, ?, ?, ?)',
      [agent.id, action, message, processingTime]
    );
  }
}

export async function addVoiceSession(
  sessionId: string,
  userId: string,
  language: string,
  voiceType: string,
  textContent: string,
  audioFilePath?: string
) {
  const db = await getDatabase();
  await db.run(
    `INSERT INTO voice_sessions 
     (session_id, user_id, language, voice_type, text_content, audio_file_path) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sessionId, userId, language, voiceType, textContent, audioFilePath]
  );
}

export async function updateVoiceSession(
  sessionId: string,
  status: 'pending' | 'processing' | 'completed' | 'error',
  processingTime?: number
) {
  const db = await getDatabase();
  await db.run(
    `UPDATE voice_sessions SET 
     status = ?, 
     processing_time = ?, 
     completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END 
     WHERE session_id = ?`,
    [status, processingTime, status, sessionId]
  );
}

export async function addSystemEvent(
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  title: string,
  description: string,
  affectedComponents?: string[]
) {
  const db = await getDatabase();
  await db.run(
    `INSERT INTO system_events 
     (event_type, severity, title, description, affected_components) 
     VALUES (?, ?, ?, ?, ?)`,
    [eventType, severity, title, description, JSON.stringify(affectedComponents)]
  );
}

export async function getRecentLogs(limit: number = 100) {
  const db = await getDatabase();
  return await db.all(`
    SELECT 
      sl.*, s.name as server_name 
    FROM server_logs sl 
    JOIN servers s ON sl.server_id = s.id 
    ORDER BY sl.timestamp DESC 
    LIMIT ?
  `, [limit]);
}

export async function getSystemMetrics(serverName: string, hours: number = 24) {
  const db = await getDatabase();
  return await db.all(`
    SELECT 
      sm.*, s.name as server_name 
    FROM server_metrics sm 
    JOIN servers s ON sm.server_id = s.id 
    WHERE s.name = ? 
    AND sm.timestamp >= datetime('now', '-${hours} hours') 
    ORDER BY sm.timestamp DESC
  `, [serverName]);
}

// Admin authentication functions
export async function authenticateAdmin(username: string, password: string) {
  const db = await getDatabase();

  // For demo purposes, use simple authentication
  // In production, use proper password hashing
  const admin = await db.get(
    'SELECT * FROM admins WHERE username = ? AND password = ?',
    [username, password]
  );

  return admin;
}

export async function getAdminUserById(id: number) {
  const db = await getDatabase();
  return await db.get('SELECT * FROM admins WHERE id = ?', [id]);
}

export async function createAdminUser(
  username: string,
  password: string,
  email: string,
  fullName: string,
  role: string = 'admin'
) {
  const db = await getDatabase();

  const result = await db.run(
    'INSERT INTO admins (username, password, email, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [username, password, email, fullName, role]
  );

  return result.lastID;
}

// Provider management functions
export async function getProviders(type?: string) {
  const db = await getDatabase();
  if (type) {
    return await db.all('SELECT * FROM providers WHERE type = ? ORDER BY priority, name', [type]);
  }
  return await db.all('SELECT * FROM providers ORDER BY type, priority, name');
}

export async function getActiveProviders(type?: string) {
  const db = await getDatabase();
  if (type) {
    return await db.all('SELECT * FROM providers WHERE type = ? AND is_active = 1 ORDER BY priority, name', [type]);
  }
  return await db.all('SELECT * FROM providers WHERE is_active = 1 ORDER BY type, priority, name');
}

export async function updateProviderStatus(id: number, isActive: boolean) {
  const db = await getDatabase();
  await db.run(
    'UPDATE providers SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [isActive ? 1 : 0, id]
  );
}

export async function updateProviderPriority(id: number, priority: number) {
  const db = await getDatabase();
  await db.run(
    'UPDATE providers SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [priority, id]
  );
}

export async function updateProviderConfig(id: number, config: any) {
  const db = await getDatabase();
  await db.run(
    'UPDATE providers SET config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(config), id]
  );
}

export async function addProviderLog(
  providerId: number,
  action: string,
  inputData?: string,
  outputData?: string,
  processingTime?: number,
  status?: string,
  errorMessage?: string
) {
  const db = await getDatabase();
  await db.run(
    `INSERT INTO provider_logs (provider_id, action, input_data, output_data, processing_time, status, error_message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [providerId, action, inputData, outputData, processingTime, status, errorMessage]
  );
}

// Storage Functions
export async function getStorageValue(key: string) {
  const db = await getDatabase();
  const result = await db.get(
    'SELECT * FROM storage WHERE key = ? AND (ttl IS NULL OR ttl > CURRENT_TIMESTAMP)',
    [key]
  );
  return result;
}

export async function setStorageValue(
  key: string,
  value: string,
  type: string = 'cache',
  userId?: string,
  agentId?: string,
  ttl?: number
) {
  const db = await getDatabase();
  const ttlDate = ttl ? new Date(Date.now() + ttl * 1000).toISOString() : null;

  await db.run(
    `INSERT OR REPLACE INTO storage (key, value, type, user_id, agent_id, ttl, created_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [key, value, type, userId, agentId, ttlDate]
  );
}

export async function deleteStorageValue(key: string) {
  const db = await getDatabase();
  await db.run('DELETE FROM storage WHERE key = ?', [key]);
}

// Dispatcher Rules Functions
export async function getDispatcherRules(providerType?: string) {
  const db = await getDatabase();
  let query = 'SELECT * FROM dispatcher_rules';
  let params: any[] = [];

  if (providerType) {
    query += ' WHERE provider_type = ?';
    params.push(providerType);
  }

  query += ' ORDER BY priority ASC, name ASC';

  return await db.all(query, params);
}

export async function addDispatcherRule(rule: {
  name: string;
  input_pattern: string;
  provider_type: string;
  provider_id?: number;
  priority: number;
  is_active: boolean;
}) {
  const db = await getDatabase();
  const result = await db.run(
    `INSERT INTO dispatcher_rules (name, input_pattern, provider_type, provider_id, priority, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [rule.name, rule.input_pattern, rule.provider_type, rule.provider_id, rule.priority, rule.is_active ? 1 : 0]
  );

  // Return the inserted rule with ID
  return await db.get('SELECT * FROM dispatcher_rules WHERE id = ?', [result.lastID]);
}

export async function updateDispatcherRule(id: string | number, updates: any) {
  const db = await getDatabase();

  if (typeof updates === 'boolean') {
    // Handle the old signature: updateDispatcherRule(id: number, isActive: boolean)
    await db.run(
      'UPDATE dispatcher_rules SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [updates ? 1 : 0, id]
    );
  } else {
    // Handle the new signature: updateDispatcherRule(id: string, updates: any)
    const fields = Object.keys(updates).filter(key => key !== 'id').map(key => `${key} = ?`).join(', ');
    const values = Object.keys(updates).filter(key => key !== 'id').map(key => updates[key]);

    await db.run(
      `UPDATE dispatcher_rules SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
  }
}

export async function deleteDispatcherRule(id: string) {
  const db = await getDatabase();
  await db.run('DELETE FROM dispatcher_rules WHERE id = ?', [id]);
}

// Backup History functions
export async function getBackupHistory(limit: number = 50): Promise<any[]> {
  const db = await getDatabase();
  return await db.all('SELECT * FROM backup_history ORDER BY timestamp DESC LIMIT ?', [limit]);
}

export async function saveBackupStatus(
  id: string,
  type: string,
  status: string,
  details: string,
  fileSize?: number,
  error?: string
): Promise<void> {
  const db = await getDatabase();
  await db.run(
    'INSERT INTO backup_history (id, type, status, timestamp, details, file_size, error) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)',
    [id, type, status, details, fileSize, error]
  );
}

export async function updateBackupStatus(
  id: string,
  status: string,
  details?: string,
  fileSize?: number,
  error?: string
): Promise<void> {
  const db = await getDatabase();
  const updates = [];
  const params = [];

  updates.push('status = ?');
  params.push(status);

  if (details) {
    updates.push('details = ?');
    params.push(details);
  }

  if (fileSize !== undefined) {
    updates.push('file_size = ?');
    params.push(fileSize);
  }

  if (error) {
    updates.push('error = ?');
    params.push(error);
  }

  params.push(id);

  await db.run(
    `UPDATE backup_history SET ${updates.join(', ')} WHERE id = ?`,
    params
  );
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
} 