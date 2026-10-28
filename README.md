# Agri AI — Crop Disease Intelligence & Climate Alert System for Rwanda

**NISR 2026 Big Data Hackathon submission** — turning a phone camera into an early-warning system for crop disease, backed by real agronomists and live climate data.

---

## 🔗 Quick Access

| | |
|---|---|
| **🌐 Live app** | https://YOUR-APP.vercel.app *(deployed link — update after Vercel deploy)* |
| **🎥 Demo video (≤3 min)** | *[VIDEO LINK — record the full flow, then paste the YouTube/Drive link or drop the .webm file in this repo and link it here]* |
| **📦 Dataset** | [New Plant Diseases Dataset (Kaggle)](https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset) — too large (≈2.7 GB) to include; link only |
| **🔌 Backend API docs** | https://YOUR-API.onrender.com/docs |

### 🔑 Demo credentials

| Role | Email | Password | What to try |
|---|---|---|---|
| System admin | admin@agri.com | AdminPass123! | Create organizations & cooperative admins, activate/deactivate |
| Cooperative admin | coop_admin@kigali.com | CoopAdminPass123! | Create agronomists, assign regions, generate farmer codes |
| Agronomist | agronomist@kigali.com | AgronomistPass123! | Review pending predictions, send advice, request more photos |
| Farmer | farmer@kigali.com | FarmerPass123! | Upload a leaf photo → AI diagnosis + climate context |

> A cooperative-issued **registration code** is required to register a new farmer — generate one from the cooperative dashboard (`Codes` tab).

---

## 🎯 The problem

Crop diseases destroy up to 40% of yields globally, and in Rwanda most farmers never reach an agronomist before a disease spreads through a field. Agri AI closes that gap: a photo taken on any phone becomes a diagnosis in seconds — validated by a human expert who knows the farmer's district, with the local weather context attached.

**Alignment with NST2 / Vision 2050:** smart agriculture, food security, digital public services reaching rural citizens, and data-driven early-warning systems.

## 📊 What data we use

| Source | Used for |
|---|---|
| **New Plant Diseases Dataset** (Kaggle, ≈2.7 GB — link above) | Trained a ResNet18 on the **11 disease classes relevant to Rwanda**: maize (4), potato (3), tomato (4) — 20,676 training images, 99.4% validation accuracy |
| **Open-Meteo API** (live, no key needed) | Every prediction attaches a weather snapshot: 30-day rain history + 7-day forecast for the farmer's GPS or district |
| **NISR agricultural priorities** | Crop selection follows NISR staple-crop reports for Rwanda: maize, Irish potato and tomato are among the country's most important food and horticulture crops — that's why our model covers exactly these three |
| **NISR-aligned administrative hierarchy** | Province → district → sector → cell → village — drives agronomist assignment and cooperative scoping |

## 🧭 How users interact

1. **System admin** creates an organization and cooperative admin(s)
2. **Cooperative admin** creates agronomists, assigns them to districts, and generates farmer registration codes
3. **Farmer** registers with a code, shares GPS, photographs a diseased crop → instant AI diagnosis + climate panel
4. **Agronomist** sees pending predictions *only for their cooperative + assigned region* → confirms/corrects the diagnosis → messages the farmer with treatment advice (can request more photos)
5. **Farmer** reads the advice, taps the linked scan to see exactly what the message refers to, adds more photos if asked

Trilingual interface: **English / Ikinyarwanda / Français** (top-right switcher) — including disease names.

## 🛠 Tech stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS — `frontend/`
- **Backend:** FastAPI, SQLAlchemy, Alembic, JWT auth — `backend/`
- **ML:** PyTorch ResNet18 fine-tuned (stage-2) — model weights in `models/`
- **Database:** PostgreSQL (Supabase); `USE_CLONE_DB=1` env var switches to a staging DB for safe testing

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

Requires `backend/.env` with `DATABASE_URL` (PostgreSQL/Supabase). Database schema: `alembic upgrade head`; seed locations + admin via `bootstrap_db.py` then `seed_system_admin.py`.

## 📁 Repo structure (per submission spec)

- `README.md` — this file (data used, what it communicates, how to interact)
- `backend/`, `frontend/` — full working source
- `models/` — trained model weights (`plant_disease_11class_resnet18_stage2_best_v1.pth`)
- `docs/` — project documentation
- Demo video — linked above (or file in repo)

## � What makes it different — the innovation

Most plant-disease demos stop at "photo in → label out." Agri AI fuses **CNN image diagnosis with live climate data (Open-Meteo)**: every prediction carries 30 days of rainfall history and a 7-day forecast for the farmer's exact field. That matters because fungal diseases like early and late blight are *weather-driven* — an agronomist seeing "potato late blight + 102 mm of rain this month" can advise treatment timing that actually works, not a generic textbook answer. Human-in-the-loop validation then feeds every expert correction back into a growing labeled dataset for Rwanda.

**Deployment note:** the trained model weights (44 MB ResNet18) are included in this repository — the backend on Render loads them directly at startup to serve predictions.

## ⚠️ Limitations

- No complete, high-quality dataset of diseases photographed on Rwandan fields exists — we trained on the closest public dataset filtered to Rwanda's priority crops (maize, potato, tomato). Field-collected Rwandan imagery would further improve accuracy.
- The 11-class scope is deliberate (3 priority crops); additional crops can be added as labeled data becomes available.
- Weather snapshots use Open-Meteo estimates — a district-centroid fallback applies when farmers don't share GPS.

## �🙏 Acknowledgements & sources

- Dataset: [New Plant Diseases Dataset — Kaggle](https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset)
- Weather: [Open-Meteo API](https://open-meteo.com/)
- Administrative geography aligned with NISR codes
- Libraries: PyTorch, torchvision, FastAPI, Next.js, Tailwind

*All work is original by the team; external data sources and libraries are acknowledged above.*

**Built by Data Scientist HONORE & Data Scientist HONORINE — Kepler College, Kigali, Rwanda**
