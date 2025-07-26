# Multi-Project Integration Guide

## Overview
This guide explains how to use our AI services and modules across multiple projects.

## Integration Methods

### 1. API Integration
```python
from ai_service import AIService

# Initialize with your project key
ai_service = AIService(project_key="your_project_key")

# Use any service
response = ai_service.chat_agent.send_message("Hello")
voice_data = ai_service.voice_agent.generate_speech("Hello")
```

### 2. Module-based Integration
You can import specific modules:
```python
from ai_service.voice import VoiceHandler
from ai_service.agents import ChatAgent
from ai_service.license import LicenseManager
```

## Available Services

### 1. Core Services
- License Management
- Voice Synthesis
- Chat Agents
- Image Analysis

### 2. Website Integration
- Quiz System
- E-commerce Features
- Subscription Management

### 3. Automation
- SMS Auto-reply
- Task Scheduling
- Voice Reminders

## Security & Licensing

### 1. Project-specific Licensing
Each project needs its own license key:
```python
license_manager = LicenseManager()
license_manager.activate_for_project("project_id", "license_key")
```

### 2. Usage Limits
- API call limits
- Storage quotas
- Feature restrictions

## Best Practices

### 1. Configuration
Store project-specific settings in `config.yaml`:
```yaml
project_id: "your_project"
api_key: "your_key"
features:
  voice: true
  chat: true
  image: false
```

### 2. Error Handling
```python
try:
    result = ai_service.some_feature()
except LicenseError:
    # Handle license issues
except QuotaError:
    # Handle quota exceeded
```

## Example Implementations

### 1. Android App Integration
See [Android Studio Integration Guide](android_studio_integration.md)

### 2. Web App Integration
```python
from flask import Flask
from ai_service import AIService

app = Flask(__name__)
ai = AIService(project_key="web_app_key")

@app.route('/chat')
def chat():
    return ai.chat_agent.process_message(request.args.get('message'))
```

## Troubleshooting
Common issues and solutions... 