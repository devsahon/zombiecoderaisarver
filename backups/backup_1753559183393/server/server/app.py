import asyncio
import sys
import os
from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
import platform
import psutil
import datetime
# from utils.status_monitor import StatusMonitor

# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# monitor = None

# @app.on_event("startup")
# async def startup_event():
#     """Start status monitoring on server startup"""
#     global monitor
#     monitor = StatusMonitor("http://localhost:8000/notify")
#     # Start monitoring in background task
#     asyncio.create_task(monitor.start())

# @app.on_event("shutdown")
# async def shutdown_event():
#     """Stop status monitoring on server shutdown"""
#     global monitor
#     if monitor:
#         monitor.stop()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
def read_root():
    return {"message": "Server is running!"}

@app.get("/admin", response_class=HTMLResponse)
def admin_panel(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

@app.get("/api/admin/system-info")
def get_system_info():
    return {
        "os": platform.system(),
        "os_version": platform.version(),
        "cpu_count": psutil.cpu_count(),
        "memory": psutil.virtual_memory()._asdict(),
        "boot_time": datetime.datetime.fromtimestamp(psutil.boot_time()).isoformat(),
        "python_version": platform.python_version()
    }

@app.get("/api/admin/logs")
def get_logs():
    # Dummy logs for now
    return {
        "logs": [
            {"time": "2025-07-22 13:00:00", "level": "INFO", "msg": "Server started."},
            {"time": "2025-07-22 13:05:00", "level": "WARNING", "msg": "High memory usage detected."},
            {"time": "2025-07-22 13:10:00", "level": "ERROR", "msg": "Failed to connect to DB."}
        ]
    }

@app.get("/api/admin/models")
def get_models():
    return {
        "models": [
            {"name": "ZombieCoder-GPT", "status": "active"},
            {"name": "ZombieCoder-Voice", "status": "idle"}
        ]
    }

@app.get("/api/admin/endpoints")
def get_endpoints():
    return {
        "endpoints": [
            {"path": "/api/admin/system-info", "desc": "System info"},
            {"path": "/api/admin/logs", "desc": "System logs"},
            {"path": "/api/admin/models", "desc": "Model status"},
            {"path": "/api/admin/endpoints", "desc": "API endpoints list"}
        ]
    }

@app.get("/admin/users", response_class=HTMLResponse)
def admin_users(request: Request):
    return templates.TemplateResponse("users.html", {"request": request}) 