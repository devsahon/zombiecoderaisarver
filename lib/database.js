import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_management_system',
    charset: process.env.DB_CHARSET || 'utf8mb4',
    // XAMPP MySQL socket path for Linux
    socketPath: process.env.DB_SOCKET || '/opt/lampp/var/mysql/mysql.sock'
};

// Create connection pool
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT VERSION() as version');
        connection.release();
        console.log('✅ Database connected successfully!');
        console.log(`📊 MySQL Version: ${rows[0].version}`);
        return true;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        return false;
    }
}

// ===== USERS =====
export async function getUsers() {
    try {
        const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
        return rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

export async function getUserById(id) {
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

export async function createUser(userData) {
    try {
        const {
            username,
            email,
            password_hash,
            role = 'user',
            status = 'active'
        } = userData;
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
            [username, email, password_hash, role, status]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function updateUser(id, userData) {
    try {
        const {
            username,
            email,
            role,
            status
        } = userData;
        const [result] = await pool.execute(
            'UPDATE users SET username = ?, email = ?, role = ?, status = ? WHERE id = ?',
            [username, email, role, status, id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

// ===== AGENTS =====
export async function getAgents() {
    try {
        const [rows] = await pool.execute('SELECT * FROM agents ORDER BY created_at DESC');
        return rows;
    } catch (error) {
        console.error('Error fetching agents:', error);
        throw error;
    }
}

export async function getAgentById(id) {
    try {
        const [rows] = await pool.execute('SELECT * FROM agents WHERE id = ?', [id]);
        return rows[0];
    } catch (error) {
        console.error('Error fetching agent:', error);
        throw error;
    }
}

export async function createAgent(agentData) {
    try {
        const {
            name,
            display_name,
            personality,
            model_preference,
            prompt_template,
            config,
            status = 'active'
        } = agentData;
        const [result] = await pool.execute(
            'INSERT INTO agents (name, display_name, personality, model_preference, prompt_template, config, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, display_name, personality, JSON.stringify(model_preference), prompt_template, JSON.stringify(config), status]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating agent:', error);
        throw error;
    }
}

export async function updateAgent(id, agentData) {
    try {
        const {
            name,
            display_name,
            personality,
            model_preference,
            prompt_template,
            config,
            status
        } = agentData;
        const [result] = await pool.execute(
            'UPDATE agents SET name = ?, display_name = ?, personality = ?, model_preference = ?, prompt_template = ?, config = ?, status = ? WHERE id = ?',
            [name, display_name, personality, JSON.stringify(model_preference), prompt_template, JSON.stringify(config), status, id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating agent:', error);
        throw error;
    }
}

export async function deleteAgent(id) {
    try {
        const [result] = await pool.execute('DELETE FROM agents WHERE id = ?', [id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting agent:', error);
        throw error;
    }
}

// ===== PROVIDERS =====
export async function getProviders() {
    try {
        const [rows] = await pool.execute('SELECT * FROM providers ORDER BY priority ASC, created_at DESC');
        return rows;
    } catch (error) {
        console.error('Error fetching providers:', error);
        throw error;
    }
}

export async function getProviderById(id) {
    try {
        const [rows] = await pool.execute('SELECT * FROM providers WHERE id = ?', [id]);
        return rows[0];
    } catch (error) {
        console.error('Error fetching provider:', error);
        throw error;
    }
}

export async function getProvidersByType(type) {
    try {
        const [rows] = await pool.execute('SELECT * FROM providers WHERE type = ? ORDER BY priority ASC', [type]);
        return rows;
    } catch (error) {
        console.error('Error fetching providers by type:', error);
        throw error;
    }
}

export async function getProvidersByCategory(category) {
    try {
        const [rows] = await pool.execute('SELECT * FROM providers WHERE category = ? ORDER BY priority ASC', [category]);
        return rows;
    } catch (error) {
        console.error('Error fetching providers by category:', error);
        throw error;
    }
}

export async function getActiveProviders() {
    try {
        const [rows] = await pool.execute('SELECT * FROM providers WHERE status = "active" ORDER BY priority ASC');
        return rows;
    } catch (error) {
        console.error('Error fetching active providers:', error);
        throw error;
    }
}

export async function getFreeProviders() {
    try {
        const [rows] = await pool.execute('SELECT * FROM providers WHERE is_free = TRUE ORDER BY priority ASC');
        return rows;
    } catch (error) {
        console.error('Error fetching free providers:', error);
        throw error;
    }
}

export async function createProvider(providerData) {
    try {
        const {
            name,
            display_name,
            type,
            category,
            api_key,
            base_url,
            model_name,
            config,
            status = 'inactive',
            priority = 0,
            is_free = true,
            is_auto_detect = false,
            rate_limit_per_minute = 60,
            rate_limit_per_hour = 1000
        } = providerData;

        const [result] = await pool.execute(
            'INSERT INTO providers (name, display_name, type, category, api_key, base_url, model_name, config, status, priority, is_free, is_auto_detect, rate_limit_per_minute, rate_limit_per_hour) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, display_name, type, category, api_key, base_url, model_name, JSON.stringify(config), status, priority, is_free, is_auto_detect, rate_limit_per_minute, rate_limit_per_hour]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating provider:', error);
        throw error;
    }
}

export async function updateProvider(id, providerData) {
    try {
        const {
            name,
            display_name,
            type,
            category,
            api_key,
            base_url,
            model_name,
            config,
            status,
            priority,
            is_free,
            is_auto_detect,
            rate_limit_per_minute,
            rate_limit_per_hour
        } = providerData;

        const [result] = await pool.execute(
            'UPDATE providers SET name = ?, display_name = ?, type = ?, category = ?, api_key = ?, base_url = ?, model_name = ?, config = ?, status = ?, priority = ?, is_free = ?, is_auto_detect = ?, rate_limit_per_minute = ?, rate_limit_per_hour = ? WHERE id = ?',
            [name, display_name, type, category, api_key, base_url, model_name, JSON.stringify(config), status, priority, is_free, is_auto_detect, rate_limit_per_minute, rate_limit_per_hour, id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating provider:', error);
        throw error;
    }
}

export async function toggleProviderStatus(id, status) {
    try {
        const [result] = await pool.execute(
            'UPDATE providers SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error toggling provider status:', error);
        throw error;
    }
}

export async function updateProviderStatus(id, isActive) {
    try {
        const status = isActive ? 'active' : 'inactive';
        const [result] = await pool.execute(
            'UPDATE providers SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating provider status:', error);
        throw error;
    }
}

export async function addProviderLog(providerId, action, userId = null, details = null, status = 'success', message = null) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO provider_usage_logs (provider_id, user_id, request_type, status, error_message) VALUES (?, ?, ?, ?, ?)',
            [providerId, userId, action, status, message]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding provider log:', error);
        throw error;
    }
}

// ===== PROVIDER MODELS =====
export async function getProviderModels(providerId) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM provider_models WHERE provider_id = ? ORDER BY model_name',
            [providerId]
        );
        return rows;
    } catch (error) {
        console.error('Error fetching provider models:', error);
        throw error;
    }
}

export async function getAvailableModels() {
    try {
        const [rows] = await pool.execute(`
            SELECT pm.*, p.name as provider_name, p.display_name as provider_display_name 
            FROM provider_models pm 
            JOIN providers p ON pm.provider_id = p.id 
            WHERE pm.is_available = TRUE AND p.status = 'active' 
            ORDER BY p.priority ASC, pm.model_name
        `);
        return rows;
    } catch (error) {
        console.error('Error fetching available models:', error);
        throw error;
    }
}

export async function updateModelAvailability(modelId, isAvailable) {
    try {
        const [result] = await pool.execute(
            'UPDATE provider_models SET is_available = ? WHERE id = ?',
            [isAvailable, modelId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating model availability:', error);
        throw error;
    }
}

// ===== PROVIDER USAGE LOGS =====
export async function getProviderUsageLogs(providerId = null, limit = 100) {
    try {
        let query = `
            SELECT pul.*, p.name as provider_name, a.name as agent_name, u.username 
            FROM provider_usage_logs pul 
            LEFT JOIN providers p ON pul.provider_id = p.id 
            LEFT JOIN agents a ON pul.agent_id = a.id 
            LEFT JOIN users u ON pul.user_id = u.id
        `;

        const params = [];
        if (providerId) {
            query += ' WHERE pul.provider_id = ?';
            params.push(providerId);
        }

        query += ' ORDER BY pul.created_at DESC LIMIT ?';
        params.push(limit);

        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error fetching provider usage logs:', error);
        throw error;
    }
}

export async function addProviderUsageLog(logData) {
    try {
        const {
            provider_id,
            agent_id,
            user_id,
            request_type,
            model_used,
            tokens_used = 0,
            cost = 0.000000,
            response_time,
            status,
            error_message,
            fallback_used = false,
            fallback_provider_id
        } = logData;

        const [result] = await pool.execute(
            'INSERT INTO provider_usage_logs (provider_id, agent_id, user_id, request_type, model_used, tokens_used, cost, response_time, status, error_message, fallback_used, fallback_provider_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [provider_id, agent_id, user_id, request_type, model_used, tokens_used, cost, response_time, status, error_message, fallback_used, fallback_provider_id]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding provider usage log:', error);
        throw error;
    }
}

// ===== SYSTEM CACHE =====
export async function getCacheValue(cacheKey) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM system_cache WHERE cache_key = ? AND (expires_at IS NULL OR expires_at > NOW())',
            [cacheKey]
        );
        return rows[0];
    } catch (error) {
        console.error('Error getting cache value:', error);
        throw error;
    }
}

export async function setCacheValue(cacheKey, cacheValue, cacheType = 'temp', expiresAt = null) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO system_cache (cache_key, cache_value, cache_type, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE cache_value = ?, cache_type = ?, expires_at = ?, updated_at = NOW()',
            [cacheKey, cacheValue, cacheType, expiresAt, cacheValue, cacheType, expiresAt]
        );
        return result.insertId || result.affectedRows > 0;
    } catch (error) {
        console.error('Error setting cache value:', error);
        throw error;
    }
}

export async function clearCache(cacheType = null) {
    try {
        let query = 'DELETE FROM system_cache';
        const params = [];

        if (cacheType) {
            query += ' WHERE cache_type = ?';
            params.push(cacheType);
        }

        const [result] = await pool.execute(query, params);
        return result.affectedRows;
    } catch (error) {
        console.error('Error clearing cache:', error);
        throw error;
    }
}

// ===== PROVIDER HEALTH CHECKS =====
export async function getProviderHealthChecks(providerId = null, limit = 50) {
    try {
        let query = `
            SELECT phc.*, p.name as provider_name 
            FROM provider_health_checks phc 
            JOIN providers p ON phc.provider_id = p.id
        `;

        const params = [];
        if (providerId) {
            query += ' WHERE phc.provider_id = ?';
            params.push(providerId);
        }

        query += ' ORDER BY phc.created_at DESC LIMIT ?';
        params.push(limit);

        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error fetching provider health checks:', error);
        throw error;
    }
}

export async function addProviderHealthCheck(healthData) {
    try {
        const {
            provider_id,
            check_type,
            status,
            response_time,
            error_message
        } = healthData;

        const [result] = await pool.execute(
            'INSERT INTO provider_health_checks (provider_id, check_type, status, response_time, error_message) VALUES (?, ?, ?, ?, ?)',
            [provider_id, check_type, status, response_time, error_message]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding provider health check:', error);
        throw error;
    }
}

// ===== PROVIDER STATISTICS =====
export async function getProviderStats() {
    try {
        const [providerCount] = await pool.execute('SELECT COUNT(*) as count FROM providers');
        const [activeProviderCount] = await pool.execute('SELECT COUNT(*) as count FROM providers WHERE status = "active"');
        const [freeProviderCount] = await pool.execute('SELECT COUNT(*) as count FROM providers WHERE is_free = TRUE');
        const [paidProviderCount] = await pool.execute('SELECT COUNT(*) as count FROM providers WHERE is_free = FALSE');
        const [modelCount] = await pool.execute('SELECT COUNT(*) as count FROM provider_models');
        const [usageLogCount] = await pool.execute('SELECT COUNT(*) as count FROM provider_usage_logs');
        const [cacheCount] = await pool.execute('SELECT COUNT(*) as count FROM system_cache');

        return {
            total_providers: providerCount[0].count,
            active_providers: activeProviderCount[0].count,
            free_providers: freeProviderCount[0].count,
            paid_providers: paidProviderCount[0].count,
            total_models: modelCount[0].count,
            usage_logs: usageLogCount[0].count,
            cache_entries: cacheCount[0].count
        };
    } catch (error) {
        console.error('Error fetching provider stats:', error);
        throw error;
    }
}

export async function getProviderUsageSummary(providerId = null) {
    try {
        let query = `
            SELECT 
                p.name as provider_name,
                p.type as provider_type,
                p.category as provider_category,
                COUNT(pul.id) as total_requests,
                SUM(CASE WHEN pul.status = 'success' THEN 1 ELSE 0 END) as successful_requests,
                SUM(CASE WHEN pul.status != 'success' THEN 1 ELSE 0 END) as failed_requests,
                SUM(pul.tokens_used) as total_tokens,
                SUM(pul.cost) as total_cost,
                AVG(pul.response_time) as avg_response_time,
                COUNT(CASE WHEN pul.fallback_used = TRUE THEN 1 END) as fallback_count
            FROM providers p
            LEFT JOIN provider_usage_logs pul ON p.id = pul.provider_id
        `;

        const params = [];
        if (providerId) {
            query += ' WHERE p.id = ?';
            params.push(providerId);
        }

        query += ' GROUP BY p.id, p.name, p.type, p.category ORDER BY total_requests DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error fetching provider usage summary:', error);
        throw error;
    }
}

// ===== LICENSES =====
export async function getLicenses() {
    try {
        const [rows] = await pool.execute(`
            SELECT l.*, u.username, a.name as agent_name, p.name as provider_name
            FROM licenses l 
            LEFT JOIN users u ON l.user_id = u.id 
            LEFT JOIN agents a ON l.agent_id = a.id 
            LEFT JOIN providers p ON l.provider_id = p.id
            ORDER BY l.created_at DESC
        `);
        return rows;
    } catch (error) {
        console.error('Error fetching licenses:', error);
        throw error;
    }
}

export async function createLicense(licenseData) {
    try {
        const {
            license_key,
            user_id,
            agent_id,
            provider_id,
            status = 'active',
            expires_at,
            usage_count = 0,
            max_usage = -1
        } = licenseData;
        const [result] = await pool.execute(
            'INSERT INTO licenses (license_key, user_id, agent_id, provider_id, status, expires_at, usage_count, max_usage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [license_key, user_id, agent_id, provider_id, status, expires_at, usage_count, max_usage]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating license:', error);
        throw error;
    }
}

// ===== CONVERSATIONS =====
export async function getConversations(userId = null, limit = 50) {
    try {
        let query = `
            SELECT c.*, u.username, a.name as agent_name, p.name as provider_name
            FROM conversations c 
            LEFT JOIN users u ON c.user_id = u.id 
            LEFT JOIN agents a ON c.agent_id = a.id 
            LEFT JOIN providers p ON c.provider_id = p.id
        `;

        const params = [];
        if (userId) {
            query += ' WHERE c.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY c.created_at DESC LIMIT ?';
        params.push(limit);

        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
}

export async function addConversation(conversationData) {
    try {
        const {
            user_id,
            agent_id,
            provider_id,
            message,
            response,
            tokens_used = 0,
            cost = 0.0000
        } = conversationData;
        const [result] = await pool.execute(
            'INSERT INTO conversations (user_id, agent_id, provider_id, message, response, tokens_used, cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, agent_id, provider_id, message, response, tokens_used, cost]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding conversation:', error);
        throw error;
    }
}

// ===== SYSTEM LOGS =====
export async function getSystemLogs(limit = 100, category = null) {
    try {
        let query = 'SELECT * FROM system_logs';
        const params = [];

        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error fetching system logs:', error);
        throw error;
    }
}

export async function addSystemLog(logData) {
    try {
        const {
            level = 'info', category = 'system', message, context
        } = logData;
        const [result] = await pool.execute(
            'INSERT INTO system_logs (level, category, message, context) VALUES (?, ?, ?, ?)',
            [level, category, message, JSON.stringify(context)]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding system log:', error);
        throw error;
    }
}

// ===== BACKUP LOGS =====
export async function getBackupLogs(limit = 50) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM backup_logs ORDER BY created_at DESC LIMIT ?',
            [limit]
        );
        return rows;
    } catch (error) {
        console.error('Error fetching backup logs:', error);
        throw error;
    }
}

export async function addBackupLog(backupData) {
    try {
        const {
            backup_type,
            status = 'in_progress',
            file_path,
            file_size,
            backup_method = 'local',
            error_message
        } = backupData;
        const [result] = await pool.execute(
            'INSERT INTO backup_logs (backup_type, status, file_path, file_size, backup_method, error_message) VALUES (?, ?, ?, ?, ?, ?)',
            [backup_type, status, file_path, file_size, backup_method, error_message]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding backup log:', error);
        throw error;
    }
}

// ===== VOICE SETTINGS =====
export async function getVoiceSettings(userId) {
    try {
        const [rows] = await pool.execute('SELECT * FROM voice_settings WHERE user_id = ?', [userId]);
        return rows[0];
    } catch (error) {
        console.error('Error fetching voice settings:', error);
        throw error;
    }
}

export async function createVoiceSettings(voiceData) {
    try {
        const {
            user_id,
            tts_engine = 'gtts',
            stt_engine = 'whisper',
            language = 'bn',
            voice_speed = 1.0,
            voice_pitch = 1.0,
            config
        } = voiceData;
        const [result] = await pool.execute(
            'INSERT INTO voice_settings (user_id, tts_engine, stt_engine, language, voice_speed, voice_pitch, config) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, tts_engine, stt_engine, language, voice_speed, voice_pitch, JSON.stringify(config)]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating voice settings:', error);
        throw error;
    }
}

// ===== IMAGE BACKUPS =====
export async function getImageBackups(limit = 50) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM image_backups ORDER BY created_at DESC LIMIT ?',
            [limit]
        );
        return rows;
    } catch (error) {
        console.error('Error fetching image backups:', error);
        throw error;
    }
}

export async function addImageBackup(imageData) {
    try {
        const {
            original_path,
            backup_path,
            file_size,
            compression_ratio,
            watermark_added = false,
            processing_time,
            status = 'pending'
        } = imageData;
        const [result] = await pool.execute(
            'INSERT INTO image_backups (original_path, backup_path, file_size, compression_ratio, watermark_added, processing_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [original_path, backup_path, file_size, compression_ratio, watermark_added, processing_time, status]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding image backup:', error);
        throw error;
    }
}

// ===== DATABASE STATISTICS =====
export async function getDatabaseStats() {
    try {
        const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [agentCount] = await pool.execute('SELECT COUNT(*) as count FROM agents');
        const [providerCount] = await pool.execute('SELECT COUNT(*) as count FROM providers');
        const [licenseCount] = await pool.execute('SELECT COUNT(*) as count FROM licenses');
        const [conversationCount] = await pool.execute('SELECT COUNT(*) as count FROM conversations');
        const [logCount] = await pool.execute('SELECT COUNT(*) as count FROM system_logs');
        const [backupCount] = await pool.execute('SELECT COUNT(*) as count FROM backup_logs');
        const [imageBackupCount] = await pool.execute('SELECT COUNT(*) as count FROM image_backups');
        const [modelCount] = await pool.execute('SELECT COUNT(*) as count FROM provider_models');
        const [usageLogCount] = await pool.execute('SELECT COUNT(*) as count FROM provider_usage_logs');
        const [cacheCount] = await pool.execute('SELECT COUNT(*) as count FROM system_cache');
        const [healthCheckCount] = await pool.execute('SELECT COUNT(*) as count FROM provider_health_checks');

        return {
            users: userCount[0].count,
            agents: agentCount[0].count,
            providers: providerCount[0].count,
            licenses: licenseCount[0].count,
            conversations: conversationCount[0].count,
            logs: logCount[0].count,
            backups: backupCount[0].count,
            image_backups: imageBackupCount[0].count,
            models: modelCount[0].count,
            usage_logs: usageLogCount[0].count,
            cache_entries: cacheCount[0].count,
            health_checks: healthCheckCount[0].count
        };
    } catch (error) {
        console.error('Error fetching database stats:', error);
        throw error;
    }
}

// Close database connection
export async function closeConnection() {
    try {
        await pool.end();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
}

// ===== SERVER STATUS =====
export async function updateServerStatus(serverName, status, responseTime = null, error = null) {
  try {
    const context = JSON.stringify({
      server_name: serverName,
      status: status,
      response_time: responseTime,
      error: error,
      timestamp: new Date().toISOString()
    });
    
    const [result] = await pool.execute(
      'INSERT INTO system_logs (category, message, context, level) VALUES (?, ?, ?, ?)',
      ['server', `Server ${serverName}: ${status}`, context, 'info']
    );
    return result.insertId;
  } catch (error) {
    console.error('Error updating server status:', error);
    throw error;
  }
}

export async function addServerLog(category, message, context = null, level = 'info') {
    try {
        const [result] = await pool.execute(
            'INSERT INTO system_logs (category, message, context, level) VALUES (?, ?, ?, ?)',
            [category, message, context, level]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error adding server log:', error);
        throw error;
    }
}

// ===== NAVIGATION =====
export async function getNavigationMenu() {
    try {
        return [{
                name: 'Dashboard',
                href: '/admin',
                icon: 'Home'
            },
            {
                name: 'Personal Agent',
                href: '/admin/personal_agent',
                icon: 'User'
            },
            {
                name: 'Providers',
                href: '/admin/providers',
                icon: 'Server'
            },
            {
                name: 'Users',
                href: '/admin/users',
                icon: 'Users'
            },
            {
                name: 'Settings',
                href: '/admin/settings',
                icon: 'Settings'
            },
            {
                name: 'Database',
                href: '/admin/database',
                icon: 'Database'
            },
            {
                name: 'Voice',
                href: '/admin/voice',
                icon: 'Mic'
            },
            {
                name: 'Image Generation',
                href: '/admin/image-generation',
                icon: 'Image'
            },
            {
                name: 'Video Generation',
                href: '/admin/video-generation',
                icon: 'Video'
            },
            {
                name: 'Communications',
                href: '/admin/communications',
                icon: 'MessageSquare'
            },
            {
                name: 'Backup',
                href: '/admin/backup',
                icon: 'Save'
            },
            {
                name: 'Productivity',
                href: '/admin/productivity',
                icon: 'Zap'
            },
            {
                name: 'Models',
                href: '/admin/models',
                icon: 'Brain'
            },
            {
                name: 'Prompt Generator',
                href: '/admin/prompt-generator',
                icon: 'Edit'
            }
        ];
    } catch (error) {
        console.error('Error getting navigation menu:', error);
        return [];
    }
}

// ===== COMMUNICATIONS =====
export async function getCommunications(limit = 50) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM system_logs WHERE category IN (?, ?, ?) ORDER BY created_at DESC LIMIT ?',
            ['communication', 'sms', 'email', limit]
        );
        return rows;
    } catch (error) {
        console.error('Error fetching communications:', error);
        return [];
    }
}

export default pool;