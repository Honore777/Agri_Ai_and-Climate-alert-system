#!/usr/bin/env python
import sys
import asyncio
import os

print(f"Python: {sys.executable}\n")

# Windows-specific fixes
if sys.platform == 'win32':
    print("[INFO] Applying Windows-specific asyncio fixes...")
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    # Disable fork support
    os.environ['PYTHONUNBUFFERED'] = '1'

try:
    print("[1] Importing app...")
    from app.main import app
    print("    OK")
    
    print("[2] Loading uvicorn...")
    import uvicorn
    print("    OK")
    
    print("\n[INFO] Starting server on port 8000...")
    print("[INFO] Press CTRL+C to stop\n")
    
    # Use WindowsSelectorEventLoopPolicy instead of ProactorEventLoopPolicy
    # This avoids the subprocess issues
    uvicorn.run(
        app,
        host='127.0.0.1',
        port=8000,
        loop='asyncio',
        log_level='info',
        # Single worker to avoid subprocess issues on Windows
        workers=1,
        # Disable reload to avoid subprocess issues
        reload=False,
        # Reduce backpressure settings
        interface='auto'
    )
    
except KeyboardInterrupt:
    print("\n[INFO] Server stopped")
except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
