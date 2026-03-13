"""
Scraper for asset declarations from the Anti-Corruption Office.
Source: argentina.gob.ar/anticorrupcion

Asset declarations (Declaraciones Juradas Patrimoniales) are published
by the Oficina Anticorrupción for current and former officials.
"""
import re
from typing import Optional

import structlog

from app.scrapers.base import BaseScraper
from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


class AssetDeclarationScraper(BaseScraper):
    SOURCE_NAME = "asset_declarations"

    async def scrape_declarations_index(self) -> list[dict]:
        """
        Scrape the declarations index page.
        The OA publishes a searchable list of officials with their
        declaration summaries.
        """
        url = f"{settings.ANTICORRUPCION_BASE}/declaraciones-juradas"
        try:
            soup = await self.fetch_soup(url)
        except Exception as e:
            logger.error("failed to fetch declarations page", error=str(e))
            return []

        results = []
        for item in soup.select("table tr, .declaration-item, .views-row"):
            cols = item.find_all("td")
            if len(cols) < 3:
                link_tag = item.find("a")
                if link_tag:
                    results.append({
                        "official_name": link_tag.get_text(strip=True),
                        "source_url": link_tag.get("href", ""),
                    })
                continue

            name = cols[0].get_text(strip=True)
            role = cols[1].get_text(strip=True) if len(cols) > 1 else ""
            year = cols[2].get_text(strip=True) if len(cols) > 2 else ""
            link = cols[-1].find("a")
            detail_url = link["href"] if link and link.get("href") else ""

            year_num = None
            year_match = re.search(r"\d{4}", year)
            if year_match:
                year_num = int(year_match.group())

            results.append({
                "official_name": name,
                "role": role,
                "declaration_year": year_num,
                "source_url": detail_url,
            })

        logger.info("found declaration entries", count=len(results))
        return results

    async def scrape_declaration_detail(self, url: str) -> Optional[dict]:
        """
        Scrape individual declaration detail page.
        
        Declarations may include:
        - Total patrimony
        - Real estate
        - Vehicles
        - Investments
        - Company participations
        """
        if not url.startswith("http"):
            url = f"https://www.argentina.gob.ar{url}"

        try:
            soup = await self.fetch_soup(url)
        except Exception as e:
            logger.error("failed to fetch declaration detail", url=url, error=str(e))
            return None

        total_assets = None
        items = []

        for table in soup.find_all("table"):
            headers = [th.get_text(strip=True).lower() for th in table.find_all("th")]

            for row in table.find_all("tr"):
                cols = row.find_all("td")
                if len(cols) < 2:
                    continue

                category = _infer_category(headers, cols)
                description = cols[0].get_text(strip=True) if cols else ""
                value_text = cols[-1].get_text(strip=True) if cols else ""
                value = _parse_money(value_text)

                company_name = None
                if category == "company":
                    company_name = description

                items.append({
                    "category": category,
                    "description": description,
                    "value": value,
                    "company_name": company_name,
                })

        for tag in soup.find_all(["strong", "b", "h4", "td"]):
            text = tag.get_text(strip=True)
            if "PATRIMONIO" in text.upper() or "TOTAL" in text.upper():
                sibling = tag.find_next_sibling() or tag.find_next("td")
                if sibling:
                    total_assets = _parse_money(sibling.get_text(strip=True))
                    break

        return {
            "total_assets": total_assets,
            "items": items,
            "source_url": url,
        }


def _infer_category(headers: list[str], cols) -> str:
    """Infer asset category from table context."""
    header_text = " ".join(headers).lower()
    col_text = " ".join(c.get_text(strip=True).lower() for c in cols)

    if any(k in header_text or k in col_text for k in ["inmueble", "propiedad", "terreno"]):
        return "real_estate"
    if any(k in header_text or k in col_text for k in ["vehiculo", "vehículo", "automotor"]):
        return "vehicle"
    if any(k in header_text or k in col_text for k in ["inversión", "inversion", "plazo fijo", "titulo"]):
        return "investment"
    if any(k in header_text or k in col_text for k in ["sociedad", "empresa", "participación"]):
        return "company"
    if any(k in header_text or k in col_text for k in ["banco", "cuenta", "depósito"]):
        return "bank_account"
    return "other"


def _parse_money(text: str) -> Optional[float]:
    """Parse Argentine currency strings."""
    cleaned = re.sub(r"[^\d.,]", "", text)
    cleaned = cleaned.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return None
