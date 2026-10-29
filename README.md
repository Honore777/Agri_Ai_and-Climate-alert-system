# Agri AI — Crop Disease Intelligence & Climate Alert System for Rwanda

**NISR 2026 Big Data Hackathon submission.** Agri AI turns a smartphone camera into an early-warning system for crop disease — AI diagnosis, expert agronomist validation, and live climate context for every farmer's field.

---

## 🔗 Quick Access

| | |
|---|---|
| **🌐 Live application** | https://agri-ai-and-climate-alert-system.vercel.app |
| **🎥 Demo video (≤3 min)** | **`demo/demo-video.mp4`** in this repo · also hosted at https://www.youtube.com/watch?v=66DZhYfL_aA |
| **🔌 Backend API** | https://agri-ai-and-climate-alert-system.onrender.com — docs at `/docs` |
| **📦 Dataset** | [New Plant Diseases Dataset (Kaggle)](https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset) — ≈2.7 GB, link only |

> ⏳ **Please note — free-tier hosting.** The API runs on Render's free plan and the Next.js app on Vercel's. After ~15 minutes idle, the backend sleeps: the **first request may take up to ~90 seconds** while the service wakes and the machine-learning model loads into memory. Once warm, everything is instant. We recommend opening the live app and logging in first, then waiting briefly before trying a prediction.

### 🔑 Demo accounts

Every role in the workflow can be exercised end-to-end:

| Role | Email | Password | Try this |
|---|---|---|---|
| **Platform admin** | harerimana456@gmail.com | aRSENEANTONIO@1 | Create organizations & cooperative admins; manage all users |
| **Cooperative admin** | honorine456@gmail.com | Honorine@456 | Create agronomists, assign regions, generate farmer codes, watch the **Outbreaks** surveillance tab |
| **Agronomist** | jolie456@gmail.com | Jolie@456 | Review pending predictions, see farmer GPS + climate, send advice, request extra photos |
| **Farmer** | didace456@gmail.com | Didace@456 | Share GPS, photograph a crop, receive AI diagnosis + climate panel, read agronomist advice |

---

## 🎯 The problem we solve

Crop diseases can wipe out a season's work before a farmer ever reaches an expert. In Rwanda, agronomists are scarce and concentrated in cooperatives — the farmer with the sick maize is rarely the farmer who gets an expert's eyes on it in time.

Agri AI closes that gap: a photo taken in the field becomes a diagnosis in seconds — reviewed by a real agronomist assigned to the farmer's exact district, with the field's own weather history attached so advice fits the crop, the place, and the moment.

**Alignment with NST2 / Vision 2050:** smart agriculture, food security, data-driven early warning, and digital public services that reach rural citizens — including a fully trilingual interface (English, Ikinyarwanda, Français).

## 📊 What data we use

| Source | Used for |
|---|---|
| **New Plant Diseases Dataset** (Kaggle — link above) | Trained a ResNet18 on the **11 disease classes relevant to Rwanda** — maize (4), potato (3), tomato (4): 20,676 training images, **99.4% validation accuracy** |
| **Visual Crossing Timeline API** (free tier, API key) | Every prediction attaches 30 days of rainfall/temperature/humidity history + a 7-day forecast for the farmer's exact GPS or district — powering automatic climate alerts (e.g., "heavy rain + humidity → fungal blight risk"). Open-Meteo remains as an automatic fallback. |
| **NISR-aligned administrative geography** | Full Rwanda hierarchy — province → district → sector → cell → village — drives agronomist assignment, cooperative scoping, and outbreak hotspots |
| **NISR agricultural priorities** | Crop focus mirrors national staple-crop priorities: maize, Irish potato, and tomato |

> **Dataset note:** the image dataset is ≈2.7 GB — too large to include in this repository, so only the Kaggle link is provided (as per submission guidelines). The trained model weights resulting from that data are included in `models/`, and the full training pipeline is reproducible in `notebooks/`.

## 🧭 How the workflow runs end-to-end

1. **Platform admin** creates an organization and its cooperative admin(s)
2. **Cooperative admin** hires agronomists, assigns them to districts, and generates farmer registration codes — then monitors the **Outbreaks tab**: disease counts, hotspot sectors, weekly trends, and automatic alerts when one disease clusters in one area
3. **Farmer** registers with a code, shares GPS, photographs a crop → instant AI diagnosis with a full climate panel (30-day rain history, 7-day forecast, risk alerts)
4. **Agronomist** sees pending predictions *only for their cooperative and assigned region* — photo, farmer details, exact GPS, weather — confirms or corrects the diagnosis, messages treatment advice, and can request more photos
5. **Farmer** reads the advice, opens the linked scan to see what it refers to, and attaches additional photos when asked
6. The expert's correction feeds a growing labeled dataset for Rwanda

## 💡 What makes it different

Most plant-disease demos stop at "photo in → label out." Agri AI fuses **CNN image diagnosis with live climate intelligence**: a "potato late blight" verdict arrives alongside 102mm of rain this month — the exact context an agronomist needs, because fungal diseases are weather-driven. Add human-in-the-loop validation and cooperative-level surveillance, and individual diagnosis becomes **regional early warning**.

## 🛠 Tech stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS — `frontend/`
- **Backend:** FastAPI, SQLAlchemy, Alembic, JWT auth — `backend/`
- **ML:** PyTorch ResNet18 fine-tuned in two stages — weights in `models/`
- **Data:** PostgreSQL (Supabase) · Visual Crossing + Open-Meteo weather APIs
- **Hosting:** Vercel (frontend) + Render (backend), free tiers

## 🚀 Run locally

```powershell
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload        # http://127.0.0.1:8000/docs

# Frontend (second terminal)
cd frontend
npm install
npm run dev                                   # http://localhost:3000
```

`backend/.env` needs `DATABASE_URL` (PostgreSQL) and optionally `VISUAL_CROSSING_API_KEY` (falls back to Open-Meteo without it). Schema: `alembic upgrade head`; seed: `bootstrap_db.py` then `seed_system_admin.py`, and `load_locations.py` for the Rwanda hierarchy.

## 📁 Repository contents

- `README.md` — this file
- `backend/`, `frontend/` — complete working source
- `models/` — trained model weights
- `notebooks/Training_on_three_crop_diseases_versions.ipynb` — the full training pipeline: Rwanda-relevant class selection, two-stage transfer learning, and validation metrics (99.4% accuracy on the 11-class stage-2 model)
- `notebooks/Copy_of_Plant_disease_training_version_one.ipynb` — initial experiment: baseline training + fine-tuning on the full 38-class dataset, with loss/accuracy curves
- `demo/demo-video.mp4` — screen recording of the full user journey (≤3 min), also on YouTube
- `student_cards/` — student cards of both team members (eligibility verification)
- `docs/` — supporting documentation

## ⚠️ Limitations

- No complete public dataset of diseases photographed on Rwandan fields exists — we trained on the closest public dataset filtered to Rwanda's priority crops; field-collected imagery would further improve accuracy.
- Free-tier hosting means cold-start latency after idle periods and shared-IP rate limits on free APIs (mitigated with a dedicated weather API key and retry logic).

## 🙏 Acknowledgements & sources

- Dataset: [New Plant Diseases Dataset — Kaggle](https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset)
- Climate data: [Visual Crossing](https://www.visualcrossing.com/) · [Open-Meteo](https://open-meteo.com/)
- Administrative geography aligned with NISR codes
- Libraries: PyTorch, torchvision, FastAPI, Next.js, Tailwind CSS

*All work is original; external data sources and libraries are acknowledged above.*

**Built by Data Scientist HONORE & Data Scientist HONORINE — Kepler College, Kigali, Rwanda**
