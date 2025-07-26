#!/bin/bash

# ZombieCoder AI Management System - Setup Script
# For Linux/macOS users

echo "🚀 ZombieCoder AI Management System Setup"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Admin Panel
echo ""
echo "📦 Setting up Admin Panel..."
cd admin

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Create data directory
mkdir -p data

# Initialize database
echo "Initializing database..."
if [ -f "lib/database-schema.sql" ]; then
    echo "Database schema found. Database will be created on first run."
else
    echo "⚠️  Database schema not found. Please check lib/database-schema.sql"
fi

cd ..

# Setup Server Services
echo ""
echo "🐍 Setting up Server Services..."
cd sarver

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."

# Install core dependencies
pip install flask flask-cors python-dotenv requests psutil websockets

# Install voice server dependencies
cd voice-server
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "Installing voice server dependencies..."
    pip install flask flask-cors python-dotenv requests
fi
cd ..

# Install AI server dependencies
cd ai-server
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "Installing AI server dependencies..."
    pip install flask flask-cors python-dotenv requests
fi
cd ..

# Create logs directory
mkdir -p logs

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Next Steps:"
echo "1. Start the admin panel:"
echo "   cd admin && npm run dev"
echo ""
echo "2. Start the main server:"
echo "   cd sarver && source venv/bin/activate && python simple_server.py"
echo ""
echo "3. Start the voice server (in new terminal):"
echo "   cd sarver/voice-server && source ../venv/bin/activate && python app.py"
echo ""
echo "4. Start the AI server (in new terminal):"
echo "   cd sarver/ai-server && source ../venv/bin/activate && python app.py"
echo ""
echo "🌐 Admin Panel: http://localhost:3000/admin"
echo "👤 Username: admin"
echo "🔑 Password: admin123"
echo ""
echo "📚 For more information, see README.md" 