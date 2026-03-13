"""
Scraper for the Argentine Senate (senado.gob.ar).

The Senate does NOT have a CKAN API like HCDN, so all data
comes from HTML scraping.

Data sources:
  - Senators list: /senadores/listados/listaSenadoRes
  - Voting records: /votaciones/actas (POST-based, like como_voto)
  - Individual vote detail: /votaciones/detalleActa/{id}
  - Bills: /parlamentario/parlamentaria/
  - Transcripts: /parlamentario/sesiones/busquedaTac

Methodology for vote parsing is adapted from como_voto's senado.py:
  - POST to /votaciones/actas with year to get acta links
  - Each acta has title, date, result, type, and a vote table
  - Names are cleaned (remove "Foto de...Nacional" prefixes)
"""
import re
from datetime import datetime
from typing import Optional

import structlog
from bs4 import BeautifulSoup

from app.scrapers.base import BaseScraper
from app.scrapers.hcdn_votes import normalize_vote
from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


def clean_senado_name(raw_name: str) -> str:
    """Clean senator names: remove 'Foto de...Nacional' prefix."""
    cleaned = re.sub(r"^Foto\s+de\s+.*?Nacional\s*", "", raw_name, flags=re.IGNORECASE)
    return cleaned.strip()


class SenateScraper(BaseScraper):
    SOURCE_NAME = "senate"

    async def scrape_senators(self) -> list[dict]:
        """Scrape the current senators list from HTML."""
        url = f"{settings.SENATE_BASE}/senadores/listados/listaSenadoRes"
        soup = await self.fetch_soup(url)
        results = []

        table = soup.find("table")
        if not table:
            rows = soup.select(".senadores-list .card, .senador-item, tr")
            if not rows:
                logger.error("no senator data found")
                return results

        rows = table.find_all("tr") if table else soup.select("tr")
        for row in rows[1:]:
            cols = row.find_all("td")
            if len(cols) < 4:
                continue

            photo_tag = cols[0].find("img")
            photo_url = photo_tag["src"] if photo_tag and photo_tag.get("src") else ""

            link_tag = cols[1].find("a") or cols[0].find("a")
            external_id = ""
            if link_tag and link_tag.get("href"):
                match = re.search(r"/senador/(\d+)", link_tag["href"])
                if match:
                    external_id = match.group(1)

            full_name = clean_senado_name(cols[1].get_text(strip=True))

            results.append({
                "external_id": external_id,
                "full_name": full_name,
                "province": cols[2].get_text(strip=True) if len(cols) > 2 else "",
                "party": cols[3].get_text(strip=True) if len(cols) > 3 else "",
                "period": cols[4].get_text(strip=True) if len(cols) > 4 else "",
                "photo_url": photo_url,
                "chamber": "senate",
                "source": "html_scrape",
            })

        logger.info("parsed senators", count=len(results))
        return results

    async def scrape_vote_list(self, year: int) -> list[dict]:
        """
        Get list of vote actas for a given year.
        Adapted from como_voto's senado.py: POST to /votaciones/actas.
        """
        url = f"{settings.SENATE_BASE}/votaciones/actas"
        try:
            response = await self.post(url, data={"busqueda_actas[anio]": str(year)})
        except Exception as e:
            logger.error("failed to fetch senate vote list", year=year, error=str(e))
            return []

        soup = BeautifulSoup(response.text, "lxml")
        results = []

        links = soup.find_all("a", href=re.compile(r"/votaciones/detalleActa/\d+"))
        for link in links:
            acta_id_match = re.search(r"/detalleActa/(\d+)", link["href"])
            if not acta_id_match:
                continue

            results.append({
                "acta_id": acta_id_match.group(1),
                "title": link.get_text(strip=True),
                "url": f"{settings.SENATE_BASE}{link['href']}",
                "year": year,
            })

        logger.info("found senate vote actas", year=year, count=len(results))
        return results

    async def scrape_vote_detail(self, acta_id: str) -> Optional[dict]:
        """
        Scrape individual vote detail page.
        Adapted from como_voto's senado.py parsing.
        """
        url = f"{settings.SENATE_BASE}/votaciones/detalleActa/{acta_id}"
        try:
            soup = await self.fetch_soup(url)
        except Exception as e:
            logger.error("failed to fetch senate vote detail", acta_id=acta_id, error=str(e))
            return None

        # Buscar contenedor principal (como_voto methodology)
        content = soup.find("div", class_=re.compile("content|main|votacion", re.I))
        if not content:
            content = soup

        # Extraer título - buscar párrafos hermanos de "Acta Nro" primero
        title = ""
        acta_nro_p = content.find("p", string=re.compile(r"Acta Nro", re.I))
        if acta_nro_p:
            for sibling in acta_nro_p.find_next_siblings():
                if sibling.name != "p":
                    continue
                text = sibling.get_text(strip=True)
                if text and "Secretaría" not in text and "Honorable" not in text:
                    title = text[:300]
                    break

        # Fallback: buscar por keywords
        if not title:
            for text_node in content.find_all(string=True):
                text = text_node.strip()
                if len(text) > 20 and any(
                    keyword in text.lower()
                    for keyword in ["ley", "proyecto", "pliego", "acuerdo", "modificación", "régimen", "designación"]
                ):
                    title = text[:300]
                    break

        # Fallback final: usar h2/h3/h1
        if not title:
            for tag in ["h2", "h3", "h1"]:
                element = content.find(tag)
                if element and len(element.get_text(strip=True)) > 10:
                    title = element.get_text(strip=True)
                    break

        # Extraer fecha
        date_match = re.search(r"(\d{2}/\d{2}/\d{4})\s*-?\s*(\d{2}:\d{2})?", content.get_text())
        vote_date = date_match.group(0).strip() if date_match else ""

        # Extraer resultado
        result = ""
        for text in content.find_all(string=re.compile(r"AFIRMATIVO|NEGATIVO", re.I)):
            result = text.strip()
            break

        # Extraer tipo de votación
        type_vote = ""
        for text in content.find_all(string=re.compile(r"EN GENERAL|EN PARTICULAR", re.I)):
            type_vote = text.strip()
            break

        # Extraer conteos y posiciones
        counts = self._parse_vote_counts(content)
        positions = self._parse_senate_vote_table(content)

        # Calcular totales desde las posiciones
        calc_counts = {"yes": 0, "no": 0, "abstain": 0, "absent": 0}
        for p in positions:
            v = p["vote_value"]
            if v in calc_counts:
                calc_counts[v] += 1

        return {
            "external_id": acta_id,
            "title": title,
            "date": vote_date,
            "result": result,
            "vote_type": type_vote,
            "counts": calc_counts,
            "positions": positions,
            "chamber": "senate",
        }

    def _parse_vote_counts(self, container) -> dict[str, int]:
        """
        Parse h3/h4 vote counters (como_voto methodology).
        Returns counts: afirmativo, negativo, abstencion, ausente.
        """
        counts = {
            "afirmativo": 0,
            "negativo": 0,
            "abstencion": 0,
            "ausente": 0,
        }
        for h3, h4 in zip(container.find_all("h3"), container.find_all("h4")):
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

    def _parse_senate_vote_table(self, soup: BeautifulSoup) -> list[dict]:
        """
        Parse individual senator votes from the acta detail page.
        Adapted from como_voto's extract_votes_from_table.
        """
        positions = []
        table = soup.find("table")
        if not table:
            logger.warning("no vote table found in senate acta")
            return positions

        for row in table.find_all("tr"):
            cols = row.find_all("td")
            if len(cols) < 5:
                continue

            # Columnas: [0]=foto/link, [1]=nombre, [2]=bloque, [3]=provincia, [4]=voto
            raw_name = cols[1].get_text(strip=True)
            name = clean_senado_name(raw_name)
            if not name or name.upper() in ("SENADOR", "NOMBRE", "APELLIDO", "BLOQUE"):
                continue

            bloc = cols[2].get_text(strip=True) if len(cols) > 2 else ""
            province = cols[3].get_text(strip=True) if len(cols) > 3 else ""
            raw_vote = cols[4].get_text(strip=True) if len(cols) > 4 else "AUSENTE"

            positions.append({
                "legislator_name": name,
                "province": province,
                "bloc": bloc,
                "vote_value": normalize_vote(raw_vote),
                "raw_vote": raw_vote,
            })

        logger.info("parsed senate vote positions", count=len(positions))
        return positions

    async def scrape_senate_bills(self) -> list[dict]:
        """Scrape bill listings from the Senate parliamentary section."""
        url = f"{settings.SENATE_BASE}/parlamentario/parlamentaria/"
        try:
            soup = await self.fetch_soup(url)
        except Exception as e:
            logger.warning("failed to fetch senate bills page", error=str(e))
            return []

        results = []
        for item in soup.select("table tr, .proyecto-item, .list-group-item"):
            cols = item.find_all("td")
            if len(cols) < 3:
                continue

            results.append({
                "number": cols[0].get_text(strip=True),
                "title": cols[1].get_text(strip=True),
                "status": cols[2].get_text(strip=True) if len(cols) > 2 else "",
                "date": cols[3].get_text(strip=True) if len(cols) > 3 else "",
                "author": cols[4].get_text(strip=True) if len(cols) > 4 else "",
                "chamber": "senate",
            })

        logger.info("parsed senate bills", count=len(results))
        return results
