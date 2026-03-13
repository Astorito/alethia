"""
Scraper for HCDN (Cámara de Diputados) voting records.

Primary source: CKAN Open Data API at datos.hcdn.gob.ar
  - Dataset: votaciones_nominales / votacionesnominales
  - Dataset: expedientes

Fallback: votaciones.hcdn.gob.ar (SPA with underlying POST endpoints)

Methodology adapted from como_voto:
  - Each voting page has a table of individual legislator votes
  - Vote values: AFIRMATIVO, NEGATIVO, ABSTENCION, AUSENTE, PRESIDENTE
  - Attendance is inferred from vote value (AUSENTE = absent)
  - Trailing AUSENTE votes after mandate ends are discounted
"""
import csv
import io
import re
from datetime import datetime
from typing import Optional

import structlog

from app.scrapers.base import BaseScraper
from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()

VOTE_NORMALIZATION = {
    "AFIRMATIVO": "yes",
    "NEGATIVO": "no",
    "ABSTENCION": "abstain",
    "ABSTENCIÓN": "abstain",
    "AUSENTE": "absent",
    "PRESIDENTE": "present",
}


def normalize_vote(raw: str) -> str:
    raw_upper = raw.strip().upper()
    for key, val in VOTE_NORMALIZATION.items():
        if key in raw_upper:
            return val
    return "absent"


class HCDNVoteScraper(BaseScraper):
    SOURCE_NAME = "hcdn_votes"

    async def _get_dataset_resources(self, dataset_id: str) -> list[dict]:
        url = f"{settings.HCDN_API_BASE}/package_show?id={dataset_id}"
        data = await self.fetch_json(url)
        return data.get("result", {}).get("resources", [])

    async def _get_csv_url(self, dataset_id: str) -> Optional[str]:
        resources = await self._get_dataset_resources(dataset_id)
        for r in resources:
            if r.get("format", "").upper() == "CSV":
                return r["url"]
        return None

    async def scrape_votes_from_ckan(self, period: Optional[int] = None) -> list[dict]:
        """
        Fetch voting records from CKAN. Each row represents one legislator's
        vote in one voting event.
        """
        for dataset_name in ["votaciones_nominales", "votacionesnominales"]:
            csv_url = await self._get_csv_url(dataset_name)
            if csv_url:
                break
        else:
            logger.warning("no CSV found for votaciones nominales in CKAN")
            return []

        logger.info("fetching votes CSV", url=csv_url)
        response = await self.fetch(csv_url)
        return self._parse_votes_csv(response.text)

    def _parse_votes_csv(self, csv_text: str) -> list[dict]:
        results = []
        reader = csv.DictReader(io.StringIO(csv_text))
        for row in reader:
            results.append({
                "vote_external_id": row.get("votacion_id", row.get("acta_id", "")).strip(),
                "vote_title": row.get("votacion_titulo", row.get("asunto", "")).strip(),
                "vote_date": row.get("votacion_fecha", row.get("fecha", "")).strip(),
                "vote_result": row.get("votacion_resultado", row.get("resultado", "")).strip(),
                "vote_type": row.get("votacion_tipo", "").strip(),
                "period": row.get("periodo", "").strip(),
                "legislator_name": row.get("diputado_nombre", "").strip(),
                "legislator_id": row.get("diputado_id", "").strip(),
                "bloc": row.get("bloque_nombre", row.get("bloque", "")).strip(),
                "province": row.get("distrito_nombre", row.get("distrito", "")).strip(),
                "vote_value": normalize_vote(row.get("voto", row.get("voto_tipo", "AUSENTE"))),
                "raw_vote": row.get("voto", row.get("voto_tipo", "")).strip(),
                "chamber": "deputies",
            })
        logger.info("parsed votes from CKAN", count=len(results))
        return results

    async def scrape_vote_page(self, vote_id: str, slug: str = "") -> Optional[dict]:
        """
        Scrape an individual vote page from votaciones.hcdn.gob.ar.
        Adapted from como_voto's hcdn.py parsing logic.
        """
        url = f"{settings.HCDN_VOTES_BASE}/votacion/{vote_id}"
        if slug:
            url = f"{settings.HCDN_VOTES_BASE}/votacion/{slug}/{vote_id}"

        try:
            soup = await self.fetch_soup(url)
        except Exception as e:
            logger.error("failed to fetch vote page", vote_id=vote_id, error=str(e))
            return None

        # Verificar que es una página válida de votación
        if not soup.find(string=re.compile(r"¿CÓMO VOTÓ?")):
            logger.warning("page does not contain voting data", vote_id=vote_id)
            return None

        # Extraer título y fecha
        title = ""
        date = ""
        title_el = soup.find("h4")
        if title_el:
            raw_title = title_el.get_text(strip=True)
            date_match = re.search(r"(\d{2}/\d{2}/\d{4}\s*-?\s*\d{2}:\d{2})", raw_title)
            if date_match:
                date = date_match.group(1).strip()
                title = raw_title[:date_match.start()].strip()
            else:
                title = raw_title

        # Fallback para fecha
        if not date:
            for h5 in soup.find_all("h5"):
                text = h5.get_text(strip=True)
                if re.search(r"\d{2}/\d{2}/\d{4}", text):
                    date = text
                    break

        # Extraer período
        period = ""
        period_el = soup.find("h5", string=re.compile(r"Período"))
        if period_el:
            period = period_el.get_text(strip=True)

        # Extraer resultado
        result = ""
        result_h3 = soup.find("h3")
        if result_h3:
            result = result_h3.get_text(strip=True)

        # Extraer tipo de votación
        vote_type = ""
        for text in soup.find_all(string=re.compile(r"EN GENERAL|EN PARTICULAR", re.I)):
            vote_type = text.strip()
            break

        # Extraer conteos y posiciones
        counts = self._parse_vote_counts(soup)
        positions = self._parse_vote_table(soup)

        return {
            "external_id": vote_id,
            "title": title,
            "date": date,
            "period": period,
            "result": result,
            "vote_type": vote_type,
            "counts": counts,
            "positions": positions,
        }

    def _parse_vote_counts(self, soup) -> dict[str, int]:
        """
        Extract aggregate vote counts (como_voto methodology).
        Parse h3/h4 pairs to get afirmativo, negativo, abstencion, ausente.
        """
        counts = {
            "afirmativo": 0,
            "negativo": 0,
            "abstencion": 0,
            "ausente": 0,
        }
        for h3, h4 in zip(soup.find_all("h3"), soup.find_all("h4")):
            try:
                count = int(h3.get_text(strip=True))
                label = h4.get_text(strip=True).upper()
                if "AFIRMATIVO" in label:
                    counts["afirmativo"] = count
                elif "NEGATIVO" in label:
                    counts["negativo"] = count
                elif "ABSTENCI" in label:
                    counts["abstencion"] = count
                elif "AUSENTE" in label:
                    counts["ausente"] = count
            except (ValueError, AttributeError):
                continue
        return counts

    def _parse_vote_table(self, soup) -> list[dict]:
        """
        Parse individual votes from HTML table.
        Adapted from como_voto's extract_votes_from_table.
        Each row: [0]=photo_link, [1]=name, [2]=bloc, [3]=province, [4]=vote
        """
        positions = []
        table = soup.find("table")
        if not table:
            logger.warning("no vote table found in HCDN page")
            return positions

        for row in table.find_all("tr"):
            cols = row.find_all("td")
            if len(cols) < 5:
                continue

            # Extraer photo_id del link en la primera columna
            photo_link = cols[0].find("a", href=True)
            photo_id = ""
            if photo_link:
                photo_id = photo_link["href"].rstrip("/").split("/")[-1]

            name = cols[1].get_text(strip=True)
            if not name or name.upper() in ("DIPUTADO", "NOMBRE", "APELLIDO"):
                continue

            bloc = cols[2].get_text(strip=True)
            province = cols[3].get_text(strip=True)
            raw_vote = cols[4].get_text(strip=True)

            positions.append({
                "legislator_name": name,
                "legislator_photo_id": photo_id,
                "bloc": bloc,
                "province": province,
                "vote_value": normalize_vote(raw_vote),
                "raw_vote": raw_vote,
            })

        logger.info("parsed HCDN vote positions", count=len(positions))
        return positions

    async def build_slug_map(self, year: int) -> dict[str, str]:
        """
        Build a map of vote_id -> URL slug for a given year.
        Como_voto methodology: POST to search endpoint, extract redirectActa calls.
        """
        url = f"{settings.HCDN_VOTES_BASE}/votaciones/search"
        try:
            response = await self.post(url, data={"anio": str(year)})
        except Exception as e:
            logger.error("failed to build slug map", year=year, error=str(e))
            return {}

        slug_map = {}
        pattern = re.compile(r"redirectActa\(\s*'?(\d+)'?\s*,\s*'?[^']*'?\s*,\s*'([^']+)'\s*\)")
        for match in pattern.finditer(response.text):
            vote_id = match.group(1)
            slug = match.group(2)
            slug_map[vote_id] = slug

        logger.info("built slug map", year=year, count=len(slug_map))
        return slug_map
