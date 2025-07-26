# Developer Manual / Quickstart Guide

## Project Setup
1. **Clone Repo:**
   `git clone ...`
2. **Install Dependencies:**
   - Laravel: `composer install`
   - Node/Vue: `npm install`
   - Python: `pip install -r requirements.txt`
3. **Environment Setup:**
   - Copy `.env.example` → `.env`
   - Set DB, API keys, etc.
   - `php artisan key:generate`
4. **Migrate & Seed:**
   `php artisan migrate --seed`
5. **Run Servers:**
   - Laravel: `php artisan serve`
   - Vue: `npm run dev`
   - Python: `python dispatcher/core.py ...`

## Common Commands
- Test: `php artisan test`, `npm run test`
- Lint: `php artisan lint`, `npm run lint`
- Scheduler: `php artisan schedule:work`

## Contribution
- Branch naming: `feature/`, `bugfix/`, `hotfix/`
- PR with description, test evidence
- Follow code review checklist

## Troubleshooting
- DB connection: `.env` config, `php artisan migrate:fresh`
- API error: Check logs (`storage/logs/laravel.log`)
- Dispatcher error: Check Python logs

## Integration Points
- API endpoints documented in Swagger
- Dispatcher calls Laravel API for license/project/agent
- UI fetches via `/api/*` endpoints 