Auto-Start All ZombieCoder Servers (Windows)
============================================

1. Edit the PowerShell script (auto_start_servers.ps1) if your folder structure is different.
2. Right-click the script and 'Run with PowerShell' to test manual launch.
3. To auto-start at boot:
   a. Open Task Scheduler (Win+S > Task Scheduler)
   b. Create Task > General: Name it (e.g., ZombieCoder Servers)
   c. Triggers: New > At startup
   d. Actions: New > Start a program > Program/script: powershell.exe
      Add arguments: -ExecutionPolicy Bypass -File "C:\path\to\auto_start_servers.ps1"
   e. Conditions/Settings: Set as needed (run whether user is logged on, highest privileges)
   f. Save.
4. Reboot to test. All servers should auto-launch in background windows.

Edit-From-Anywhere:
-------------------
- You can open any folder in VSCode, PyCharm, or Notepad++ and edit project files.
- Servers will auto-reload if you use tools like watchdog/hot-reload.
- For network access, use Windows file sharing (right-click folder > Properties > Sharing).

Troubleshooting:
----------------
- If a server window closes instantly, check logs or run the command manually in a terminal.
- Make sure Python, PHP, Node, and Ollama are in your PATH.
- For permission issues, run Task Scheduler task as administrator. 