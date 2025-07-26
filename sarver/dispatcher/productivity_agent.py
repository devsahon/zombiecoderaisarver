import time, datetime

def check_idle(last_active, idle_threshold=900):
    now = datetime.datetime.now().timestamp()
    return (now - last_active) > idle_threshold

def periodic_reminder():
    # 3x/day reminder
    print("[MCP] Reminder: Log your progress or update your project timeline.")

def fetch_task_status():
    # Placeholder: fetch from API
    print("[MCP] Fetching task list/status...")

if __name__ == "__main__":
    last_active = time.time() - 1000  # Simulate idle
    if check_idle(last_active):
        print("[MCP] Hey, are you working on your task?")
    periodic_reminder()
    fetch_task_status() 