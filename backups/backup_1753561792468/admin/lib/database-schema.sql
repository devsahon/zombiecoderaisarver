-- Server management tables
CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    port INTEGER NOT NULL,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
    response_time REAL,
    error_message TEXT,
    last_check DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS server_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers (id)
);

CREATE TABLE IF NOT EXISTS server_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id INTEGER NOT NULL,
    cpu_usage REAL NOT NULL,
    memory_usage REAL NOT NULL,
    disk_usage REAL NOT NULL,
    active_connections INTEGER DEFAULT 0,
    requests_per_minute INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers (id)
);

-- Agent management tables
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    memory_usage TEXT,
    last_used DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name TEXT NOT NULL,
    action TEXT NOT NULL,
    message TEXT NOT NULL,
    processing_time REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Voice session management
CREATE TABLE IF NOT EXISTS voice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    language TEXT NOT NULL,
    voice_type TEXT NOT NULL,
    text_content TEXT NOT NULL,
    audio_file_path TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    processing_time REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System events
CREATE TABLE IF NOT EXISTS system_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_components TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin user management
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Provider management
CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ai', 'tts', 'stt', 'news', 'weather', 'image', 'video', 'email', 'sms', 'geo', 'search')),
    category TEXT NOT NULL CHECK (category IN ('local', 'cloud')),
    api_url TEXT,
    api_key TEXT,
    config TEXT,
    is_active BOOLEAN DEFAULT 1,
    priority INTEGER DEFAULT 0,
    health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'unhealthy', 'unknown')),
    last_health_check DATETIME,
    usage_count INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0.0,
    avg_response_time REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    input_data TEXT,
    output_data TEXT,
    processing_time REAL,
    status TEXT CHECK (status IN ('success', 'failed', 'timeout')),
    error_message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers (id)
);

-- Storage and caching
CREATE TABLE IF NOT EXISTS storage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'cache' CHECK (type IN ('cache', 'memory', 'context')),
    user_id TEXT,
    agent_id TEXT,
    ttl INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dispatcher rules
CREATE TABLE IF NOT EXISTS dispatcher_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    input_pattern TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    provider_id INTEGER,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers (id)
);

-- Image generation
CREATE TABLE IF NOT EXISTS image_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    provider_id INTEGER NOT NULL,
    width INTEGER DEFAULT 512,
    height INTEGER DEFAULT 512,
    style TEXT DEFAULT 'realistic',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    image_url TEXT,
    processing_time REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (provider_id) REFERENCES providers (id)
);

-- Video generation
CREATE TABLE IF NOT EXISTS video_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    provider_id INTEGER NOT NULL,
    duration INTEGER DEFAULT 5,
    fps INTEGER DEFAULT 24,
    resolution TEXT DEFAULT '1920x1080',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    video_url TEXT,
    processing_time REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (provider_id) REFERENCES providers (id)
);

-- Communications
CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'notification')),
    recipient TEXT NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    provider_id INTEGER,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers (id)
);

-- User locations
CREATE TABLE IF NOT EXISTS user_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Backup history
CREATE TABLE IF NOT EXISTS backup_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backup_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('github', 'google_drive', 'local')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT NOT NULL,
    file_size INTEGER,
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO admin_users (username, password_hash, email, full_name, role) 
VALUES ('admin', '$2b$10$rQZ8K9vX8K9vX8K9vX8K9O8K9vX8K9vX8K9vX8K9vX8K9vX8K9vX8K9', 'admin@example.com', 'System Administrator', 'admin');

-- Insert default servers
INSERT OR IGNORE INTO servers (name, url, port) VALUES 
('Main Server', 'http://localhost', 8000),
('API Server', 'http://localhost', 8001),
('Voice Server', 'http://localhost', 8001),
('AI Server', 'http://localhost', 8002);

-- Insert default providers
INSERT OR IGNORE INTO providers (name, type, category, priority) VALUES 
-- AI Models
('Local GPT', 'ai', 'local', 1),
('OpenAI GPT-4', 'ai', 'cloud', 2),
('Claude AI', 'ai', 'cloud', 3),
('Gemini AI', 'ai', 'cloud', 4),

-- TTS Providers
('Local TTS', 'tts', 'local', 1),
('Google TTS', 'tts', 'cloud', 2),
('Azure TTS', 'tts', 'cloud', 3),
('Amazon Polly', 'tts', 'cloud', 4),

-- STT Providers
('Local STT', 'stt', 'local', 1),
('Google STT', 'stt', 'cloud', 2),
('Azure STT', 'stt', 'cloud', 3),
('Amazon Transcribe', 'stt', 'cloud', 4),

-- News Providers
('News API', 'news', 'cloud', 1),
('GNews', 'news', 'cloud', 2),

-- Weather Providers
('OpenWeatherMap', 'weather', 'cloud', 1),
('WeatherAPI', 'weather', 'cloud', 2),

-- Image Generation
('DALL-E', 'image', 'cloud', 1),
('Stable Diffusion', 'image', 'local', 2),
('Midjourney', 'image', 'cloud', 3),

-- Video Generation
('RunwayML', 'video', 'cloud', 1),
('Pika Labs', 'video', 'cloud', 2),

-- Email/SMS
('SMTP', 'email', 'cloud', 1),
('Twilio SMS', 'sms', 'cloud', 1),

-- Geo/Search
('Google Maps', 'geo', 'cloud', 1),
('Google Search', 'search', 'cloud', 1); 