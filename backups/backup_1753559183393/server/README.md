## 📦 Project Structure & Features

### Main Folders/Files:
- **admin/** : Admin panel, UI, and integration guide
- **agents/** : AI agent configs, personalities, utils
- **ai/** : Python backend, MCP dispatcher, model server, launchers
- **dispatcher/** : Dispatcher logic, context router, productivity agent
- **demo/** : Demo Vue components, test scripts
- **docs/** : API spec, test cases, developer manual, demo script
- **frontend/** : Vue/Next.js frontend (if any)
- **laravel-api/** : Laravel backend API (AgentController, routes)
- **logs/** : Activity, fallback, usage logs
- **presentation/** : Slides, documentation for demo
- **project/** : Database schema, sample data
- **providers/** : Model, TTS, STT, news, weather, etc. providers
- **tools/** : CLI tools, env generator, status checker
- **video/** : Demo video scripts
- **zombiecoder_demo_package.zip** : Demo package (for quick test)

### Key Features (Run & Use):
- **generate_voice** : বাংলা ভয়েস জেনারেশন 🗣️
- **generate_prompt** : AI Prompt Auto Generator 💡
- **generate_code** : প্রজেক্ট-বেইজড কোড জেনারেটর 👨‍💻
- **get_system_status** : MCP Health, Latency, Provider 🔍
- **list_ai_models** : লোকাল/ক্লাউড মডেল ভিউ 🔧
- **query_database** : ডাটাবেজ থেকে কুয়েরি ⚙️
- **MCP Dispatcher Integration** : Python MCP dispatcher, fallback, agent orchestration
- **Admin UI** : লাইসেন্স, প্রজেক্ট, এজেন্ট, রিয়েলটাইম স্ট্যাটাস
- **API Authentication & DB Migration** : Laravel API
- **Logs & Monitoring** : latency, fallback, agent status

---

## 🚀 How to Run (Windows & Linux)

1. **Clone/Unzip**: ফোল্ডার আনজিপ করুন বা ক্লোন করুন
2. **Backend Setup**:
   - Laravel: `cd laravel-api && composer install && php artisan migrate --seed && php artisan serve`
   - Python: `cd ai && pip install -r server/requirements.txt && python server/app.py`
3. **Frontend Setup**:
   - `cd admin/Local-Machine-Integration-Guide/app && npm install && npm run dev`
4. **MCP Dispatcher**:
   - `cd ai && python server/mcp/dispatcher.py` (CLI utility)
5. **Status Test**:
   - `curl http://localhost:8000/status` (Backend)
6. **Docs**: `docs/` ফোল্ডারে সব API, টেস্ট কেস, ডেমো স্ক্রিপ্ট

---

## 🖥️ VS Code ও Cursor Integration

ZombieCoder-এর AI suggestion, codegen, docgen, ও fallback ফিচার VS Code, Cursor, বা অন্য কোড এডিটরে ব্যবহার করতে:

### ১. Local Endpoint কনফিগারেশন
- Admin UI বা API থেকে আপনার local endpoint (যেমন: http://localhost:3307/v1/completions) কপি করুন।
- এন্ডপয়েন্টটি VS Code বা Cursor-এর settings.json-এ যুক্ত করুন।

### ২. Cursor Editor Integration
settings.json ফাইলে দিন:
```json
{
  "ai.agent": {
    "endpoint": "http://localhost:3307/v1/completions",
    "localModels": {
      "codeAnalysis": "mistral",
      "codeGeneration": "deepseek",
      "documentation": "gemma"
    },
    "fallbackToLocal": true
  }
}
```

### ৩. VS Code Integration
settings.json ফাইলে দিন (LocalAI/CodeGPT extension):
```json
{
  "localAI.enable": true,
  "localAI.endpoint": "http://127.0.0.1:3307",
  "localAI.modelMapping": {
    "default": "mistral",
    "documentation": "gemma",
    "codegen": "deepseek"
  }
}
```

### ৪. Model Mapping (YAML/JSON)
প্রয়োজনে YAML/JSON ফাইলে model mapping কনফিগার করুন:
```yaml
model_mapping:
  code: mistral
  doc: gemma
  chat: deepseek
```

### ৫. Fallback Chain ও API Key
- Fallback chain ও API key সঠিকভাবে দিন (Admin UI বা .env ফাইলে)।
- API key না থাকলে cloud provider কাজ করবে না।

### ৬. Troubleshooting
- Endpoint connection error দেখলে: server/app.py বা dispatcher/core.py চালু আছে কিনা চেক করুন।
- Model না দেখালে: curl http://localhost:3307/status দিয়ে চেক করুন।
- VS Code/ Cursor extension restart দিন প্রয়োজনে।

### ৭. ডকুমেন্টেশন ও হেল্প
- প্রধান ডকুমেন্টেশন: file:///C:/Agent/docs/index.html
- মডেল স্পেসিফিকেশন: file:///C:/Agent/docs/model_specs/
- এডিটর ইন্টিগ্রেশন: file:///C:/Agent/docs/editor_integration/

এভাবে সহজেই আপনার এডিটরে ZombieCoder-এর AI ফিচারগুলো ব্যবহার করতে পারবেন।

---

## 🔄 Updating & Packaging
- নতুন ফিচার/ফাইল যোগ করলে README.md আপডেট করুন
- `shawn_features.txt` দিয়ে ফোল্ডার/ফাইল লিস্ট জেনারেট করুন
- সবকিছু চেক করে `zip -r shawn.zip ...` দিয়ে নতুন প্যাকেজ বানান

---

## 📝 For Any Update
- ফিচার যোগ/বদলালে README.md-তে লিখুন
- নতুন zip বানানোর আগে সব ফোল্ডার/ফাইল অন্তর্ভুক্ত আছে কিনা চেক করুন
- ডেমো/ডকুমেন্টেশন/ইন্টিগ্রেশন গাইড সবসময় আপডেট রাখুন 