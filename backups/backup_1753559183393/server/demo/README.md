# ZombieCoder Demo - Quickstart

## 1. Demo Folder Structure
- `zombie-dashboard/` : Vue 3 UI (TaskBoard, Chat, DocPlayer)
- `backend/` : Laravel API (see project root)
- `dispatcher/` : Python MCP dispatcher (see project root)

## 2. How to Run the Demo (Windows)

### Backend (Laravel)
```bash
cd ../../
composer install
php artisan migrate --seed
php artisan serve
```

### Frontend (Vue 3)
```bash
cd zombie-dashboard
npm install
npm run dev
```

### Python Dispatcher
```bash
cd ../../
pip install -r requirements.txt
python dispatcher/core.py
```

## 3. Sample UI Components
- See `zombie-dashboard/` for:
  - `TaskBoard.vue`
  - `ChatWindow.vue`
  - `DocPlayer.vue`

## 4. Docs & Video
- See `../docs/` for all documentation
- Demo video link: [Watch Demo](https://drive.google.com/your-demo-link)

---

**For any issues, see the main README.md or contact the team.** 