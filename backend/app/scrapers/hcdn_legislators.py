"""
Scraper for HCDN (Cámara de Diputados) legislators.

Primary source: CKAN Open Data API at datos.hcdn.gob.ar
Fallback: HTML table at hcdn.gob.ar/diputados/

The CKAN API provides structured CSV/JSON datasets for:
- legisladores: current composition of the chamber
- bloques-interbloques-e-integracion: parliamentary blocs
- comisiones: committee memberships
"""
import csv
import io
from datetime import date, datetime
from typing import Optional

import structlog

from app.scrapers.base import BaseScraper
from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


class HCDNLegislatorScraper(BaseScraper):
    SOURCE_NAME = "hcdn_legislators"

    async def _get_dataset_resources(self, dataset_id: str) -> list[dict]:
        """Fetch resource URLs from a CKAN dataset."""
        url = f"{settings.HCDN_API_BASE}/package_show?id={dataset_id}"
        data = await self.fetch_json(url)
        return data.get("result", {}).get("resources", [])

    async def _get_csv_resource_url(self, dataset_id: str) -> Optional[str]:
        resources = await self._get_dataset_resources(dataset_id)
        for r in resources:
            if r.get("format", "").upper() == "CSV":
                return r["url"]
        return None

    async def scrape_legislators(self) -> list[dict]:
        """
        Fetch current deputies from the CKAN 'legisladores' dataset.
        Returns a list of dicts with normalized fields.
        """
        csv_url = await self._get_csv_resource_url("legisladores")
        if not csv_url:
            logger.warning("no CSV resource found for legisladores, falling back to HTML")
            return await self._scrape_legislators_html()

        logger.info("fetching legislators CSV", url=csv_url)
        response = await self.fetch(csv_url)
        return self._parse_legislators_csv(response.text)

    def _parse_legislators_csv(self, csv_text: str) -> list[dict]:
        """Parse the CKAN legislators CSV into normalized dicts."""
        results = []
        reader = csv.DictReader(io.StringIO(csv_text))
        for row in reader:
            results.append({
                "external_id": row.get("diputado_id", "").strip(),
                "full_name": row.get("diputado_nombre", "").strip(),
                "last_name": row.get("diputado_apellido", "").strip(),
                "first_name": row.get("diputado_nombre_pila", row.get("diputado_nombre", "")).strip(),
                "province": row.get("distrito_nombre", row.get("distrito", "")).strip(),
                "party": row.get("bloque_nombre", row.get("bloque", "")).strip(),
                "bloc": row.get("bloque_nombre", row.get("bloque", "")).strip(),
                "interbloc": row.get("interbloque_nombre", "").strip(),
                "mandate_start": row.get("mandato_inicio", "").strip(),
                "mandate_end": row.get("mandato_fin", "").strip(),
                "photo_url": row.get("foto_url", row.get("foto", "")).strip(),
                "chamber": "deputies",
                "source": "ckan_api",
            })
        logger.info("parsed legislators", count=len(results))
        return results

    async def _scrape_legislators_html(self) -> list[dict]:
        """Fallback: parse the HCDN diputados HTML table."""
        soup = await self.fetch_soup(f"{settings.HCDN_WEB_BASE}/diputados/")
        results = []
        table = soup.find("table")
        if not table:
            logger.error("no table found in deputies page")
            return results

        rows = table.find_all("tr")
        for row in rows[1:]:  # skip header
            cols = row.find_all("td")
            if len(cols) < 6:
                continue

            photo_tag = cols[0].find("img")
            photo_url = photo_tag["src"] if photo_tag and photo_tag.get("src") else ""
            link_tag = cols[1].find("a")

            results.append({
                "external_id": link_tag["href"].split("/")[-2] if link_tag else "",
                "full_name": cols[1].get_text(strip=True),
                "province": cols[2].get_text(strip=True),
                "party": cols[3].get_text(strip=True),
                "bloc": cols[3].get_text(strip=True),
                "mandate_start": cols[5].get_text(strip=True),
                "mandate_end": cols[6].get_text(strip=True) if len(cols) > 6 else "",
                "photo_url": photo_url,
                "chamber": "deputies",
                "source": "html_scrape",
            })
        logger.info("parsed legislators from HTML", count=len(results))
        return results

    async def scrape_blocs(self) -> list[dict]:
        """Fetch parliamentary blocs from CKAN dataset."""
        csv_url = await self._get_csv_resource_url("bloques-interbloques-e-integracion")
        if not csv_url:
            return []

        response = await self.fetch(csv_url)
        results = []
        reader = csv.DictReader(io.StringIO(response.text))
        for row in reader:
            results.append({
                "name": row.get("bloque_nombre", "").strip(),
                "short_name": row.get("bloque_nombre_corto", "").strip(),
                "interbloc_name": row.get("interbloque_nombre", "").strip(),
                "president_name": row.get("bloque_presidente", "").strip(),
                "member_count": int(row.get("bloque_cantidad_miembros", 0) or 0),
                "external_id": row.get("bloque_id", "").strip(),
                "chamber": "deputies",
            })
        return results

    async def scrape_committees(self) -> list[dict]:
        """Fetch committees from CKAN dataset."""
        csv_url = await self._get_csv_resource_url("comisiones")
        if not csv_url:
            return []

        response = await self.fetch(csv_url)
        results = []
        reader = csv.DictReader(io.StringIO(response.text))
        for row in reader:
            results.append({
                "committee_name": row.get("comision_nombre", "").strip(),
                "committee_id": row.get("comision_id", "").strip(),
                "legislator_name": row.get("diputado_nombre", "").strip(),
                "legislator_id": row.get("diputado_id", "").strip(),
                "role": row.get("cargo", "miembro").strip().lower(),
                "chamber": "deputies",
            })
        return results
