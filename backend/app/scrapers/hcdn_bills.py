"""
Scraper for HCDN bills (proyectos parlamentarios).

Primary source: CKAN Open Data API
  - Dataset: proyectos-parlamentarios
  - Dataset: leyes-sancionadas
  - Dataset: movimientos-de-proyectos
"""
import csv
import io
from typing import Optional

import structlog

from app.scrapers.base import BaseScraper
from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


class HCDNBillScraper(BaseScraper):
    SOURCE_NAME = "hcdn_bills"

    async def _get_csv_url(self, dataset_id: str) -> Optional[str]:
        url = f"{settings.HCDN_API_BASE}/package_show?id={dataset_id}"
        data = await self.fetch_json(url)
        resources = data.get("result", {}).get("resources", [])
        for r in resources:
            if r.get("format", "").upper() == "CSV":
                return r["url"]
        return None

    async def scrape_bills(self) -> list[dict]:
        """Fetch parliamentary projects from CKAN."""
        csv_url = await self._get_csv_url("proyectos-parlamentarios")
        if not csv_url:
            logger.warning("no CSV found for proyectos-parlamentarios")
            return []

        response = await self.fetch(csv_url)
        return self._parse_bills_csv(response.text)

    def _parse_bills_csv(self, csv_text: str, years: list[int] | None = None) -> list[dict]:
        """
        Parse bills CSV with optional year filter.
        Default: only 2024 and 2025 to keep data current.
        """
        results = []
        reader = csv.DictReader(io.StringIO(csv_text))
        
        # Default years if not specified
        if years is None:
            years = [2024, 2025]
        year_set = set(str(y) for y in years)
        
        logger.info("CSV columns", columns=reader.fieldnames)
        logger.info("filtering by years", years=list(year_set))
        
        for i, row in enumerate(reader):
            # Usar los nombres reales de columnas del CSV de HCDN
            proyecto_id = (row.get("PROYECTO_ID") or "").strip()
            exp_diputados = (row.get("EXP_DIPUTADOS") or "").strip()
            exp_senado = (row.get("EXP_SENADO") or "").strip()
            
            external_id = proyecto_id or exp_diputados or exp_senado
            if not external_id:
                continue
                
            fecha_str = (row.get("PUBLICACION_FECHA") or "").strip()
            
            # Filtrar por año
            if fecha_str:
                # Extraer año de fecha (formato: DD/MM/YYYY o similar)
                year_match = None
                for y in year_set:
                    if y in fecha_str:
                        year_match = y
                        break
                if not year_match:
                    continue  # Saltear si no es de los años solicitados
            
            titulo = (row.get("TITULO") or "").strip()
            
            results.append({
                "external_id": external_id,
                "number": exp_diputados or exp_senado or proyecto_id,
                "title": titulo[:500] if titulo else f"Proyecto {external_id}",
                "summary": titulo[:2000],
                "bill_type": (row.get("TIPO") or "").strip(),
                "status": "",
                "date_presented": fecha_str,
                "author_name": (row.get("AUTOR") or "").strip(),
                "author_id": "",
                "author_role": "author",
                "period": "",
                "chamber": (row.get("CAMARA_ORIGEN") or "deputies").lower(),
            })
            
            if i < 3:
                logger.info("sample row", row_num=i, proyecto_id=proyecto_id, 
                          fecha=fecha_str, titulo_preview=titulo[:50] if titulo else "N/A")
        
        logger.info("parsed bills from CKAN", count=len(results), years=list(year_set))
        return results

    async def scrape_enacted_laws(self) -> list[dict]:
        """Fetch enacted laws from CKAN."""
        csv_url = await self._get_csv_url("leyes-sancionadas")
        if not csv_url:
            return []

        response = await self.fetch(csv_url)
        results = []
        reader = csv.DictReader(io.StringIO(response.text))
        for row in reader:
            results.append({
                "external_id": row.get("ley_numero", row.get("expediente", "")).strip(),
                "number": row.get("ley_numero", "").strip(),
                "title": row.get("sumario", row.get("titulo", "")).strip(),
                "summary": row.get("sumario", "").strip(),
                "date_enacted": row.get("fecha_sancion", row.get("fecha", "")).strip(),
                "chamber": "deputies",
                "status": "enacted",
            })
        logger.info("parsed enacted laws", count=len(results))
        return results

    async def scrape_bill_movements(self) -> list[dict]:
        """Fetch project movements/stages from CKAN."""
        csv_url = await self._get_csv_url("movimientos-de-proyectos")
        if not csv_url:
            return []

        response = await self.fetch(csv_url)
        results = []
        reader = csv.DictReader(io.StringIO(response.text))
        for row in reader:
            results.append({
                "bill_external_id": row.get("expediente", "").strip(),
                "stage_name": row.get("movimiento", row.get("descripcion", "")).strip(),
                "date": row.get("fecha", "").strip(),
                "chamber": "deputies",
            })
        return results
