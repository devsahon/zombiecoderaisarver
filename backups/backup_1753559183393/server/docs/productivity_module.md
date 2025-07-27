# ZombieCoder Productivity Tracker Module

## 🎯 Core Goals
- Track work time and focus
- Manage client and personal projects
- Time logging, task progress, reminders
- Store and organize ideas (mindmap style)

## 🏗️ Module Structure

### 1. Backend (Laravel)
#### Models
- **Task**: title, description, status, due_date, client_id, tag
- **TimeLog**: task_id, start_time, end_time, duration
- **ClientProject**: name, goal, deadline, priority, status
- **IdeaBox**: idea_title, context, tags, related_project_id

#### API Routes
- `POST /api/tasks` — Create task
- `GET /api/tasks` — List tasks
- `POST /api/timelog/start` — Start timer
- `POST /api/timelog/stop` — Stop timer
- `GET /api/clients` — List clients/projects
- `POST /api/idea` — Add idea
- `GET /api/idea` — List ideas

### 2. Frontend (Vue.js)
#### Components
- **TaskBoard.vue** — Kanban To-Do/Doing/Done
- **TimerTrack.vue** — Start/Stop Timer, idle detect
- **ClientTracker.vue** — Client/project info, progress
- **IdeaList.vue** — Idea stack, relate with projects
- **PromptReminder.vue** — Desktop notification if idle

### 3. Dispatcher Integration (Python)
- MCP agent auto-triggers:
  - If idle_time > 15 min, prompt: "Are you working on task X?"
  - 3x/day: "Log your progress or update your project timeline."
  - MCP receives and logs task list/status

### 4. Optional Enhancements
- Google Calendar Sync
- Voice Note (speech-to-idea)
- Markdown to Idea Converter
- Mindmap/Graph View

## 🛠️ Setup & Usage
- Backend: Migrate models, implement API
- Frontend: Scaffold components, connect API
- Dispatcher: Add idle checker, reminder logic

## 📁 Folder Structure
project-root/
├── laravel-api/
│   ├── app/Models/ (Task.php, TimeLog.php, ClientProject.php, IdeaBox.php)
│   ├── Http/Controllers/ (...)
│   └── database/migrations/
├── frontend/components/
│   ├── TaskBoard.vue
│   ├── TimerTrack.vue
│   ├── ClientTracker.vue
│   └── IdeaList.vue
├── dispatcher/
│   └── productivity_agent.py
└── docs/productivity_module.md

## 🔄 Team Action Plan
- Scaffold models, migrations, API
- Build UI components
- Integrate dispatcher reminders
- Update docs and test cases 