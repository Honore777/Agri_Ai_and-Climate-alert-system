import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router

app = FastAPI(
    title='Rwanda Agri Agronomist Climate system',
    version='1.0.0'
)

# Extra allowed origins can be added via CORS_ORIGINS env var
# (comma-separated, e.g. "https://app.vercel.app,https://app2.vercel.app")
_default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://localhost",
    "http://127.0.0.1",
    "https://agri-ai-and-climate-alert-system.vercel.app",
]
_extra_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "").split(",")
    if o.strip()
]
allow_origins = _default_origins + _extra_origins

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
def warm_model():
    """Preload the disease model so the first /predict request is fast."""
    try:
        from app.ml.model_loader import load_model
        load_model()
        print("ML model preloaded at startup")
    except Exception as e:
        # Never block startup on model issues — predict() will retry lazily
        print(f"Model preload skipped: {e}")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}