import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os

class YamlChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith('.yaml'):
            print(f"YAML changed: {event.src_path}. Syncing...")
            os.system('cd laravel-api && php artisan sync:provider-config')

if __name__ == "__main__":
    event_handler = YamlChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path='config/providers', recursive=False)
    observer.start()
    print("[Watcher] Monitoring config/providers for YAML changes...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join() 