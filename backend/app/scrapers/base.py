"""
Base scraper with rate limiting, retries, and audit logging.
Inspired by como_voto's scraping patterns: incremental fetching,
configurable delay, and a custom user-agent.
"""
import asyncio
import time
from datetime import datetime
from typing import Optional
from uuid import UUID

import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from bs4 import BeautifulSoup

from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


class BaseScraper:
    """
    Abstract base for all Alethia scrapers.
    Provides an httpx async client with rate limiting and retry logic.
    """

    SOURCE_NAME: str = "base"

    def __init__(self):
        self._last_request_time: float = 0
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                headers={
                    "User-Agent": settings.SCRAPER_USER_AGENT,
                    "Accept": "text/html,application/json,application/xhtml+xml",
                    "Accept-Language": "es-AR,es;q=0.9",
                },
                timeout=httpx.Timeout(30.0, connect=10.0),
                follow_redirects=True,
                limits=httpx.Limits(max_connections=5, max_keepalive_connections=2),
            )
        return self._client

    async def _rate_limit(self):
        elapsed = time.monotonic() - self._last_request_time
        if elapsed < settings.SCRAPER_REQUEST_DELAY:
            await asyncio.sleep(settings.SCRAPER_REQUEST_DELAY - elapsed)
        self._last_request_time = time.monotonic()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectError, httpx.ReadTimeout)),
    )
    async def fetch(self, url: str, **kwargs) -> httpx.Response:
        await self._rate_limit()
        client = await self._get_client()
        log = logger.bind(scraper=self.SOURCE_NAME, url=url)
        log.info("fetching")
        response = await client.get(url, **kwargs)
        response.raise_for_status()
        log.info("fetched", status=response.status_code, size=len(response.content))
        return response

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectError, httpx.ReadTimeout)),
    )
    async def post(self, url: str, **kwargs) -> httpx.Response:
        await self._rate_limit()
        client = await self._get_client()
        response = await client.post(url, **kwargs)
        response.raise_for_status()
        return response

    async def fetch_soup(self, url: str, **kwargs) -> BeautifulSoup:
        response = await self.fetch(url, **kwargs)
        return BeautifulSoup(response.text, "lxml")

    async def fetch_json(self, url: str, **kwargs) -> dict:
        response = await self.fetch(url, **kwargs)
        return response.json()

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()
