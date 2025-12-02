from fastapi import APIRouter
from app.api.v1 import routes_auth, routes_notes, routes_exports

api_router = APIRouter()

# Include all route modules
api_router.include_router(routes_auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(routes_notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(routes_exports.router, prefix="/exports", tags=["exports"])