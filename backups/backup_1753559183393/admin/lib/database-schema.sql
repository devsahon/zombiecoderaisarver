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
-- AI Models (Local & Free)
('Local AI Model', 'ai', 'local', 'http://localhost:8002/api/generate', 1, 1),
('Ollama (Mistral/Llama)', 'ai', 'local', 'http://localhost:11434/api/generate', 2, 1),
('Perplexity API', 'ai', 'cloud', 'https://api.perplexity.ai/chat/completions', 3, 1),

-- AI Models (Paid - Optional)
('OpenAI GPT-4', 'ai', 'cloud', 'https://api.openai.com/v1/chat/completions', 4, 0),
('Mistral AI', 'ai', 'cloud', 'https://api.mistral.ai/v1/chat/completions', 5, 0),
('TogetherAI', 'ai', 'cloud', 'https://api.together.xyz/v1/chat/completions', 6, 0),
('Anthropic Claude', 'ai', 'cloud', 'https://api.anthropic.com/v1/messages', 7, 0),
('Google Gemini', 'ai', 'cloud', 'https://generativelanguage.googleapis.com/v1beta/models', 8, 0),

-- TTS (Text-to-Speech)
('Local TTS', 'tts', 'local', 'http://localhost:8001/api/tts', 1, 1),
('Coqui TTS', 'tts', 'local', 'http://localhost:5002/api/tts', 2, 1),
('Google TTS', 'tts', 'cloud', 'https://texttospeech.googleapis.com/v1/text:synthesize', 3, 1),
('Azure Speech TTS', 'tts', 'cloud', 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', 4, 0),

-- STT (Speech-to-Text)
('Local STT', 'stt', 'local', 'http://localhost:8001/api/stt', 1, 1),
('Whisper.cpp', 'stt', 'local', 'http://localhost:9000/asr', 2, 1),
('Google STT', 'stt', 'cloud', 'https://speech.googleapis.com/v1/speech:recognize', 3, 1),
('Azure Speech STT', 'stt', 'cloud', 'https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1', 4, 0),

-- Image Generation
('Stable Diffusion', 'image', 'local', 'http://localhost:7860/api/predict', 1, 1),
('OpenAI DALL-E', 'image', 'cloud', 'https://api.openai.com/v1/images/generations', 2, 0),
('Midjourney API', 'image', 'cloud', 'https://api.midjourney.com/v1/imagine', 3, 0),

-- Video Generation
('RunwayML', 'video', 'cloud', 'https://api.runwayml.com/v1/inference', 1, 0),
('Pika Labs', 'video', 'cloud', 'https://api.pika.art/v1/create', 2, 0),

-- News & Information
('News API', 'news', 'cloud', 'https://newsapi.org/v2/everything', 1, 1),
('Mediastack', 'news', 'cloud', 'http://api.mediastack.com/v1/news', 2, 1),
('GNews', 'news', 'cloud', 'https://gnews.io/api/v4/search', 3, 1),
('Currents API', 'news', 'cloud', 'https://api.currentsapi.services/v1/search', 4, 1),

-- Weather & Geo
('Weather API', 'weather', 'cloud', 'https://api.openweathermap.org/data/2.5/weather', 1, 1),
('Open-Meteo API', 'weather', 'cloud', 'https://api.open-meteo.com/v1/forecast', 2, 1),
('OpenStreetMap', 'geo', 'cloud', 'https://nominatim.openstreetmap.org/search', 1, 1),

-- Communication
('Mailgun', 'email', 'cloud', 'https://api.mailgun.net/v3', 1, 0),
('Twilio SMS', 'sms', 'cloud', 'https://api.twilio.com/2010-04-01/Accounts', 1, 0),

-- Search
('SerpAPI', 'search', 'cloud', 'https://serpapi.com/search', 1, 0),
('You.com Search', 'search', 'cloud', 'https://api.you.com/search', 2, 0),
('Bing AI Search', 'search', 'cloud', 'https://api.bing.microsoft.com/v7.0/search', 3, 0);

-- Insert default dispatcher rules
INSERT OR IGNORE INTO dispatcher_rules (rule_name, input_pattern, provider_type, provider_id, priority) VALUES
-- AI Rules
('Local AI Priority', '.*', 'ai', 1, 1),
('Ollama AI Fallback', '.*', 'ai', 2, 2),
('Perplexity Research', 'research|search|find|lookup', 'ai', 3, 3),
('Cloud AI Fallback', '.*', 'ai', 4, 4),

-- TTS Rules
('Local TTS Priority', '.*', 'tts', 8, 1),
('Coqui TTS Fallback', '.*', 'tts', 9, 2),
('Cloud TTS Fallback', '.*', 'tts', 10, 3),

-- STT Rules
('Local STT Priority', '.*', 'stt', 12, 1),
('Whisper STT Fallback', '.*', 'stt', 13, 2),
('Cloud STT Fallback', '.*', 'stt', 14, 3),

-- Image Generation Rules
('Stable Diffusion Local', 'image|picture|photo|generate.*image', 'image', 16, 1),
('Cloud Image Fallback', 'image|picture|photo|generate.*image', 'image', 17, 2),

-- Video Generation Rules
('RunwayML Video', 'video|animation|movie|generate.*video', 'video', 19, 1),
('Pika Video Fallback', 'video|animation|movie|generate.*video', 'video', 20, 2),

-- News Rules
('News API Priority', 'news|latest|current|recent', 'news', 22, 1),
('Mediastack Fallback', 'news|latest|current|recent', 'news', 23, 2),
('GNews Fallback', 'news|latest|current|recent', 'news', 24, 3),

-- Weather Rules
('Weather API Priority', 'weather|temperature|forecast|climate', 'weather', 26, 1),
('Open-Meteo Fallback', 'weather|temperature|forecast|climate', 'weather', 27, 2),

-- Geo Rules
('OpenStreetMap Location', 'location|place|address|where|map', 'geo', 28, 1),

-- Communication Rules
('Mailgun Email', 'email|mail|send.*email', 'email', 29, 1),
('Twilio SMS', 'sms|text|message|send.*sms', 'sms', 30, 1),

-- Search Rules
('SerpAPI Search', 'search|find|lookup|google', 'search', 31, 1),
('You.com AI Search', 'search.*ai|ai.*search|intelligent.*search', 'search', 32, 2),
('Bing Search', 'search|find|lookup|bing', 'search', 33, 3);

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

-- Image Generation table
CREATE TABLE IF NOT EXISTS image_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    provider_id INTEGER,
    image_url TEXT,
    image_path TEXT,
    width INTEGER DEFAULT 512,
    height INTEGER DEFAULT 512,
    style TEXT, -- 'realistic', 'artistic', 'cartoon', etc.
    processing_time INTEGER, -- milliseconds
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Video Generation table
CREATE TABLE IF NOT EXISTS video_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    provider_id INTEGER,
    video_url TEXT,
    video_path TEXT,
    duration INTEGER, -- seconds
    fps INTEGER DEFAULT 24,
    resolution TEXT DEFAULT '1920x1080',
    processing_time INTEGER, -- milliseconds
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Communication table (Email/SMS)
CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'email', 'sms'
    provider_id INTEGER,
    recipient TEXT NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- User Locations table for Geo services
CREATE TABLE IF NOT EXISTS user_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    city TEXT,
    country TEXT,
    timezone TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_image_generations_provider_id ON image_generations(provider_id);
CREATE INDEX IF NOT EXISTS idx_image_generations_status ON image_generations(status);
CREATE INDEX IF NOT EXISTS idx_image_generations_created_at ON image_generations(created_at);

CREATE INDEX IF NOT EXISTS idx_video_generations_provider_id ON video_generations(provider_id);
CREATE INDEX IF NOT EXISTS idx_video_generations_status ON video_generations(status);
CREATE INDEX IF NOT EXISTS idx_video_generations_created_at ON video_generations(created_at);

CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_last_updated ON user_locations(last_updated); 

-- Backup History table
CREATE TABLE IF NOT EXISTS backup_history (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'github', 'google_drive', 'local'
    status TEXT NOT NULL, -- 'pending', 'in_progress', 'completed', 'failed'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    file_size INTEGER,
    error TEXT
); 