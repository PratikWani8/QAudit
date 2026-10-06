from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.api import api_router
from app.database.session import engine, Base, SessionLocal
from app.validators.validator_service import ValidatorService
from app.websocket.manager import ws_manager
from app.models.models import Election, User
from app.core.security import get_password_hash

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables & default seeds exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ValidatorService.ensure_default_validators(db)
        
        # Seed default administrative accounts if not present
        if not db.query(User).filter((User.username == "admin") | (User.email == "admin@qaudit.gov")).first():
            admin_user = User(
                username="admin",
                email="admin@qaudit.gov",
                hashed_password=get_password_hash("admin123"),
                role="SUPER_ADMIN",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Quantum-Resilient, Privacy-Preserving Election Verification & Audit Network API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hackathon development setting
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Master API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Real-time WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection open & handle incoming client messages if any
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "network": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }
