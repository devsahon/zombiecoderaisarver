# 🚀 ZombieCoder AI Management System

একটি মডুলার, মাইক্রোসার্ভিস-ভিত্তিক AI সিস্টেম যেখানে প্রতিটি ফিচার আলাদা সার্ভিস হিসাবে চলবে এবং এডমিন প্যানেলের মাধ্যমে কেন্দ্রীয়ভাবে ম্যানেজ করা যাবে।

## 📋 System Overview

ZombieCoder is a multi-agent, extensible AI system where admins, editors, and users can use multiple agents, providers, voices, and memory features. The system is designed with a modular microservices architecture for scalability and maintainability.

## 🏗️ Architecture Design

### Modular Microservices Architecture

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
│              SQLite + Redis + File Storage                 │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
zombiecoderaisarver/
├── admin/                          # Admin Panel (Next.js)
│   ├── app/
│   │   ├── admin/
│   │   │   ├── server/            # Server Management
│   │   │   ├── voice/             # Voice Studio
│   │   │   ├── providers/         # Provider Management
│   │   │   ├── models/            # AI Models
│   │   │   └── productivity/      # Productivity Tools
│   │   └── api/                   # Admin APIs
│   ├── components/
│   │   ├── ui/                    # UI Components
│   │   ├── auth-guard.tsx         # Authentication Guard
│   │   └── dynamic-admin-sidebar.tsx
│   ├── lib/
│   │   ├── database.ts            # Database Functions
│   │   ├── database-schema.sql    # Database Schema
│   │   └── language-context.tsx   # Language Context
│   ├── package.json
│   ├── package-lock.json
│   └── admin_database.sql         # Database Export
├── sarver/                        # Server Services
│   ├── simple_server.py           # Main Server (Port 8000)
│   ├── voice-server/              # Voice Service (Port 8001)
│   │   ├── app.py
│   │   ├── config/
│   │   └── requirements.txt
│   ├── ai-server/                 # AI Service (Port 8002)
│   │   ├── app.py
│   │   └── requirements.txt
│   └── venv/                      # Python Virtual Environment
├── docs/                          # Documentation
└── README.md                      # This file
```

## 🎯 Features

### ✅ Completed Features

1. **Admin Panel**
   - Authentication system with admin login
   - Dynamic sidebar navigation
   - Server status monitoring
   - Voice studio interface
   - Provider management system

2. **Server Management**
   - Real-time server status monitoring
   - Dynamic status updates
   - Server health checks
   - Performance metrics

3. **Provider Management**
   - AI, TTS, STT, News, Weather providers
   - Provider status toggle (on/off)
   - Priority-based routing
   - Fallback mechanisms
   - Request rate limiting

4. **Voice Integration**
   - Text-to-Speech (TTS)
   - Speech-to-Text (STT)
   - Voice chat capabilities
   - Audio device management

5. **Database System**
   - SQLite database with comprehensive schema
   - Server logs and metrics
   - Provider logs and performance tracking
   - Storage system for caching and context

6. **Smart Routing System**
   - Storage-first approach (cache checking)
   - Local provider priority
   - Cloud provider fallback
   - Latency-based switching
   - Automatic caching

### 🚧 In Progress Features

1. **AI Agent System**
   - Agent plugin architecture
   - Dynamic agent loading
   - Agent training system
   - Memory management

2. **SMS Integration**
   - SMS provider integration
   - Template management
   - Notification system

3. **Advanced Analytics**
   - Usage tracking
   - Performance metrics
   - Real-time monitoring

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/devsahon/zombiecoderaisarver.git
   cd zombiecoderaisarver
   ```

2. **Setup Admin Panel**
   ```bash
   cd admin
   npm install
   npm run dev
   ```

3. **Setup Server Services**
   ```bash
   cd ../sarver
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Initialize Database**
   ```bash
   cd ../admin
   # The database will be automatically created on first run
   ```

5. **Start Services**
   ```bash
   # Start main server
   cd ../sarver
   python simple_server.py
   
   # Start voice server (in new terminal)
   cd voice-server
   python app.py
   
   # Start AI server (in new terminal)
   cd ../ai-server
   python app.py
   ```

### Default Credentials

- **Admin Panel**: http://localhost:3000/admin
- **Username**: admin
- **Password**: admin123

## 🌐 API Endpoints

### Admin APIs
- `GET /api/server-status` - Server status monitoring
- `GET /api/voice-status` - Voice server status
- `GET /api/providers` - Provider management
- `POST /api/providers` - Update provider status
- `GET /api/storage` - Storage management
- `POST /api/dispatcher` - Request routing

### Server APIs
- `GET /api/status` - Server health check
- `GET /api/agents` - Agent information
- `GET /api/logs` - Server logs
- `GET /api/providers` - Provider status

## 🗄️ Database Schema

The system uses SQLite with the following main tables:

- **servers** - Server information and status
- **server_logs** - Server activity logs
- **providers** - AI/TTS/STT provider configuration
- **provider_logs** - Provider usage logs
- **storage** - Caching and context storage
- **dispatcher_rules** - Request routing rules
- **admins** - Admin user accounts

## 🔄 Provider System

### Supported Providers

1. **AI Models**
   - Local AI Model (Port 8002)
   - OpenAI GPT-4
   - Mistral AI
   - TogetherAI

2. **Text-to-Speech**
   - Local TTS (Port 8001)
   - Google TTS

3. **Speech-to-Text**
   - Local STT (Port 8001)
   - Google STT

4. **External Services**
   - News API
   - Weather API

### Smart Routing Logic

1. **Storage Check** - First check if result exists in cache
2. **Local Priority** - Try local providers first
3. **Cloud Fallback** - Use cloud providers if local fails
4. **Latency Monitoring** - Switch if response time exceeds threshold
5. **Auto Caching** - Cache successful responses for future use

## 🛡️ Security Features

- JWT-based authentication
- API key management
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection

## 📊 Monitoring & Analytics

- Real-time server status
- Provider performance metrics
- Request/response logging
- Error tracking
- Resource usage monitoring

## 🚀 Deployment

### Development
```bash
npm run dev          # Admin panel
python app.py        # Server services
```

### Production
```bash
npm run build        # Build admin panel
npm start           # Start production server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

- **Email**: devsahonsrabon@gmail.com
- **GitHub**: https://github.com/devsahon/zombiecoderaisarver

## 🎯 Roadmap

### Phase 1: Core Infrastructure ✅
- Admin Panel Setup
- Database Integration
- Authentication System
- Basic API Structure

### Phase 2: Service Architecture ✅
- Modular Service Setup
- Provider Management
- Smart Routing System
- Storage & Caching

### Phase 3: Agent System 🚧
- Agent Plugin Architecture
- Dynamic Agent Loading
- Agent Training System
- Memory Management

### Phase 4: Advanced Features 📋
- SMS Integration
- Backup System
- Analytics Dashboard
- Real-time Monitoring

---

**Made with ❤️ by DevSahon**

*This project is actively maintained and updated regularly.* 