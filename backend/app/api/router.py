from fastapi import APIRouter
from app.api.v1 import organizations, users, auth, registration_code, inference, locations, predictions, validations, assignments, agronomists, images

api_router= APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(organizations.router)
api_router.include_router(registration_code.router)
api_router.include_router(inference.router)
api_router.include_router(locations.router)
api_router.include_router(predictions.router)
api_router.include_router(validations.router)
api_router.include_router(assignments.router)
api_router.include_router(agronomists.router)
api_router.include_router(images.router)

