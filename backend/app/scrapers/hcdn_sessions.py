"""
Scraper for HCDN sessions and transcripts.

Primary source: CKAN datasets
  - sesiones: session records
  - diarios-de-sesiones: stenographic transcripts (versiones taquigráficas)

Transcripts are parsed to extract individual speeches, following
a pattern-based approach: speaker labels like "Sr. DIPUTADO FERNÁNDEZ.-"
appear at the start of each intervention.
"""
import csv
import io
import re
from typing import Optional

import structlog

from app.scrapers.base import BaseScraper
from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()

SPEAKER_PATTERN = re.compile(
    r"^(Sra?\.\s+(?:DIPUTAD[OA]|PRESIDENT[AE]|SECRETARI[OA])\s+[\w\s]+)\.-\s*",
    re.MULTILINE | re.IGNORECASE,
)


class HCDNSessionScraper(BaseScraper):
    SOURCE_NAME = "hcdn_sessions"

    async def _get_csv_url(self, dataset_id: str) -> Optional[str]:
        url = f"{settings.HCDN_API_BASE}/package_show?id={dataset_id}"
        data = await self.fetch_json(url)
        resources = data.get("result", {}).get("resources", [])
        for r in resources:
            if r.get("format", "").upper() == "CSV":
                return r["url"]
        return None

    async def scrape_sessions(self) -> list[dict]:
        """Fetch session records from CKAN."""
        csv_url = await self._get_csv_url("sesiones")
        if not csv_url:
            logger.warning("no CSV found for sesiones")
            return []

        response = await self.fetch(csv_url)
        results = []
        reader = csv.DictReader(io.StringIO(response.text))
        for row in reader:
            results.append({
                "external_id": row.get("sesion_id", row.get("id", "")).strip(),
                "title": row.get("titulo", row.get("descripcion", "")).strip(),
                "session_number": row.get("numero", "").strip(),
                "session_type": row.get("tipo", "ordinaria").strip().lower(),
                "date": row.get("fecha", "").strip(),
                "period": row.get("periodo", "").strip(),
                "chamber": "deputies",
            })
        logger.info("parsed sessions from CKAN", count=len(results))
        return results

    async def scrape_transcripts(self) -> list[dict]:
        """Fetch transcript metadata from CKAN diarios-de-sesiones dataset."""
        csv_url = await self._get_csv_url("diarios-de-sesiones")
        if not csv_url:
            return []

        response = await self.fetch(csv_url)
        results = []
        reader = csv.DictReader(io.StringIO(response.text))
        for row in reader:
            results.append({
                "session_external_id": row.get("sesion_id", "").strip(),
                "date": row.get("fecha", "").strip(),
                "transcript_url": row.get("url", row.get("archivo_url", "")).strip(),
                "title": row.get("titulo", "").strip(),
            })
        return results

    @staticmethod
    def parse_transcript_into_speeches(transcript_text: str) -> list[dict]:
        """
        Parse a stenographic transcript into individual interventions.
        
        Speaker labels in Argentine congressional transcripts follow patterns like:
            "Sr. DIPUTADO FERNÁNDEZ.- " or "Sra. DIPUTADA LÓPEZ.-"
        
        This is Alethia's own implementation since como_voto does NOT parse
        transcripts. This fills the gap for debate participation metrics.
        """
        speeches = []
        parts = SPEAKER_PATTERN.split(transcript_text)

        if len(parts) < 2:
            return speeches

        # parts[0] is text before first speaker, then alternating: label, text
        for i in range(1, len(parts) - 1, 2):
            speaker_label = parts[i].strip()
            text = parts[i + 1].strip() if i + 1 < len(parts) else ""

            if not text or len(text) < 10:
                continue

            speaker_name = _extract_name_from_label(speaker_label)
            word_count = len(text.split())

            speeches.append({
                "speaker_label": speaker_label,
                "speaker_name": speaker_name,
                "transcript": text,
                "word_count": word_count,
                "sequence_order": len(speeches),
            })

        return speeches


def _extract_name_from_label(label: str) -> str:
    """
    Extract the politician name from a speaker label.
    "Sr. DIPUTADO FERNÁNDEZ" -> "FERNÁNDEZ"
    "Sra. DIPUTADA LÓPEZ" -> "LÓPEZ"
    """
    cleaned = re.sub(
        r"^Sra?\.\s+(?:DIPUTAD[OA]|PRESIDENT[AE]|SECRETARI[OA])\s+",
        "",
        label,
        flags=re.IGNORECASE,
    )
    return cleaned.strip()
