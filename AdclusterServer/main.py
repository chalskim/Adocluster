from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users_router, auth_router, websocket_router, projects_router
from app.routers.uploads_router import router as uploads_api_router
from app.routers.db_tables import router as db_tables_router
from app.routers.client_ip_router import router as client_ip_router
from app.routers.todos import router as todos_router 
from app.routers.resources import router as resources_router
from app.routers.folders import router as folders_router  # Add folders router import
from app.routers.google_scholar import router as google_scholar_router  # Add this import
from app.routers.pubmed import router as pubmed_router  # Add PubMed router import
from app.routers.ieee import router as ieee_router  # Add IEEE router import
from app.routers.acm import router as acm_router  # Add ACM router import
from app.routers.nalib import router as nalib_router  # Add 국회도서관 router import
from app.routers.kci import router as kci_router  # Add KCI router import
from app.routers.crossref import router as crossref_router  # Add Crossref router import
from app.routers.arxiv import router as arxiv_router  # Add arXiv router import
from routers.doaj import router as doaj_router  # Add DOAJ router import
from routers.core import router as core_router  # Add CORE router import
from routers.semantic_scholar import router as semantic_scholar_router  # Add Semantic Scholar router import
from routers.scopus import router as scopus_router  # Add Scopus router import
from routers.web_of_science import router as web_of_science_router  # Add Web of Science router import
from app.core.database import Base, engine
from app.models import user, project, node, content_block, file, reference, citation, ai_job, revision, team, client_ip, folder
from sqlalchemy import MetaData
import os
import uvicorn # Added for direct uvicorn.run call within main.py
import logging

# 로깅 설정 - INFO 레벨 이상의 로그 출력
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Adcluster API",
    description="API for the Adcluster server",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logger.debug("--- main.py: Skipping database table creation (using migrations instead) ---")

# === IMPORTANT: ROUTE ORDERING MATTERS ===

logger.debug("--- main.py: Including API routers ---")
# Include all API routers first
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(folders_router)  # Add folders router
# WebSocket endpoints don't use prefixes
app.include_router(websocket_router)
# HTTP API endpoints use the /api prefix
app.include_router(websocket_router, prefix="/api", include_in_schema=False)  # Include HTTP endpoints with prefix
app.include_router(uploads_api_router, prefix="/api")
app.include_router(db_tables_router)
app.include_router(client_ip_router)
app.include_router(todos_router)
app.include_router(resources_router)
app.include_router(google_scholar_router)  # Add this line
app.include_router(pubmed_router)  # Add PubMed router
app.include_router(ieee_router)  # Add IEEE router
app.include_router(acm_router)  # Add ACM router
app.include_router(nalib_router)  # Add 국회도서관 router
app.include_router(kci_router)  # Add KCI router
app.include_router(crossref_router)  # Add Crossref router
app.include_router(arxiv_router)  # Add arXiv router
app.include_router(doaj_router, prefix="/api/doaj")  # Add DOAJ router
app.include_router(core_router, prefix="/api/core")  # Add CORE router
app.include_router(semantic_scholar_router, prefix="/api/semantic-scholar")  # Add Semantic Scholar router
app.include_router(scopus_router, prefix="/api/scopus")  # Add Scopus router
app.include_router(web_of_science_router, prefix="/api/web-of-science")  # Add Web of Science router
logger.debug("--- main.py: API routers included ---")

@app.get("/health-check")
async def health_check_endpoint():
    """서버 상태 확인을 위한 엔드포인트"""
    return {"status": "ok", "message": "서버가 정상적으로 실행 중입니다."}

# Define specific GET routes for health and root
@app.get("/health")
async def health_check():
    logger.debug("--- main.py: /health endpoint hit ---")
    return {"status": "healthy"}

@app.get("/")
async def root():
    logger.debug("--- main.py: / root endpoint hit ---")
    # You can keep this or remove it. If removed, the final StaticFiles mount will
    # serve index.html (or socket_test.html if it's renamed or configured) for '/'
    return {"message": "Welcome to Adcluster API"}

# Then include specific static file directories
logger.debug("--- main.py: Mounting /uploads static files ---")
# Mount the entire uploads directory to serve files from all subdirectories
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
logger.debug("--- main.py: /uploads static files mounted ---")

# Mount the test directory to serve socket_test.html
logger.debug("--- main.py: Mounting /test static files ---")
if os.path.exists("test"):
    app.mount("/test", StaticFiles(directory="test"), name="test")
    logger.debug("--- main.py: /test static files mounted ---")
else:
    logger.debug("--- main.py: /test directory not found ---")

# Finally, mount the root static files as a fallback for everything else.
# This ensures API routes and specific static mounts are tried first.
logger.debug("--- main.py: Mounting root static files as fallback ---")
if __name__ == "__main__":
    logger.debug("--- main.py: Checking/Creating 'uploads' directory structure ---")
    # Create the directory structure for file uploads
    directories = ["uploads", "uploads/images", "uploads/documents", "uploads/files"]
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.debug(f"--- main.py: '{directory}' directory created ---")
        else:
            logger.debug(f"--- main.py: '{directory}' directory already exists ---")
    
    # Create test directory if it doesn't exist
    if not os.path.exists("test"):
        os.makedirs("test")
        logger.debug("--- main.py: 'test' directory created ---")
    else:
        logger.debug("--- main.py: 'test' directory already exists ---")
    
    # Copy socket_test.html to test directory if it exists in the root
    socket_test_path = "socket_test.html"
    test_socket_test_path = "test/socket_test.html"
    if os.path.exists(socket_test_path) and not os.path.exists(test_socket_test_path):
        import shutil
        shutil.copy(socket_test_path, test_socket_test_path)
        logger.debug("--- main.py: socket_test.html copied to test directory ---")
    
    logger.info("--- main.py: Starting Uvicorn server ---")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, log_level="info")