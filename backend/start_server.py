#!/usr/bin/env python
import sys
import signal
import time
import traceback

print(f"Python: {sys.executable}")

try:
    print("\n[1] Importing FastAPI...")
    from fastapi import FastAPI
    print("    OK")
    
    print("[2] Importing CORS...")
    from fastapi.middleware.cors import CORSMiddleware
    print("    OK")
    
    print("[3] Importing database...")
    from app.database.session import SessionLocal, engine
    print("    OK")
    
    print("[4] Importing models...")
    from app.models import user
    print("    OK")
    
    print("[5] Importing router...")
    from app.api.router import api_router
    print("    OK")
    
    print("[6] Creating main app...")
    app = FastAPI(
        title='Rwanda Agri Agronomist Climate system',
        version='1.0.0'
    )
    print("    OK")
    
    print("[7] Adding CORS middleware...")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    print("    OK")
    
    print("[8] Including router...")
    app.include_router(api_router, prefix="/api/v1")
    print("    OK")
    
    print("\n[INFO] App created successfully")
    
    print("[INFO] Loading uvicorn...")
    import uvicorn
    print("[INFO] Uvicorn loaded")
    
    print("\n[INFO] Starting server on 127.0.0.1:8000")
    print("[INFO] Press CTRL+C to stop\n")
    
    server = uvicorn.Server(uvicorn.Config(
        app,
        host='127.0.0.1',
        port=8000,
        log_level='info'
    ))
    
    # Run indefinitely until interrupted
    server.run()
    
except KeyboardInterrupt:
    print("\n[INFO] Server stopped")
except Exception as e:
    print(f"\n[ERROR] {e}")
    traceback.print_exc()
    sys.exit(1)
