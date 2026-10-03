import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine

from .auth import router as auth_router
from .bookings import router as bookings_router
from .messages import router as messages_router
from .services import router as services_router
from .stylists import router as stylists_router
from .offers import router as offers_router
from .dashboard import router as dashboard_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="X Beauty API",
    description="Backend API for X Beauty demo website",
    version="1.0.0"
)


from .chakravyuh_integration import ChakravyuhSentinelMiddleware

# =========================
# SECURITY & CORS MIDDLEWARE
# =========================

# Chakravyuh Sentinel Security Integration Layer
app.add_middleware(ChakravyuhSentinelMiddleware)

# CORS Configuration:
# - Local development explicitly supports Vite & Next frontend origins (5173, 3000)
# - Production origins are configurable via CORS_ORIGINS environment variable
# - Never use "*" together with allow_credentials=True (prohibited by W3C CORS spec)
DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_cors = os.getenv("CORS_ORIGINS", "")
if env_cors.strip():
    ALLOWED_CORS_ORIGINS = [
        origin.strip()
        for origin in env_cors.split(",")
        if origin.strip() and origin.strip() != "*"
    ]
else:
    ALLOWED_CORS_ORIGINS = DEFAULT_CORS_ORIGINS

# Outermost middleware handles CORS for browser clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# =========================
# API ROUTERS
# =========================

app.include_router(auth_router)

app.include_router(bookings_router)

app.include_router(messages_router)

app.include_router(services_router)

app.include_router(stylists_router)

app.include_router(offers_router)

app.include_router(dashboard_router)


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {
        "message": "X Beauty API is running",
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "X Beauty backend is working"
    }