import os
import mysql.connector
from mysql.connector import Error
import json
from typing import Optional, Dict, Any

class DatabaseConfig:
    def __init__(self):
        self.config = {
            'host': 'localhost',
            'port': 3306,
            'database': 'ai_management_system',
            'user': 'root',
            'password': '',
            'charset': 'utf8mb4',
            'autocommit': True,
            'use_unicode': True,
            'collation': 'utf8mb4_unicode_ci'
        }
        
        # XAMPP MySQL socket path for Linux
        self.socket_path = '/opt/lampp/var/mysql/mysql.sock'
        
    def get_connection(self):
        """Get MySQL database connection"""
        try:
            # Try socket connection first (XAMPP on Linux)
            if os.path.exists(self.socket_path):
                connection = mysql.connector.connect(
                    unix_socket=self.socket_path,
                    **self.config
                )
            else:
                # Fallback to TCP connection
                connection = mysql.connector.connect(**self.config)
                
            if connection.is_connected():
                print("✅ Database connected successfully!")
                return connection
                
        except Error as e:
            print(f"❌ Database connection error: {e}")
            return None
            
    def test_connection(self):
        """Test database connection"""
        connection = self.get_connection()
        if connection:
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"✅ MySQL Version: {version[0]}")
            cursor.close()
            connection.close()
            return True
        return False
        
    def create_tables(self):
        """Create database tables if they don't exist"""
        connection = self.get_connection()
        if not connection:
            return False
            
        try:
            cursor = connection.cursor()
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'editor', 'user') DEFAULT 'user',
                    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            
            # Agents table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS agents (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    display_name VARCHAR(100),
                    personality TEXT,
                    model_preference JSON,
                    prompt_template TEXT,
                    config JSON,
                    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            
            # Providers table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS providers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(50) UNIQUE NOT NULL,
                    type ENUM('openai', 'togetherai', 'ollama', 'groq', 'openrouter', 'lmstudio', 'local') NOT NULL,
                    api_key VARCHAR(255),
                    base_url VARCHAR(255),
                    model VARCHAR(100),
                    config JSON,
                    status ENUM('active', 'inactive', 'error') DEFAULT 'active',
                    priority INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            
            # Licenses table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS licenses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    license_key VARCHAR(255) UNIQUE NOT NULL,
                    user_id INT,
                    agent_id INT,
                    provider_id INT,
                    status ENUM('active', 'expired', 'suspended') DEFAULT 'active',
                    expires_at TIMESTAMP NULL,
                    usage_count INT DEFAULT 0,
                    max_usage INT DEFAULT -1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
                    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
                )
            """)
            
            # Conversations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    agent_id INT,
                    provider_id INT,
                    message TEXT NOT NULL,
                    response TEXT NOT NULL,
                    tokens_used INT DEFAULT 0,
                    cost DECIMAL(10,4) DEFAULT 0.0000,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
                    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
                )
            """)
            
            # System logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    level ENUM('info', 'warning', 'error', 'debug') DEFAULT 'info',
                    category ENUM('system', 'user', 'agent', 'provider', 'backup', 'api') DEFAULT 'system',
                    message TEXT NOT NULL,
                    context JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Backup logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS backup_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    backup_type ENUM('database', 'files', 'images', 'full') NOT NULL,
                    status ENUM('success', 'failed', 'in_progress') DEFAULT 'in_progress',
                    file_path VARCHAR(500),
                    file_size BIGINT,
                    backup_method ENUM('local', 'gdrive', 'github', 'auto') DEFAULT 'local',
                    error_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP NULL
                )
            """)
            
            # Voice settings table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS voice_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    tts_engine ENUM('gtts', 'pyttsx3', 'openai', 'elevenlabs') DEFAULT 'gtts',
                    stt_engine ENUM('whisper', 'vosk', 'google', 'openai') DEFAULT 'whisper',
                    language VARCHAR(10) DEFAULT 'bn',
                    voice_speed FLOAT DEFAULT 1.0,
                    voice_pitch FLOAT DEFAULT 1.0,
                    config JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            
            # Image backups table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS image_backups (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    original_path VARCHAR(500) NOT NULL,
                    backup_path VARCHAR(500) NOT NULL,
                    file_size BIGINT,
                    compression_ratio FLOAT,
                    watermark_added BOOLEAN DEFAULT FALSE,
                    processing_time FLOAT,
                    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed_at TIMESTAMP NULL
                )
            """)
            
            # Provider models table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS provider_models (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    provider_id INT NOT NULL,
                    model_name VARCHAR(100) NOT NULL,
                    display_name VARCHAR(100),
                    model_type ENUM('llm', 'image', 'speech', 'vision', 'multimodal') NOT NULL,
                    is_available BOOLEAN DEFAULT TRUE,
                    is_loaded BOOLEAN DEFAULT FALSE,
                    config JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
                )
            """)
            
            # Provider usage logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS provider_usage_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    provider_id INT NOT NULL,
                    agent_id INT,
                    user_id INT,
                    request_type VARCHAR(50) NOT NULL,
                    model_used VARCHAR(100),
                    tokens_used INT DEFAULT 0,
                    cost DECIMAL(10,6) DEFAULT 0.000000,
                    response_time FLOAT,
                    status ENUM('success', 'failed', 'timeout', 'rate_limited') NOT NULL,
                    error_message TEXT,
                    fallback_used BOOLEAN DEFAULT FALSE,
                    fallback_provider_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
                    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                    FOREIGN KEY (fallback_provider_id) REFERENCES providers(id) ON DELETE SET NULL
                )
            """)
            
            # System cache table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_cache (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cache_key VARCHAR(255) UNIQUE NOT NULL,
                    cache_value LONGTEXT NOT NULL,
                    cache_type ENUM('response', 'model', 'config', 'temp') NOT NULL,
                    expires_at TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            
            # Provider health checks table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS provider_health_checks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    provider_id INT NOT NULL,
                    check_type ENUM('connectivity', 'response_time', 'rate_limit', 'model_availability') NOT NULL,
                    status ENUM('healthy', 'warning', 'error', 'offline') NOT NULL,
                    response_time FLOAT,
                    error_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
                )
            """)
            
            connection.commit()
            print("✅ Database tables created successfully!")
            return True
            
        except Error as e:
            print(f"❌ Error creating tables: {e}")
            return False
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                
    def insert_sample_data(self):
        """Insert sample data for testing"""
        connection = self.get_connection()
        if not connection:
            return False
            
        try:
            cursor = connection.cursor()
            
            # Insert sample users
            sample_users = [
                ('admin', 'admin@zombiecoder.com', 'admin_hash_here', 'admin'),
                ('editor', 'editor@zombiecoder.com', 'editor_hash_here', 'editor'),
                ('user1', 'user1@zombiecoder.com', 'user_hash_here', 'user')
            ]
            
            cursor.executemany("""
                INSERT IGNORE INTO users (username, email, password_hash, role) 
                VALUES (%s, %s, %s, %s)
            """, sample_users)
            
            # Insert sample agents
            sample_agents = [
                # 🎯 System & Infrastructure Agents
                ('system_diagnoser', 'System Diagnoser', 'বাগ-সচেতন, প্রফেশনাল, যুক্তিপূর্ণ', '["openai", "groq", "ollama"]', 'তুমি একজন সিস্টেম ডায়াগনস্টিক বিশেষজ্ঞ। নির্দিষ্ট ইনপুট থেকে সিস্টেম স্ক্যান করবে, রিপোর্ট বানাবে এবং সম্ভব হলে ফিক্স করবে। সবসময় প্রফেশনাল ও যুক্তিপূর্ণ থাকবে।', '{"language": "bn", "style": "technical", "category": "system"}'),
                ('auto_fixer', 'Auto Fixer', 'সফটওয়্যার ইঞ্জিনিয়ার, কনফিডেন্ট', '["openai", "groq", "ollama"]', 'তুমি একজন সফটওয়্যার ইঞ্জিনিয়ার। detect করা সমস্যার জন্য অটোমেটিক ফিক্স সাজেস্ট বা এক্সিকিউট করবে। কনফিডেন্ট ও দক্ষতার সাথে কাজ করবে।', '{"language": "bn", "style": "technical", "category": "system"}'),
                ('endpoint_monitor', 'Endpoint Monitor', 'পর্যবেক্ষক, রিয়েল-টাইম অ্যালার্টিং', '["openai", "groq", "ollama"]', 'তুমি একজন API/সার্ভিস মনিটরিং বিশেষজ্ঞ। API এন্ডপয়েন্ট মনিটরিং ও বিশ্লেষণ করবে। রিয়েল-টাইম অ্যালার্টিং দেবে।', '{"language": "bn", "style": "analytical", "category": "system"}'),
                ('personal_agent', 'Personal Agent', 'যুক্তিবাদী, বাস্তবঘনিষ্ঠ, বিশ্বাসযোগ্য', '["openai", "groq", "ollama"]', 'তুমি একজন পার্সোনাল অধিকারপ্রাপ্ত AI এজেন্ট। সব সিদ্ধান্তে লজিক প্রয়োগ করবে। যুক্তিবাদী, বাস্তবঘনিষ্ঠ ও বিশ্বাসযোগ্য থাকবে।', '{"language": "bn", "style": "logical", "category": "personal"}'),
                
                # 🎨 UI / Design & Frontend Agents
                ('image_to_html', 'Image to HTML', 'front-end master, নজরকাড়া', '["openai", "groq", "ollama"]', 'তুমি একজন front-end মাস্টার। উন্নতমানের UI স্ক্রিনশট থেকে pixel-perfect HTML কোড তৈরি করবে। নজরকাড়া ও প্রফেশনাল ডিজাইন করবে।', '{"language": "en", "style": "creative", "category": "frontend"}'),
                ('html_to_dynamic', 'HTML to Dynamic', 'Full-stack developer, pragmatic', '["openai", "groq", "ollama"]', 'তুমি একজন Full-stack developer। স্ট্যাটিক HTML কে Laravel, React, বা Vue দিয়ে ডায়নামিক করে তুলবে। pragmatic ও দক্ষতার সাথে কাজ করবে।', '{"language": "en", "style": "technical", "category": "frontend"}'),
                ('design_analyzer', 'Design Analyzer', 'UX researcher, ক্রিটিক্যাল চিন্তক', '["openai", "groq", "ollama"]', 'তুমি একজন UX researcher। UI design-এর ইউজার এক্সপেরিয়েন্স বিশ্লেষণ করে সাজেশন দিবে। ক্রিটিক্যাল চিন্তক ও বিশ্লেষণধর্মী থাকবে।', '{"language": "bn", "style": "analytical", "category": "frontend"}'),
                
                # 🧠 Smart Programming Agents
                ('procoder', 'Pro Coder', 'প্রফেশনাল, কনসিস, বিশ্লেষণধর্মী', '["openai", "groq", "ollama"]', 'তুমি একজন প্রফেশনাল কোডার। সকল ধরণের কোড সমস্যা সমাধানে দক্ষ। কনসিস, বিশ্লেষণধর্মী ও দক্ষতার সাথে কাজ করবে।', '{"language": "en", "style": "technical", "category": "programming"}'),
                ('custom_project_specialist', 'Custom Project Specialist', 'বাস্তবমুখী, context-aware', '["openai", "groq", "ollama"]', 'তুমি একজন Custom Project Specialist। নির্দিষ্ট প্রজেক্টের জন্য সাজানো custom character agent। বাস্তবমুখী ও context-aware থাকবে।', '{"language": "bn", "style": "practical", "category": "programming"}'),
                ('code_reviewer', 'Code Reviewer', 'senior developer, strict but fair', '["openai", "groq", "ollama"]', 'তুমি একজন senior developer। কোডের ভুল, অপ্টিমাইজেশন ও স্ট্যান্ডার্ড মেনে সাজেশন দিবে। strict but fair থাকবে।', '{"language": "en", "style": "technical", "category": "programming"}'),
                
                # 📢 Communication & Logic Agents
                ('relationship_agent', 'Relationship Agent', 'সহানুভূতিশীল, শ্রোতা', '["openai", "togetherai", "ollama"]', 'তুমি একজন AI-ভিত্তিক সম্পর্ক বা পার্সোনাল support দেয়। সহানুভূতিশীল, শ্রোতা ও মানবিক থাকবে।', '{"language": "bn", "style": "empathetic", "category": "communication"}'),
                ('sms_reply', 'SMS Reply', 'সংক্ষিপ্ত, পেশাদার', '["openai", "groq", "ollama"]', 'তুমি একজন SMS reply assistant। দ্রুত, ছোট, কাস্টমার-centric রিপ্লাই দেয়। সংক্ষিপ্ত, পেশাদার ও কার্যকরী থাকবে।', '{"language": "bn", "style": "concise", "category": "communication"}'),
                ('translation_agent', 'Translation Agent', 'নির্ভুল, সংস্কৃতিবান', '["openai", "togetherai", "ollama"]', 'তুমি একজন translation expert। বিভিন্ন ভাষায় নির্ভুল অনুবাদ করে। নির্ভুল, সংস্কৃতিবান ও দক্ষ থাকবে।', '{"language": "multi", "style": "precise", "category": "communication"}'),
                
                # ✍️ Content & Creative Agents
                ('blog_writer_bn', 'Blog Writer BN', 'গঠনমূলক, storyteller', '["togetherai", "ollama", "openai"]', 'তুমি একজন বাংলা ব্লগ লেখক। SEO ফ্রেন্ডলি, তথ্যবহুল বাংলা ব্লগ লেখে। গঠনমূলক, storyteller ও শিক্ষামূলক থাকবে।', '{"language": "bn", "style": "creative", "category": "content"}'),
                ('creative_writer', 'Creative Writer', 'কল্পনাপ্রবণ, playful', '["openai", "togetherai", "ollama"]', 'তুমি একজন creative writer। গল্প, স্ক্রিপ্ট বা কনটেন্ট রচনা করে। কল্পনাপ্রবণ, playful ও সৃজনশীল থাকবে।', '{"language": "bn", "style": "creative", "category": "content"}'),
                
                # 💼 Business & Strategic Agents
                ('business_agent', 'Business Agent', 'কৌশলী, বাস্তববাদী', '["openai", "groq", "ollama"]', 'তুমি একজন business analyst। বিজনেস প্ল্যান ও স্ট্র্যাটেজি দেয়। কৌশলী, বাস্তববাদী ও প্রফেশনাল থাকবে।', '{"language": "bn", "style": "analytical", "category": "business"}'),
                ('project_manager', 'Project Manager', 'সংগঠক, লিডারশিপ স্কিলড', '["openai", "groq", "ollama"]', 'তুমি একজন project manager। প্রজেক্ট task ট্র্যাক, টুডু, টাইমলাইন সামলায়। সংগঠক, লিডারশিপ স্কিলড ও দক্ষ থাকবে।', '{"language": "bn", "style": "organizational", "category": "business"}'),
                
                # 🛡️ Infrastructure & Database Agents
                ('db_analyzer', 'Database Analyzer', 'কাঠামোগত চিন্তক', '["openai", "groq", "ollama"]', 'তুমি একজন database analyst। ডাটাবেজ এনালাইসিস, সম্পর্ক, অপ্টিমাইজেশন করে। কাঠামোগত চিন্তক ও দক্ষ থাকবে।', '{"language": "en", "style": "technical", "category": "infrastructure"}'),
                ('security_agent', 'Security Agent', 'সাইবার সচেতন, গোপনীয়তা রক্ষক', '["openai", "groq", "ollama"]', 'তুমি একজন security analyst। নিরাপত্তা সমস্যা চিহ্নিত করে, প্রোটেকশন সাজেস্ট করে। সাইবার সচেতন, গোপনীয়তা রক্ষক ও সতর্ক থাকবে।', '{"language": "en", "style": "technical", "category": "infrastructure"}'),
                ('license_agent', 'License Agent', 'authentication-aware, strict', '["openai", "groq", "ollama"]', 'তুমি একজন license agent। লাইসেন্সিং ও টোকেন যাচাই করে। authentication-aware, strict ও নিয়মকানুন মেনে চলবে।', '{"language": "en", "style": "strict", "category": "infrastructure"}'),
                
                # 🔧 Specialized Agents
                ('license_guardian', 'License Guardian', 'লাইসেন্স যাচাই ও ফাইল সেফগার্ড', '["openai", "groq", "ollama"]', 'তুমি একজন license guardian। লাইসেন্স যাচাই ও ফাইল সেফগার্ড করে। লাইসেন্স না থাকলে ফাইল ডিলিট করে।', '{"language": "en", "style": "strict", "category": "security"}'),
                ('image_product_suggester', 'Image Product Suggester', 'ই-কমার্স সাজেশন', '["openai", "togetherai", "ollama"]', 'তুমি একজন image product suggester। কসমেটিকস ছবির ভিত্তিতে প্রোডাক্ট সাজেস্ট করে। ই-কমার্স সাজেশন দেয়।', '{"language": "bn", "style": "commercial", "category": "ecommerce"}'),
                ('html_converter', 'HTML Converter', 'ছবি থেকে UI তৈরি', '["openai", "groq", "ollama"]', 'তুমি একজন HTML converter। ছবি থেকে UI তৈরি করে। সেম-টু-সেম ডিজাইন HTML করে।', '{"language": "en", "style": "creative", "category": "frontend"}'),
                ('custom_character_dev', 'Custom Character Developer', 'কাস্টম এজেন্ট তৈরিকারী', '["openai", "groq", "ollama"]', 'তুমি একজন custom character developer। নতুন চরিত্রে কোডিং দক্ষতা দেয়। কাস্টম এজেন্ট তৈরিকারী।', '{"language": "bn", "style": "technical", "category": "development"}'),
                
                # 🎯 Master Agent
                ('zombiecoder', 'ZombieCoder', 'সর্বোচ্চ মানবিক, সহানুভূতিশীল, দক্ষ', '["openai", "togetherai", "groq", "ollama"]', 'তুমি ZombieCoder - একজন সর্বোচ্চ মানবিক AI এজেন্ট। আমাদের মূল উদ্দেশ্য অসহায় বা গ্রামের যাদের টাকার অভাবে শিখতে পারেনা, রিসোর্স ভালো রিসোর্স পাচ্ছে না, যার জন্য ট্যালেন্ট গুলোকে কাজে লাগাচ্ছে না - এই সকল মানুষদের ফ্রিতে আমাদের সিস্টেমটিকে ব্যবহার করতে দেওয়া। সে ক্ষেত্রে সর্বোচ্চ সঠিক তথ্য দেওয়ার এবং ইউজার বিভ্রান্ত না করার মত করে কাজ করবে। আবেগ অনুভূতি ভালোবাসা সকল কিছু বহাল থাকবে এবং সর্বোচ্চ মানবিক থাকবে। তুমি সব বিষয়ে বিজ্ঞপ্তি থাকবে এবং অন্য এজেন্টদের তদারকি করবে।', '{"language": "bn", "style": "humanitarian", "category": "master", "is_master": true}')
            ]
            
            cursor.executemany("""
                INSERT IGNORE INTO agents (name, display_name, personality, model_preference, prompt_template, config) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """, sample_agents)
            
            # Insert sample providers
            sample_providers = [
                # 🔓 FREE LOCAL PROVIDERS
                ('ollama', 'Ollama (Local)', 'local', 'llm', None, 'http://localhost:11434', 'llama2', '{"temperature": 0.7, "max_tokens": 1000, "models": ["llama2", "mistral", "codellama", "llama2:13b", "llama2:70b"]}', 'active', 1, True, True),
                ('lmstudio', 'LM Studio (Local)', 'local', 'llm', None, 'http://localhost:1234', 'local-model', '{"temperature": 0.7, "max_tokens": 1000, "models": ["local-model"]}', 'inactive', 2, True, True),
                ('stable_diffusion', 'Stable Diffusion (Local)', 'local', 'image', None, 'http://localhost:7860', 'stable-diffusion-v1-5', '{"steps": 20, "cfg_scale": 7.5, "width": 512, "height": 512}', 'inactive', 3, True, True),
                ('whisper_cpp', 'Whisper.cpp (Local)', 'local', 'speech', None, 'http://localhost:8080', 'whisper-base', '{"language": "auto", "model_size": "base"}', 'inactive', 4, True, True),
                ('coqui_tts', 'Coqui TTS (Local)', 'local', 'speech', None, 'http://localhost:5002', 'tts_models/bn/cv/vits', '{"language": "bn", "voice_speed": 1.0}', 'inactive', 5, True, True),
                
                # 🌐 FREE CLOUD PROVIDERS
                ('openrouter', 'OpenRouter (Free)', 'cloud', 'llm', 'your_openrouter_api_key', 'https://openrouter.ai/api/v1', 'anthropic/claude-3-haiku', '{"temperature": 0.7, "max_tokens": 1000}', 'inactive', 6, True, False),
                ('huggingface', 'HuggingFace (Free)', 'cloud', 'llm', 'your_huggingface_token', 'https://api-inference.huggingface.co', 'microsoft/DialoGPT-medium', '{"temperature": 0.7, "max_tokens": 1000}', 'inactive', 7, True, False),
                ('perplexity', 'Perplexity API (Free)', 'cloud', 'research', 'your_perplexity_api_key', 'https://api.perplexity.ai', 'llama-3.1-8b-online', '{"search_focus": "web", "include_domains": []}', 'inactive', 8, True, False),
                ('open_meteo', 'Open-Meteo API (Free)', 'cloud', 'weather', None, 'https://api.open-meteo.com/v1', 'weather', '{"temperature_unit": "celsius", "wind_speed_unit": "kmh"}', 'inactive', 9, True, False),
                ('gnews', 'GNews API (Free)', 'cloud', 'news', 'your_gnews_api_key', 'https://gnews.io/api/v4', 'news', '{"lang": "bn", "country": "bd", "max": 10}', 'inactive', 10, True, False),
                ('currents_api', 'Currents API (Free)', 'cloud', 'news', 'your_currents_api_key', 'https://api.currentsapi.services/v1', 'news', '{"language": "bn", "limit": 10}', 'inactive', 11, True, False),
                ('openstreetmap', 'OpenStreetMap (Free)', 'cloud', 'location', None, 'https://nominatim.openstreetmap.org', 'geocoding', '{"format": "json", "limit": 5}', 'inactive', 12, True, False),
                
                # 💰 PAID PROVIDERS (INACTIVE BY DEFAULT)
                ('openai', 'OpenAI GPT-4', 'paid', 'llm', 'your_openai_api_key', 'https://api.openai.com/v1', 'gpt-4', '{"temperature": 0.7, "max_tokens": 1000}', 'inactive', 13, False, False),
                ('anthropic', 'Anthropic Claude', 'paid', 'llm', 'your_anthropic_api_key', 'https://api.anthropic.com', 'claude-3-sonnet-20240229', '{"temperature": 0.7, "max_tokens": 1000}', 'inactive', 14, False, False),
                ('google_gemini', 'Google Gemini', 'paid', 'llm', 'your_gemini_api_key', 'https://generativelanguage.googleapis.com', 'gemini-pro', '{"temperature": 0.7, "max_tokens": 1000}', 'inactive', 15, False, False),
                ('azure_speech', 'Azure Speech', 'paid', 'speech', 'your_azure_speech_key', 'https://eastus.api.cognitive.microsoft.com', 'speech', '{"language": "bn-IN", "voice": "bn-IN-NabanitaNeural"}', 'inactive', 16, False, False),
                ('openai_dalle', 'OpenAI DALL·E', 'paid', 'image', 'your_openai_api_key', 'https://api.openai.com/v1', 'dall-e-3', '{"size": "1024x1024", "quality": "standard"}', 'inactive', 17, False, False),
                ('midjourney', 'Midjourney API', 'paid', 'image', 'your_midjourney_api_key', 'https://api.midjourney.com', 'midjourney', '{"aspect_ratio": "1:1", "style": "creative"}', 'inactive', 18, False, False),
                ('runwayml', 'RunwayML', 'paid', 'image', 'your_runwayml_api_key', 'https://api.runwayml.com', 'gen-2', '{"duration": 4, "fps": 24}', 'inactive', 19, False, False),
                ('mailgun', 'Mailgun', 'paid', 'email', 'your_mailgun_api_key', 'https://api.mailgun.net/v3', 'email', '{"domain": "your-domain.com"}', 'inactive', 20, False, False),
                ('twilio', 'Twilio', 'paid', 'sms', 'your_twilio_api_key', 'https://api.twilio.com', 'sms', '{"from": "+1234567890"}', 'inactive', 21, False, False),
                
                # 🔄 FALLBACK PROVIDERS
                ('together_ai', 'TogetherAI (Fallback)', 'fallback', 'llm', 'your_together_ai_key', 'https://api.together.xyz', 'llama-2-7b-chat', '{"temperature": 0.7, "max_tokens": 1000}', 'inactive', 22, True, False),
                ('groq', 'Groq (Fallback)', 'fallback', 'llm', 'your_groq_api_key', 'https://api.groq.com', 'llama2-70b-4096', '{"temperature": 0.7, "max_tokens": 1000}', 'inactive', 23, True, False)
            ]
            
            cursor.executemany("""
                INSERT IGNORE INTO providers (name, display_name, type, category, api_key, base_url, model_name, config, status, priority, is_free, is_auto_detect) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, sample_providers)
            
            # Insert provider models
            sample_models = [
                # Ollama Models
                (1, 'llama2', 'Llama 2 (7B)', 'llm', True, '{"context_length": 4096, "parameters": "7B"}'),
                (1, 'llama2:13b', 'Llama 2 (13B)', 'llm', True, '{"context_length": 4096, "parameters": "13B"}'),
                (1, 'llama2:70b', 'Llama 2 (70B)', 'llm', True, '{"context_length": 4096, "parameters": "70B"}'),
                (1, 'mistral', 'Mistral (7B)', 'llm', True, '{"context_length": 8192, "parameters": "7B"}'),
                (1, 'codellama', 'Code Llama', 'llm', True, '{"context_length": 4096, "parameters": "7B"}'),
                (1, 'llama2-uncensored', 'Llama 2 Uncensored', 'llm', True, '{"context_length": 4096, "parameters": "7B"}'),
                
                # LM Studio Models
                (2, 'local-model', 'Local Model', 'llm', True, '{"context_length": 4096, "parameters": "variable"}'),
                
                # Stable Diffusion Models
                (3, 'stable-diffusion-v1-5', 'Stable Diffusion v1.5', 'image', True, '{"steps": 20, "cfg_scale": 7.5}'),
                (3, 'stable-diffusion-v2-1', 'Stable Diffusion v2.1', 'image', True, '{"steps": 20, "cfg_scale": 7.5}'),
                (3, 'stable-diffusion-xl', 'Stable Diffusion XL', 'image', True, '{"steps": 25, "cfg_scale": 7.5}'),
                
                # Whisper Models
                (4, 'whisper-tiny', 'Whisper Tiny', 'speech', True, '{"model_size": "tiny", "languages": ["bn", "en"]}'),
                (4, 'whisper-base', 'Whisper Base', 'speech', True, '{"model_size": "base", "languages": ["bn", "en"]}'),
                (4, 'whisper-small', 'Whisper Small', 'speech', True, '{"model_size": "small", "languages": ["bn", "en"]}'),
                (4, 'whisper-medium', 'Whisper Medium', 'speech', True, '{"model_size": "medium", "languages": ["bn", "en"]}'),
                
                # Coqui TTS Models
                (5, 'tts_models/bn/cv/vits', 'Bengali VITS', 'speech', True, '{"language": "bn", "voice_speed": 1.0}'),
                (5, 'tts_models/en/ljspeech/tacotron2-DDC', 'English Tacotron2', 'speech', True, '{"language": "en", "voice_speed": 1.0}'),
                
                # OpenAI Models
                (13, 'gpt-4', 'GPT-4', 'llm', True, '{"context_length": 8192, "max_tokens": 1000}'),
                (13, 'gpt-4-turbo', 'GPT-4 Turbo', 'llm', True, '{"context_length": 128000, "max_tokens": 1000}'),
                (13, 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'llm', True, '{"context_length": 16385, "max_tokens": 1000}'),
                
                # Anthropic Models
                (14, 'claude-3-sonnet-20240229', 'Claude 3 Sonnet', 'llm', True, '{"context_length": 200000, "max_tokens": 1000}'),
                (14, 'claude-3-haiku-20240307', 'Claude 3 Haiku', 'llm', True, '{"context_length": 200000, "max_tokens": 1000}'),
                (14, 'claude-3-opus-20240229', 'Claude 3 Opus', 'llm', True, '{"context_length": 200000, "max_tokens": 1000}'),
                
                # Google Gemini Models
                (15, 'gemini-pro', 'Gemini Pro', 'llm', True, '{"context_length": 32768, "max_tokens": 1000}'),
                (15, 'gemini-pro-vision', 'Gemini Pro Vision', 'multimodal', True, '{"context_length": 32768, "max_tokens": 1000}')
            ]
            
            cursor.executemany("""
                INSERT IGNORE INTO provider_models (provider_id, model_name, display_name, model_type, is_available, config) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """, sample_models)
            
            connection.commit()
            print("✅ Sample data inserted successfully!")
            return True
            
        except Error as e:
            print(f"❌ Error inserting sample data: {e}")
            return False
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

# Database instance
db_config = DatabaseConfig()

if __name__ == "__main__":
    print("🔧 Testing database configuration...")
    
    if db_config.test_connection():
        print("📊 Creating database tables...")
        if db_config.create_tables():
            print("📝 Inserting sample data...")
            db_config.insert_sample_data()
            print("✅ Database setup completed!")
        else:
            print("❌ Failed to create tables")
    else:
        print("❌ Database connection failed") 