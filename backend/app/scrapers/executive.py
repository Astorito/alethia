"""
Scraper for the Executive Branch (Casa Rosada / casarosada.gob.ar).

Extracts:
  - Presidential speeches and announcements
  - Decrees (DNUs and regular decrees)
  - Cabinet composition (from argentina.gob.ar)
"""
import re
from typing import Optional

import structlog
from bs4 import BeautifulSoup

from app.scrapers.base import BaseScraper
from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


class ExecutiveScraper(BaseScraper):
    SOURCE_NAME = "executive"

    async def scrape_speeches(self, page: int = 1) -> list[dict]:
        """Scrape presidential speeches/announcements from Casa Rosada."""
        url = f"{settings.CASA_ROSADA_BASE}/informacion/discursos"
        params = {"page": page} if page > 1 else {}

        try:
            soup = await self.fetch_soup(url, params=params)
        except Exception as e:
            logger.error("failed to fetch executive speeches", error=str(e))
            return []

        results = []
        for article in soup.select("article, .node, .views-row, .discurso-item"):
            title_tag = article.find(["h2", "h3", "h4"]) or article.find("a")
            if not title_tag:
                continue

            title = title_tag.get_text(strip=True)
            link = title_tag.find("a") or title_tag
            detail_url = link.get("href", "") if link.name == "a" else ""
            if detail_url and not detail_url.startswith("http"):
                detail_url = f"{settings.CASA_ROSADA_BASE}{detail_url}"

            date_tag = article.find(["time", "span"], class_=re.compile(r"date|fecha"))
            date_text = date_tag.get_text(strip=True) if date_tag else ""

            summary_tag = article.find(["p", "div"], class_=re.compile(r"summary|body|field"))
            summary = summary_tag.get_text(strip=True)[:500] if summary_tag else ""

            results.append({
                "action_type": "speech",
                "title": title,
                "date": date_text,
                "summary": summary,
                "source_url": detail_url,
            })

        logger.info("parsed executive speeches", count=len(results), page=page)
        return results

    async def scrape_speech_detail(self, url: str) -> Optional[dict]:
        """Fetch full text of a presidential speech."""
        try:
            soup = await self.fetch_soup(url)
        except Exception as e:
            logger.error("failed to fetch speech detail", url=url, error=str(e))
            return None

        content_div = soup.find("div", class_=re.compile(r"field-item|body|content|article-body"))
        if not content_div:
            content_div = soup.find("article")

        text = content_div.get_text(separator="\n", strip=True) if content_div else ""
        return {"full_text": text, "source_url": url}

    async def scrape_decrees(self, page: int = 1) -> list[dict]:
        """Scrape decrees from infoleg or boletín oficial."""
        url = "https://www.boletinoficial.gob.ar/seccion/primera"
        try:
            soup = await self.fetch_soup(url)
        except Exception as e:
            logger.warning("failed to fetch boletín oficial, trying Casa Rosada", error=str(e))
            return await self._scrape_decrees_from_casa_rosada()

        results = []
        for item in soup.select("article, .decreto-item, .norma-item"):
            title_tag = item.find(["h2", "h3", "a", "strong"])
            if not title_tag:
                continue

            title = title_tag.get_text(strip=True)

            action_type = "decree"
            title_upper = title.upper()
            if "DNU" in title_upper or "NECESIDAD Y URGENCIA" in title_upper:
                action_type = "dnu"
            elif "RESOLUCIÓN" in title_upper or "RESOLUCION" in title_upper:
                action_type = "resolution"

            number_match = re.search(r"(\d+/\d{4})", title)
            number = number_match.group(1) if number_match else ""

            date_tag = item.find(["time", "span"], class_=re.compile(r"date|fecha"))
            date_text = date_tag.get_text(strip=True) if date_tag else ""

            results.append({
                "action_type": action_type,
                "title": title,
                "number": number,
                "date": date_text,
                "summary": "",
                "source_url": "",
            })

        logger.info("parsed executive decrees", count=len(results))
        return results

    async def _scrape_decrees_from_casa_rosada(self) -> list[dict]:
        """Fallback: try Casa Rosada decree page."""
        url = f"{settings.CASA_ROSADA_BASE}/informacion/decretos"
        try:
            soup = await self.fetch_soup(url)
        except Exception:
            return []

        results = []
        for item in soup.select("article, .views-row"):
            title_tag = item.find(["h2", "h3", "a"])
            if not title_tag:
                continue
            results.append({
                "action_type": "decree",
                "title": title_tag.get_text(strip=True),
                "date": "",
                "source_url": "",
            })
        return results
