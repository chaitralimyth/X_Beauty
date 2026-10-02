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


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
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