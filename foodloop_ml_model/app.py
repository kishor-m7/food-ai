"""
FoodLoop AI - Main Server Launcher Shim
Exposes the FastAPI application instance and runs Uvicorn when executed.
"""

import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("============================================================")
    print(" Starting FoodLoop AI Server via Uvicorn")
    print(f" Web Dashboard: http://localhost:{port}/")
    print(f" API Docs: http://localhost:{port}/docs")
    print("============================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
