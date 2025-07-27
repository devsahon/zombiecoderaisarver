# AI Server - Multi-Service Architecture

## বাংলা ভাষায় পরিচিতি
এই AI সার্ভার সিস্টেমটি একটি মডুলার মাইক্রোসার্ভিস আর্কিটেকচার যা AI মডেল, ভয়েস প্রসেসিং, SMS এবং অন্যান্য সার্ভিস পরিচালনা করে। সিস্টেমটি বাংলা এবং ইংরেজি উভয় ভাষায় কাজ করে।

## System Overview
A modular microservices-based AI system with voice processing, SMS integration, and multi-language support.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Panel (Next.js)                    │
│                    Port: 3000                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                    API Gateway (Nginx/Caddy)                │
│                    Port: 80/443                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┬─────────────────────┬─────────────────┐
│   AI Server         │   Voice Server      │   SMS Server    │
│   (Python/Flask)    │   (Python/FastAPI)  │   (Node.js)     │
│   Port: 8000        │   Port: 8001        │   Port: 8002    │
└─────────────────────┴─────────────────────┴─────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                    Shared Database Layer                    │
│              MySQL + Redis + File Storage                  │
└─────────────────────────────────────────────────────────────┘
```

## Services

### Core Services
- **AI Server** (Port 8000): Agent management, dispatcher, providers
- **Voice Server** (Port 8001): TTS/STT, voice chat, audio processing
- **SMS Server** (Port 8002): SMS integration, notifications
- **Admin Server** (Port 3000): Dashboard, user management, monitoring

### Feature Services
- **License Service**: License validation, user permissions
- **Backup Service**: Google Drive + GitHub integration
- **Documentation Service**: Auto-generated docs, user guides
- **Analytics Service**: Usage tracking, performance metrics

## Windows Installation Guide

### Step 1: Install Python
1. Download Python 3.11+ from https://www.python.org/downloads/
2. Install with "Add Python to PATH" checked
3. Restart your computer

### Step 2: Install MySQL
1. Download MySQL 8.0+ from https://dev.mysql.com/downloads/mysql/
2. Install with default settings
3. Set root password as: `105585`
4. Configure port as: `3307`

### Step 3: Install Redis (Optional)
```bash
# Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
# Or use WSL2 for Redis installation
```

### Step 4: Setup Virtual Environment
```bash
# Open Command Prompt in the server-backup folder
python -m venv venv
venv\Scripts\activate
```

### Step 5: Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install additional packages for Windows
pip install pyaudio
pip install pyttsx3
```

### Step 6: Environment Configuration
Create a `.env` file in the server-backup folder:

```env
# Database Configuration
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3307
DATABASE_USER=root
DATABASE_PASSWORD=105585
DATABASE_NAME=modelsraver1

# AI Providers
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Server Configuration
AI_SERVER_PORT=8000
VOICE_SERVER_PORT=8001
SMS_SERVER_PORT=8002
ADMIN_SERVER_PORT=3000

# Language Configuration
DEFAULT_LANGUAGE=bn  # bn for Bengali, en for English
```

### Step 7: Database Setup
```bash
# Create database
mysql -u root -p105585 -e "CREATE DATABASE IF NOT EXISTS modelsraver1;"

# Run database migrations (if available)
python -m alembic upgrade head
```

### Step 8: Start Servers
```bash
# Start all servers
python start_servers.py

# Or start individual servers
python app.py                    # AI Server
python voice-server/app.py       # Voice Server
python sms-server/app.py         # SMS Server
```

## Service Details

### AI Server (Port 8000)
- **Purpose**: Main AI processing and agent management
- **Features**: 
  - Multi-provider AI integration (OpenAI, Anthropic, etc.)
  - Agent creation and management
  - Request routing and dispatching
  - Model registry and management

### Voice Server (Port 8001)
- **Purpose**: Voice processing and audio management
- **Features**:
  - Text-to-Speech (TTS) with Bengali support
  - Speech-to-Text (STT) with Bengali support
  - Voice chat functionality
  - Audio file processing

### SMS Server (Port 8002)
- **Purpose**: SMS integration and notifications
- **Features**:
  - SMS sending and receiving
  - Template management
  - Notification system
  - Multi-provider support

## API Endpoints

### AI Server APIs
```
POST /api/chat              # Chat with AI
POST /api/agents/create      # Create new agent
GET  /api/agents/list        # List all agents
POST /api/models/register    # Register new model
```

### Voice Server APIs
```
POST /api/tts               # Text to Speech
POST /api/stt               # Speech to Text
POST /api/voice-chat        # Voice chat
GET  /api/voices/list       # List available voices
```

### SMS Server APIs
```
POST /api/sms/send          # Send SMS
GET  /api/sms/history       # SMS history
POST /api/templates/create  # Create SMS template
```

## Language Support

### Bengali Language Features
- **TTS Support**: Bengali text-to-speech
- **STT Support**: Bengali speech recognition
- **Interface**: Bengali admin interface
- **Commands**: Bengali voice commands
- **Responses**: Bengali AI responses

### Language Configuration
```python
# Set default language to Bengali
DEFAULT_LANGUAGE = "bn"

# Available languages
SUPPORTED_LANGUAGES = ["en", "bn", "hi", "ur"]
```

## Troubleshooting

### Common Issues

1. **Python not found:**
   - Install Python from https://www.python.org/
   - Add Python to PATH during installation

2. **MySQL connection failed:**
   - Ensure MySQL is running on port 3307
   - Check username/password in .env file
   - Verify database exists

3. **Audio issues (Windows):**
   - Install Microsoft Visual C++ Redistributable
   - Install PyAudio: `pip install pyaudio`
   - Check microphone permissions

4. **Port already in use:**
   ```bash
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

5. **Virtual environment issues:**
   ```bash
   # Recreate virtual environment
   rmdir /s venv
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

## Development

### Project Structure
```
server-backup/
├── ai-server/              # AI Service (Port 8000)
│   ├── agents/             # Agent Plugins
│   ├── providers/          # AI Providers
│   ├── dispatcher/         # Request Routing
│   └── api/                # AI APIs
├── voice-server/           # Voice Service (Port 8001)
│   ├── tts/                # Text-to-Speech
│   ├── stt/                # Speech-to-Text
│   ├── voice-chat/         # Voice Chat
│   └── api/                # Voice APIs
├── sms-server/             # SMS Service (Port 8002)
│   ├── providers/          # SMS Providers
│   ├── templates/          # SMS Templates
│   └── api/                # SMS APIs
├── shared/                 # Shared Resources
│   ├── database/           # Database schemas
│   ├── utils/              # Common utilities
│   └── config/             # Shared configs
├── requirements.txt        # Python dependencies
├── start_servers.py        # Server launcher
└── README.md
```

### Adding New Services
1. Create new service folder
2. Add service configuration
3. Update start_servers.py
4. Add service to API gateway
5. Update documentation

## Monitoring

### Health Checks
```bash
# Check all services
python status_check.py

# Check individual services
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

### Logs
- **AI Server**: `logs/ai-server.log`
- **Voice Server**: `logs/voice-server.log`
- **SMS Server**: `logs/sms-server.log`

## Support

- **Documentation**: Check docs/ folder
- **Issues**: Check logs/ folder for errors
- **Configuration**: Review .env file

## License

This project is licensed under the MIT License. 