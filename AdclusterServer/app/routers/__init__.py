# Routers package initialization
from .users import router as users_router
from .auth import router as auth_router
from .websocket import router as websocket_router
from .uploads import router as uploads_router
from .projects import router as projects_router
from .google_scholar import router as google_scholar_router
from .pubmed import router as pubmed_router

__all__ = ["users_router", "auth_router", "websocket_router", "uploads_router", "projects_router", "google_scholar_router", "pubmed_router"]