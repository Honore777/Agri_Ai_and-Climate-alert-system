"""
storage_service.py — Supabase Storage upload/download helpers.

Uploaded images live in a Supabase Storage bucket so they survive
Render's ephemeral filesystem. Falls back gracefully when the
SUPABASE_URL / SUPABASE_SERVICE_KEY env vars are not configured.
"""

import os
import requests

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", os.getenv("SUPABASE_KEY", ""))
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "crop-images")


def _headers(content_type: str = "application/octet-stream"):
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": content_type,
    }


def storage_enabled() -> bool:
    return bool(SUPABASE_URL and SUPABASE_KEY)


def upload_bytes(data: bytes, object_path: str, content_type: str = "image/jpeg") -> bool:
    """Upload bytes to the bucket. Returns True on success."""
    if not storage_enabled():
        return False
    try:
        resp = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{object_path}",
            headers=_headers(content_type),
            data=data,
            timeout=30,
        )
        # 200 = created, 409 = already exists (fine — same content)
        if resp.status_code in (200, 201):
            return True
        if resp.status_code == 409:
            return True
        print(f"[storage] upload {object_path} failed: {resp.status_code} {resp.text[:200]}")
        return False
    except Exception as e:
        print(f"[storage] upload {object_path} error: {e}")
        return False


def download_bytes(object_path: str) -> bytes:
    """Fetch an object's bytes. Returns None on failure."""
    if not storage_enabled():
        return None
    try:
        resp = requests.get(
            f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{object_path}",
            headers=_headers(),
            timeout=30,
        )
        if resp.status_code == 200:
            return resp.content
        return None
    except Exception:
        return None
