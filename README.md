# 🌾 Agri AI Platform - Crop Disease Detection System

A comprehensive agricultural intelligence platform that leverages machine learning to detect crop diseases and facilitate communication between farmers and agronomists. Built for Rwanda's agricultural ecosystem with multi-language support and region-based organization.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [System Architecture](#system-architecture)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Agri AI Platform is an end-to-end solution designed to improve crop health and agricultural productivity in Rwanda. Farmers can upload images of their crops, receive instant AI-powered disease predictions, and communicate directly with trained agronomists for expert guidance. The system uses deep learning models (ResNet18) fine-tuned for plant disease detection.

### Key Problem Solved
- **Disease Detection**: Instant identification of crop diseases from photos
- **Expert Guidance**: Direct communication channel between farmers and agronomists
- **Regional Support**: Scalable agronomist assignment based on geographic regions
- **Prediction Tracking**: Complete audit trail of predictions and agronomist reviews

## ✨ Features

### For Farmers
- 📸 **Image Upload** - Upload crop photos for instant disease analysis
- 🔍 **AI Predictions** - Get disease detection results with confidence scores
- 💬 **Messaging** - Receive personalized advice from assigned agronomists
- 👨‍🌾 **Agronomist Contact** - View assigned agronomist contact information
- 📱 **Mobile-Friendly** - Responsive design for all devices
- 🔐 **Secure Authentication** - Role-based access control

### For Agronomists
- ✅ **Prediction Review** - Validate and review farmer predictions
- 📊 **Dashboard** - View pending predictions by region
- 💭 **Messaging System** - Send targeted advice to farmers
- 👥 **Farmer Details** - Access farmer contact information
- 🗺️ **Regional Management** - Work with farmers in assigned regions

### For System Administrators
- 🏢 **Organization Management** - Create and manage cooperatives
- 👤 **User Management** - Add agronomists and manage roles
- 📍 **Location Setup** - Configure Rwanda's geographic hierarchy
- 🔑 **Access Control** - Manage permissions and authentication
- 📋 **Audit Logs** - Track all system activities

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: SQLite with SQLAlchemy ORM
- **Migrations**: Alembic
- **Authentication**: JWT (JSON Web Tokens)
- **ML Models**: PyTorch ResNet18 (fine-tuned)
- **Image Processing**: PIL, numpy

### Frontend
- **Framework**: Next.js 15 (App Router) with React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Language**: TypeScript

### DevOps & Tools
- **Package Manager**: pip (Python), npm (Node.js)
- **Version Control**: Git
- **API Documentation**: FastAPI Auto-docs (Swagger UI)

## 📁 Project Structure

```
agri_ai_platform/
├── backend/                          # FastAPI backend
│   ├── app/
│   │   ├── api/v1/                  # REST API endpoints
│   │   │   ├── agronomists.py       # Agronomist management
│   │   │   ├── predictions.py       # Predictions & messaging
│   │   │   ├── users.py             # User management
│   │   │   ├── auth.py              # Authentication
│   │   │   └── ...
│   │   ├── models/                  # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── prediction.py
│   │   │   ├── message.py
│   │   │   ├── assignment.py
│   │   │   └── ...
│   │   ├── schemas/                 # Pydantic schemas
│   │   ├── ml/                      # ML pipeline
│   │   │   ├── model_loader.py
│   │   │   ├── predictor.py
│   │   │   └── preprocessing.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── deps.py
│   │   └── main.py                  # FastAPI app initialization
│   ├── alembic/                     # Database migrations
│   ├── run_prod_server.py          # Production server entry
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/                         # Next.js frontend (App Router)
│   ├── src/
│   │   ├── app/                     # Route definitions
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── login/               # Sign-in page
│   │   │   ├── register/            # Registration page
│   │   │   ├── dashboard/           # Role-guarded dashboards
│   │   │   │   ├── farmer/
│   │   │   │   ├── agronomist/
│   │   │   │   ├── admin/
│   │   │   │   └── cooperative/
│   │   │   └── globals.css
│   │   ├── screens/                 # Page-level components
│   │   │   ├── farmer/
│   │   │   ├── agronomist/
│   │   │   ├── admin/
│   │   │   └── auth/
│   │   ├── components/
│   │   │   ├── prediction/
│   │   │   ├── farmer/
│   │   │   ├── agronomist/
│   │   │   ├── admin/
│   │   │   ├── cooperative/
│   │   │   ├── auth/                # AuthGuard
│   │   │   ├── layout/              # Logo, DashboardHeader
│   │   │   └── shared/              # ErrorBoundary, LoadingSpinner
│   │   ├── services/
│   │   │   ├── api/axios.ts         # Configured axios client
│   │   │   ├── auth.service.ts
│   │   │   └── message.service.ts
│   │   ├── stores/
│   │   │   └── auth.store.ts        # Zustand auth store
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   └── config/                  # API configuration (env-driven)
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── models/                          # Pre-trained ML models
│   ├── best_model.pth
│   ├── crop_disease_detection_v1_finetuned.pth
│   └── plant_disease_restnet18_v1_finetuned.pth
│
├── docs/
│   ├── api_contract.md              # API specifications
│   ├── architecture.md              # System architecture
│   └── ml_pipeline.md               # ML model documentation
│
└── README.md                         # This file

```

## 🚀 Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- pip & npm
- Git

### Backend Setup

1. **Clone repository and navigate to backend**
   ```bash
   git clone https://github.com/yourusername/agri_ai_platform.git
   cd agri_ai_platform/backend
   ```

2. **Create Python virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database**
   ```bash
   python bootstrap_db.py
   ```

5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

6. **Seed system data (optional)**
   ```bash
   python seed_system_admin.py
   ```

7. **Start backend server**
   ```bash
   python run_prod_server.py
   ```
   Server runs on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd agri_ai_platform/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the API URL** (optional — defaults to local backend)
   ```bash
   copy .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

## 💻 Usage

### Accessing the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

### User Roles & Access

#### 1. Farmer Account
- Upload crop images
- View prediction results
- Contact assigned agronomist
- View received messages

```bash
# Example farmer credentials (after seeding)
Email: farmer@example.com
Password: [see database seed]
```

#### 2. Agronomist Account
- Review farmer predictions
- Send messages to farmers
- Manage assigned region
- Track prediction outcomes

#### 3. Admin Account
- Manage all users
- Configure organizations
- Set up geographic regions
- View system audit logs

### Typical User Flow

1. **Farmer registers** and provides location (Village → District)
2. **Farmer uploads crop image** on dashboard
3. **ML model predicts disease** with confidence score
4. **Agronomist reviews prediction** and validates/rejects
5. **Agronomist sends message** with recommendations
6. **Farmer receives message** in inbox and can call/email agronomist

## 📡 API Documentation

### Authentication Endpoints

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { "access_token": "...", "token_type": "bearer" }
```

### Prediction Endpoints

```http
# Create prediction from image
POST /api/v1/predictions/
Content-Type: multipart/form-data
Authorization: Bearer {token}

# Get pending predictions (agronomist)
GET /api/v1/predictions/pending
Authorization: Bearer {token}

# Get farmer's predictions
GET /api/v1/predictions/user/me
Authorization: Bearer {token}

# Review prediction
POST /api/v1/predictions/{prediction_id}/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "is_valid": true,
  "feedback": "Disease correctly identified"
}
```

### Messaging Endpoints

```http
# Send message to farmer
POST /api/v1/predictions/{prediction_id}/message
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Fungal infection detected",
  "body": "Your crop shows early signs of powdery mildew. Apply sulfur dust...",
  "prediction_id": 123
}

# Get farmer's messages
GET /api/v1/predictions/messages/inbox
Authorization: Bearer {token}

# Get agronomist info
GET /api/v1/agronomists/my-agronomist
Authorization: Bearer {token}
```

## 📊 Database Schema

### Core Tables

**users**
- id, email, password_hash, full_name, phone_number, role
- region_ids: province, district, sector, cell, village
- timestamps: created_at, updated_at

**predictions**
- id, farmer_id, image_id, predicted_disease, confidence_score
- crop_type, inference_result, status (pending/validated)
- timestamps: created_at, updated_at

**images**
- id, farmer_id, filename, storage_path
- timestamps: created_at

**messages**
- id, agronomist_id, farmer_id, prediction_id
- title, body, is_read
- timestamps: created_at, updated_at

**assignments**
- id, agronomist_id, region_ids (village/cell/sector/district/province)
- is_active, timestamps

**prediction_review**
- id, agronomist_id, prediction_id
- is_valid, feedback
- timestamps: created_at, updated_at

**organizations**
- id, name, contact_info, region

See [docs/architecture.md](docs/architecture.md) for complete schema.

## 🏗️ System Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AGRI AI PLATFORM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐              ┌──────────────────────┐ │
│  │   Next.js App   │◄────────────►│   FastAPI Backend    │ │
│  │  (Port 3000)    │   REST API   │   (Port 8000)        │ │
│  └─────────────────┘              └──────────────────────┘ │
│        │                                    │               │
│        │                                    ▼               │
│        │                           ┌──────────────────────┐ │
│        │                           │  SQLAlchemy ORM      │ │
│        │                           │  + SQLite Database   │ │
│        │                           └──────────────────────┘ │
│        │                                    │               │
│        ▼                                    ▼               │
│  ┌─────────────────┐              ┌──────────────────────┐ │
│  │  Tailwind CSS   │              │   PyTorch ML Model   │ │
│  │  Zustand Store  │              │   (ResNet18)         │ │
│  └─────────────────┘              └──────────────────────┘ │
│                                            │               │
│                                            ▼               │
│                                   ┌──────────────────────┐ │
│                                   │  Image Processing    │ │
│                                   │  (PIL, numpy)        │ │
│                                   └──────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Image Upload** → Farmer uploads → Stored in storage/predictions/
2. **Disease Detection** → ML model processes → Prediction saved to DB
3. **Prediction Review** → Agronomist validates → Creates PredictionReview record
4. **Messaging** → Agronomist sends advice → Message saved to DB
5. **Farmer Inbox** → Farmer views messages → Marked as read

## 🔐 Authentication & Security

- **JWT Tokens**: 60-minute expiration
- **Password Hashing**: bcrypt with salt
- **Role-Based Access Control**: 3 roles (farmer, agronomist, admin)
- **Region-Based Permissions**: Users can only see/work with farmers in their region
- **CORS**: Configured for localhost (frontend) and production domains
- **Bearer Token**: All endpoints require `Authorization: Bearer {token}`

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest tests/
```

### Test Prediction Flow
```bash
python test_complete_prediction_flow.py
```

## 🔄 Development Workflow

### Database Migrations

```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

### Frontend Development

```bash
# Run with hot reload (Turbopack)
npm run dev

# Build for production
npm run build

# Serve the production build
npm start

# Lint
npm run lint
```

### Backend Development

```bash
# Auto-reload on code changes
python run_server.py

# Production server
python run_prod_server.py
```

## 📈 Performance Considerations

- **Image Processing**: Images compressed before ML processing
- **ML Model**: ResNet18 optimized for inference speed (~200ms per image)
- **Database**: Indexes on frequently queried columns
- **Caching**: JWT tokens cached client-side
- **Pagination**: API endpoints support pagination for large datasets

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements_fixed.txt

# Check database
python check_db.py
```

### Frontend Won't Connect
```bash
# Verify backend is running on port 8000
curl http://localhost:8000/health

# Check CORS configuration in backend/app/main.py
# Verify frontend is using correct API URL
```

### ML Model Not Loading
```bash
# Check model file exists
ls models/

# Verify model path in backend/app/ml/model_loader.py
python test_imports.py
```





### Code Style
- Python: PEP 8
- JavaScript: ESLint config included
- Commits: Conventional commits format

## 👥 Authors

- **Development Team**: agri_ai_platform contributors
- **ML Model**: Based on ResNet18 architecture


## 📞 Support & Contact

- **Issues**: GitHub Issues page
- **Email**: harerimana456@gmail.com
- **Documentation**: See `/docs` folder

## 🙏 Acknowledgments

- ResNet18 pre-trained models
- Tailwind CSS community
- FastAPI and SQLAlchemy communities
- Rwanda Ministry of Agriculture

---

**Last Updated**: March 2026
**Version**: 1.0.0

