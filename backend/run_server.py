#!/usr/bin/env python
import sys
import traceback

print(f"Python: {sys.executable}")
print(f"Version: {sys.version}")

try:
    print("1. Loading FastAPI...")
    from fastapi import FastAPI
    print("   [OK] FastAPI loaded")
    
    print("2. Loading CORS middleware...")
    from fastapi.middleware.cors import CORSMiddleware
    print("   [OK] CORS loaded")
    
    print("3. Loading router...")
    from app.api.router import api_router
    print("   [OK] Router loaded")
    
    print("4. Loading app from main...")
    from app.main import app
    print("[OK] App loaded")
    
    print("Loading uvicorn...")
    import uvicorn
    print("[OK] Uvicorn loaded")
    
    print("\nStarting server on 127.0.0.1:8000...")
    try:
        uvicorn.run(app, host='127.0.0.1', port=8000, log_level='debug')
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped by user")
    except Exception as e:
        print(f"\n[ERROR] Server error: {e}")
        traceback.print_exc()
        raise
    
except Exception as e:
    print(f"\n[ERROR] Startup error: {e}")
    traceback.print_exc()
    sys.exit(1)
