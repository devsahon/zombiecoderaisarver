# AI Management Dashboard - Admin Panel

## বাংলা ভাষায় পরিচিতি
এই AI ম্যানেজমেন্ট ড্যাশবোর্ড একটি সম্পূর্ণ প্রশাসনিক ইন্টারফেস যা AI মডেল, সার্ভার, ডাটাবেস এবং অন্যান্য সিস্টেম রিসোর্স ম্যানেজ করার জন্য তৈরি করা হয়েছে। সিস্টেমটি বাংলা এবং ইংরেজি উভয় ভাষায় কাজ করে।

## System Overview
A comprehensive AI model management and development toolkit with multi-language support (English and Bengali).

## Features

- 🤖 **AI Model Management** - Monitor and control local AI models
- 💬 **Multi-Language Support** - English and Bengali (বাংলা) interface
- 🎛️ **Admin Panel** - Complete administrative interface with sidebar navigation
- 🔧 **Server Management** - WHM domains, SSH tools, server access
- 💾 **Database Tools** - MySQL management, analysis, and backup
- 🎵 **ElevenLabs Integration** - Voice processing and webhooks
- 📝 **Command Library** - PHP, Node.js, Python, Linux, and Ollama commands
- ⚡ **Development Tools** - Git and Docker command interfaces
- 📊 **Real-time Monitoring** - Performance metrics and system health

## System Requirements

- **RAM:** 16GB minimum
- **Disk Space:** 100GB free space
- **Node.js:** 18+ 
- **OS:** Windows 10/11, macOS, or Linux

## Windows Installation Guide

### Step 1: Install Node.js
1. Download Node.js 18+ from https://nodejs.org/
2. Install with default settings
3. Restart your computer

### Step 2: Install Dependencies
```bash
# Open Command Prompt or PowerShell in the admin-backup folder
npm install
```

### Step 3: Environment Configuration
Create a `.env.local` file in the admin-backup folder:

```env
# AI Management Dashboard Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3307
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3307
DATABASE_USER=root
DATABASE_PASSWORD=105585
DATABASE_NAME=modelsraver1
ELEVENLABS_API_KEY=your_api_key_here
```

### Step 4: Build and Start
```bash
# Build the project
npm run build

# Start the development server
npm run dev
```

### Step 5: Access the Admin Panel
Open your browser and go to: http://localhost:3000/admin

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting

# Backup operations
npm run backup       # Create system backup
npm run backup:create # Manual backup creation
```

## Language Support

The dashboard supports both English and Bengali:

- **English Interface:** Default language
- **Bengali Interface:** বাংলা ইন্টারফেস সাপোর্ট

Switch languages using the language selector in the admin sidebar.

## Admin Panel Sections

### AI Tools
- **AI Chat:** Multi-model chat interface
- **Prompt Generator:** Create optimized prompts
- **Project Ideas:** AI-generated development suggestions

### Server Management
- **WHM Domains:** Domain and SSL management
- **Server Access:** Remote server controls
- **SSH Tools:** Secure shell utilities

### Database Management
- **Database Tools:** MySQL management interface
- **Database Analysis:** Performance and analytics
- **Connection Management:** Database connectivity tools
- **cPanel Integration:** Web hosting panel access

### Command Libraries
- **PHP Commands:** Web development commands
- **Node.js Commands:** JavaScript runtime commands
- **Python Commands:** Python development tools
- **Linux Commands:** System administration
- **Ollama Commands:** Local AI model management

### Development Tools
- **Git Commands:** Version control interface
- **Docker Commands:** Container management

## Troubleshooting

### Common Issues

1. **Port 3000 already in use:**
   ```bash
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Node.js not found:**
   - Install Node.js from https://nodejs.org/
   - Restart your terminal/command prompt

3. **Permission errors (Windows):**
   - Run PowerShell as Administrator
   - Enable script execution: `Set-ExecutionPolicy RemoteSigned`

4. **Database connection failed:**
   - Check your `.env.local` configuration
   - Ensure MySQL server is running on port 3307

## Project Structure

```
admin-backup/
├── app/
│   ├── admin/              # Admin panel pages
│   ├── (public pages)/     # Public interface pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── admin-sidebar.tsx   # Admin navigation
│   └── (other components)
├── lib/
│   ├── i18n.ts            # Language translations
│   └── language-context.tsx # Language provider
├── package.json           # Dependencies
├── next.config.mjs        # Next.js configuration
└── README.md
```

## Support

- **Documentation:** http://localhost:3000/documentation
- **Troubleshooting:** http://localhost:3000/troubleshooting

## License

This project is licensed under the MIT License. 