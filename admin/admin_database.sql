-- Server Management Database Schema

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'main', 'voice', 'ai', 'api'
    status VARCHAR(20) DEFAULT 'offline', -- 'online', 'offline', 'error'
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time INTEGER, -- in milliseconds
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Server logs table
CREATE TABLE IF NOT EXISTS server_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER,
    level VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error'
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Server metrics table
CREATE TABLE IF NOT EXISTS server_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    active_connections INTEGER,
    requests_per_minute INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(50), -- 'ai', 'voice', 'utility'
    status VARCHAR(20) DEFAULT 'inactive', -- 'active', 'inactive', 'error'
    memory_usage VARCHAR(20),
    last_used TIMESTAMP,
    config_data TEXT, -- JSON configuration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent logs table
CREATE TABLE IF NOT EXISTS agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER,
    action VARCHAR(100), -- 'start', 'stop', 'error', 'request'
    message TEXT,
    processing_time INTEGER, -- in milliseconds
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Voice sessions table
CREATE TABLE IF NOT EXISTS voice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(100) UNIQUE,
    user_id VARCHAR(100),
    language VARCHAR(10) DEFAULT 'bn',
    voice_type VARCHAR(50), -- 'tts', 'stt', 'chat'
    text_content TEXT,
    audio_file_path VARCHAR(255),
    processing_time INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- System events table
CREATE TABLE IF NOT EXISTS system_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type VARCHAR(50), -- 'server_start', 'server_stop', 'error', 'maintenance'
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(200),
    description TEXT,
    affected_components TEXT, -- JSON array of affected components
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default servers
INSERT OR IGNORE INTO servers (name, url, port, type, status) VALUES
('Main Server', 'http://localhost', 8000, 'main', 'offline'),
('Voice Server', 'http://localhost', 8001, 'voice', 'offline'),
('AI Server', 'http://localhost', 8002, 'ai', 'offline'),
('API Server', 'http://localhost', 8000, 'api', 'offline');

-- Insert default agents
INSERT OR IGNORE INTO agents (name, description, type, status) VALUES
('test_agent', 'Test agent for demonstration', 'ai', 'inactive'),
('voice_agent', 'Voice processing agent', 'voice', 'inactive'),
('ai_agent', 'AI processing agent', 'ai', 'inactive'),
('blog_writer', 'Blog writing agent', 'ai', 'inactive'),
('translation_agent', 'Translation agent', 'ai', 'inactive');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_server_logs_server_id ON server_logs(server_id);
CREATE INDEX IF NOT EXISTS idx_server_logs_timestamp ON server_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_server_metrics_server_id ON server_metrics(server_id);
CREATE INDEX IF NOT EXISTS idx_server_metrics_timestamp ON server_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_session_id ON voice_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_system_events_timestamp ON system_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_events_severity ON system_events(severity);

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT 1,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT OR IGNORE INTO admins (username, password, email, full_name, role) 
VALUES ('admin', 'admin123', 'admin@example.com', 'System Administrator', 'admin');

-- Create admin indexes
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'ai', 'tts', 'stt', 'news', 'weather'
    category TEXT NOT NULL, -- 'local', 'cloud', 'fallback'
    api_key TEXT,
    api_url TEXT,
    config_data TEXT, -- JSON configuration
    is_active BOOLEAN DEFAULT 1,
    priority INTEGER DEFAULT 0, -- Lower number = higher priority
    latency_threshold INTEGER DEFAULT 5000, -- milliseconds
    max_requests_per_minute INTEGER DEFAULT 60,
    current_requests INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Provider logs table
CREATE TABLE IF NOT EXISTS provider_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER,
    action TEXT NOT NULL, -- 'request', 'response', 'error', 'fallback'
    input_data TEXT,
    output_data TEXT,
    processing_time INTEGER, -- milliseconds
    status TEXT, -- 'success', 'error', 'timeout'
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Storage table for context and cache
CREATE TABLE IF NOT EXISTS storage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT NOT NULL, -- 'context', 'cache', 'session'
    user_id TEXT,
    agent_id TEXT,
    ttl INTEGER, -- Time to live in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dispatcher rules table
CREATE TABLE IF NOT EXISTS dispatcher_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name TEXT UNIQUE NOT NULL,
    input_pattern TEXT, -- Regex pattern for input matching
    provider_type TEXT NOT NULL,
    provider_id INTEGER,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Insert default providers
INSERT OR IGNORE INTO providers (name, type, category, api_url, priority, is_active) VALUES
('Local AI Model', 'ai', 'local', 'http://localhost:8002/api/generate', 1, 1),
('OpenAI GPT-4', 'ai', 'cloud', 'https://api.openai.com/v1/chat/completions', 2, 1),
('Mistral AI', 'ai', 'cloud', 'https://api.mistral.ai/v1/chat/completions', 3, 1),
('TogetherAI', 'ai', 'cloud', 'https://api.together.xyz/v1/chat/completions', 4, 1),
('Local TTS', 'tts', 'local', 'http://localhost:8001/api/tts', 1, 1),
('Google TTS', 'tts', 'cloud', 'https://texttospeech.googleapis.com/v1/text:synthesize', 2, 1),
('Local STT', 'stt', 'local', 'http://localhost:8001/api/stt', 1, 1),
('Google STT', 'stt', 'cloud', 'https://speech.googleapis.com/v1/speech:recognize', 2, 1),
('News API', 'news', 'cloud', 'https://newsapi.org/v2/everything', 1, 1),
('Weather API', 'weather', 'cloud', 'https://api.openweathermap.org/data/2.5/weather', 1, 1);

-- Insert default dispatcher rules
INSERT OR IGNORE INTO dispatcher_rules (rule_name, input_pattern, provider_type, provider_id, priority) VALUES
('Local AI Priority', '.*', 'ai', 1, 1),
('Cloud AI Fallback', '.*', 'ai', 2, 2),
('Local TTS Priority', '.*', 'tts', 5, 1),
('Cloud TTS Fallback', '.*', 'tts', 6, 2),
('Local STT Priority', '.*', 'stt', 7, 1),
('Cloud STT Fallback', '.*', 'stt', 8, 2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(type);
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(is_active);
CREATE INDEX IF NOT EXISTS idx_provider_logs_provider_id ON provider_logs(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_logs_timestamp ON provider_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_storage_key ON storage(key);
CREATE INDEX IF NOT EXISTS idx_storage_type ON storage(type);
CREATE INDEX IF NOT EXISTS idx_storage_user_id ON storage(user_id);
CREATE INDEX IF NOT EXISTS idx_dispatcher_rules_type ON dispatcher_rules(provider_type);
CREATE INDEX IF NOT EXISTS idx_dispatcher_rules_active ON dispatcher_rules(is_active); 