import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


# Detectar la raiz del proyecto (donde esta el .env)
# Este archivo esta en backend/app/config.py, asi que subimos 2 niveles
PROJECT_ROOT = Path(__file__).parent.parent.parent
ENV_PATH = PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://alethia:alethia_secret@localhost:5432/alethia"
    DATABASE_URL_SYNC: str = "postgresql://alethia:alethia_secret@localhost:5432/alethia"
    REDIS_URL: str = "redis://localhost:6379/0"
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "alethia_minio"
    MINIO_SECRET_KEY: str = "alethia_minio_secret"

    HCDN_API_BASE: str = "https://datos.hcdn.gob.ar/api/3/action"
    HCDN_WEB_BASE: str = "https://www.hcdn.gob.ar"
    HCDN_VOTES_BASE: str = "https://votaciones.hcdn.gob.ar"
    SENATE_BASE: str = "https://www.senado.gob.ar"
    CASA_ROSADA_BASE: str = "https://www.casarosada.gob.ar"
    ANTICORRUPCION_BASE: str = "https://www.argentina.gob.ar/anticorrupcion"

    SCRAPER_USER_AGENT: str = "Alethia-Scraper/1.0 (+https://github.com/mosaico-analitica/alethia; Transparency platform)"
    SCRAPER_REQUEST_DELAY: float = 0.5

    class Config:
        env_file = str(ENV_PATH)
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
