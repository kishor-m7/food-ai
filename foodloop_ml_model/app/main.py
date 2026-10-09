"""
FoodLoop AI - FastAPI Application Server
Central entry point serving REST APIs, ML model inference, and frontend static assets.
"""

import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv()

# Ensure root directory is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.database import init_db
from app.services.ml_service import MLService

from app.routers import health, food, donations, requests, users, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifespan events."""
    print("============================================================")
    print(" FoodLoop AI Server Starting...")
    print("============================================================")
    
    # 1. Initialize DB and Seed Data
    try:
        init_db()
        print(" [DB] SQLite database initialized and verified.")
    except Exception as e:
        print(f" [DB Error] Failed initializing database: {e}")

    # 2. Load ML Model ONCE on startup
    try:
        ml_svc = MLService.get_instance()
        ml_svc.initialize()
    except Exception as e:
        print(f" [ML Error] Failed to initialize ML Service: {e}")

    yield

    print(" FoodLoop AI Server Shutting Down.")


app = FastAPI(
    title="FoodLoop AI Application Server",
    description="Python FastAPI backend, ResNet-50 ML inference API, and persistent food donation platform.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router)
app.include_router(food.router)
app.include_router(donations.router)
app.include_router(requests.router)
app.include_router(users.router)
app.include_router(admin.router)

# Ensure uploads directory exists
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Frontend directory path
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
os.makedirs(FRONTEND_DIR, exist_ok=True)

# Mount assets directory if present
ASSETS_DIR = os.path.join(FRONTEND_DIR, "assets")
if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# SPA Route Fallback Handler for React Router
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa_route(full_path: str):
    # Pass through API and Uploads requests
    if full_path.startswith("api/") or full_path.startswith("uploads/"):
        return JSONResponse({"detail": "Not Found"}, status_code=404)
    
    # Serve requested file if it exists (e.g. favicon or static asset)
    target_file = os.path.join(FRONTEND_DIR, full_path)
    if os.path.isfile(target_file):
        return FileResponse(target_file)
    
    # Otherwise return index.html for SPA Client Router
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return JSONResponse({"status": "FoodLoop AI API Server Running", "docs": "/docs"})

