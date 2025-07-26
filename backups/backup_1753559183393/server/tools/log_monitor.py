import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import datetime

class LogHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith('.log'):
            self._print_new_logs(event.src_path)
            
    def _print_new_logs(self, log_path):
        try:
            with open(log_path, 'r') as f:
                # Go to end of file and read last 5 lines
                f.seek(0, 2)
                file_size = f.tell()
                f.seek(max(file_size - 1024, 0))
                lines = f.readlines()[-5:]
                
                # Print new logs with timestamp
                print(f"\n=== New logs from {os.path.basename(log_path)} ===")
                now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                for line in lines:
                    print(f"[{now}] {line.strip()}")
                print("=====================================\n")
                
        except Exception as e:
            print(f"Error reading log file: {str(e)}")

def monitor_logs():
    # Create logs directory if it doesn't exist
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    
    # Start file system observer
    event_handler = LogHandler()
    observer = Observer()
    observer.schedule(event_handler, log_dir, recursive=False)
    observer.start()
    
    print(f"Monitoring logs in {log_dir}...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        
    observer.join()

if __name__ == "__main__":
    monitor_logs()
