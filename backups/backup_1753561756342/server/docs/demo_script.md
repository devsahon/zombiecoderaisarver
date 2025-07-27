# ZombieCoder Productivity Tracker Module - Demo Script

## 1. Login & Dashboard
- Login as admin
- Ensure Productivity Tracker module is visible on dashboard

## 2. Task Management
- Open TaskBoard.vue
- Create a new task (To-Do)
- Drag task to Doing, then Done
- Assign deadline, assignee, and client-project

## 3. Time Tracking
- Open TimerTrack.vue
- Start timer, wait a few seconds, then stop
- Check backend TimeLog entry
- Simulate idle (wait 15+ min or mock), show MCP prompt: "Are you still working?"

## 4. Idea Management
- Open IdeaList.vue
- Add a new idea
- Relate idea to a project/client
- Filter/search ideas

## 5. Client Project Tracking
- Open ClientTracker.vue
- Show client/project status, progress bar

## 6. MCP Dispatcher Integration
- Run dispatcher/productivity_agent.py
- Show idle detect, periodic reminder, task sync logs/output

## 7. Logs & Reports
- Open /storage/logs/productivity.log
- Show idle/start/stop logs
- Open dashboard/reports for time breakdown, task completion

## 8. License & Security
- Expire license, show agent block in UI/dispatcher

## 9. Backup & Sync
- Run git_auto_backup.sh, show GitHub push
- Run backup_to_drive.py, show Google Drive .zip backup

## 10. README & Docs
- Show README.md usage, demo steps, integration guide
- Show docs/productivity_module.md, test_cases.md, api_spec.yaml, dev_manual.md

---

**Tips:**
- Screen share or record video
- Show live logs/output for each step
- Be ready for Q&A or feedback 