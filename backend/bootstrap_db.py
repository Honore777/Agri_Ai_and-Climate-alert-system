"""
Bootstrap script - Create all tables from SQLAlchemy models
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from app.database.base import Base
from app.database.session import DATABASE_URL

# Import all models to register them
from app.models.user import User
from app.models.organization import Organization
from app.models.registration_code import RegistrationCode
from app.models.image import Image
from app.models.prediction import Prediction
from app.models.validation import Validation
from app.models.prediction_review import PredictionReview
from app.models.assignment import Assignment
from app.models.province import Province
from app.models.district import District
from app.models.sector import Sector
from app.models.cell import Cell
from app.models.village import Village

# Create all tables
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)

print("✅ All tables created successfully!")
