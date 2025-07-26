# Zombie-Ai System Demo Script

## 1. License Management
- Create, assign, expire, renew license (UI → backend reflect)
- Show: License invalid হলে dispatcher block, proper error

## 2. File Protection
- Expire license → protected .php file ডিলিট হচ্ছে কিনা দেখাও
- Log entry/notification দেখাও

## 3. Notification & Cron
- License expiry notification/email দেখাও
- Cron job দিয়ে expiry automation দেখাও

## 4. Admin UI
- License CRUD, project assignment, real-time status

## 5. GitHub Sync
- git_auto_backup.sh চালিয়ে অটো-commit/push timestamp দেখাও

## 6. Google Drive Backup
- backup_to_drive.py চালিয়ে .zip Drive-এ গেছে কিনা দেখাও

## 7. MCP Editor Integration
- dispatcher/core.py → MCP dispatcher receive করছে কিনা
- agent_config.json/.tools/ ফোল্ডারে MCP agent definitions
- Agent চালিয়ে লগ ইনপুট/output দেখাও

## 8. Final Folder Structure
- Zombie-Ai/
  - backend/
  - frontend/
  - dispatcher/
  - docs/
  - backup/
  - .env.example
  - README.md

## 9. README & Usage
- README.md-তে usage, demo steps, backup, restore, integration guide দেখাও

