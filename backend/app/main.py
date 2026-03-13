"""
Alethia Backend — FastAPI Application

Internal API that powers the political transparency platform.
Exposes endpoints for legislators, votes, bills, sessions,
executive actions, and asset declarations.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import politicians, votes, bills, sessions, executive, assets, pipeline


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Alethia API",
    description="Data API for Argentine political transparency platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://alethia.ar"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(politicians.router, prefix="/api/v1")
app.include_router(votes.router, prefix="/api/v1")
app.include_router(bills.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(executive.router, prefix="/api/v1")
app.include_router(assets.router, prefix="/api/v1")
app.include_router(pipeline.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "alethia-api"}
