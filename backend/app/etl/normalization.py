"""
Data normalization utilities.
Adapted from como_voto's normalization.py patterns.

Handles:
  - Name normalization (accents, case, aliases)
  - Province canonicalization
  - Vote value normalization
  - Bloc-to-coalition mapping
  - Date parsing from multiple formats
"""
import re
from datetime import date, datetime
from typing import Optional

from unidecode import unidecode

PROVINCE_CANONICAL = {
    "BUENOS AIRES": "Buenos Aires",
    "BA": "Buenos Aires",
    "C.A.B.A.": "CABA",
    "CABA": "CABA",
    "CIUDAD DE BUENOS AIRES": "CABA",
    "CIUDAD AUTONOMA DE BUENOS AIRES": "CABA",
    "CATAMARCA": "Catamarca",
    "CHACO": "Chaco",
    "CHUBUT": "Chubut",
    "CORDOBA": "Córdoba",
    "CÓRDOBA": "Córdoba",
    "CORRIENTES": "Corrientes",
    "ENTRE RIOS": "Entre Ríos",
    "ENTRE RÍOS": "Entre Ríos",
    "FORMOSA": "Formosa",
    "JUJUY": "Jujuy",
    "LA PAMPA": "La Pampa",
    "LA RIOJA": "La Rioja",
    "MENDOZA": "Mendoza",
    "MISIONES": "Misiones",
    "NEUQUEN": "Neuquén",
    "NEUQUÉN": "Neuquén",
    "RIO NEGRO": "Río Negro",
    "RÍO NEGRO": "Río Negro",
    "SALTA": "Salta",
    "SAN JUAN": "San Juan",
    "SAN LUIS": "San Luis",
    "SANTA CRUZ": "Santa Cruz",
    "SANTA FE": "Santa Fe",
    "SANTIAGO DEL ESTERO": "Santiago del Estero",
    "TIERRA DEL FUEGO": "Tierra del Fuego",
    "TUCUMAN": "Tucumán",
    "TUCUMÁN": "Tucumán",
}

COALITION_KEYWORDS = {
    "PJ": ["JUSTICIALISTA", "PERONISM", "FRENTE DE TODOS", "UNION POR LA PATRIA", "FPV"],
    "UCR": ["RADICAL", "UCR", "UNION CIVICA"],
    "PRO": ["PRO", "PROPUESTA REPUBLICANA", "CAMBIEMOS", "JUNTOS POR EL CAMBIO", "JXC"],
    "LLA": ["LIBERTAD AVANZA", "LIBERTARIA", "LLA"],
}


def normalize_name(name: str) -> str:
    """Normalize a politician name: uppercase, remove accents, trim."""
    return unidecode(name.strip()).upper()


def canonicalize_province(raw: str) -> str:
    key = unidecode(raw.strip()).upper()
    return PROVINCE_CANONICAL.get(key, raw.strip())


def classify_bloc_to_coalition(bloc_name: str) -> str:
    """
    Classify a parliamentary bloc into a major coalition.
    Adapted from como_voto's classify_bloc logic.
    """
    bloc_upper = unidecode(bloc_name.strip()).upper()
    for coalition, keywords in COALITION_KEYWORDS.items():
        for kw in keywords:
            if kw in bloc_upper:
                return coalition
    return "OTROS"


def parse_date(raw: str) -> Optional[date]:
    """Parse date from various Argentine formats."""
    if not raw or not raw.strip():
        return None

    raw = raw.strip()
    formats = [
        "%d/%m/%Y",
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y - %H:%M",
        "%Y%m%d",
        "%d de %B de %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue

    date_match = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", raw)
    if date_match:
        try:
            return date(
                int(date_match.group(3)),
                int(date_match.group(2)),
                int(date_match.group(1)),
            )
        except ValueError:
            pass

    return None


def normalize_vote_value(raw: str) -> str:
    """Normalize vote string to standard enum values."""
    raw_upper = raw.strip().upper()
    if "AFIRMATIV" in raw_upper:
        return "yes"
    if "NEGATIV" in raw_upper:
        return "no"
    if "ABSTEN" in raw_upper:
        return "abstain"
    if "AUSENT" in raw_upper:
        return "absent"
    if "PRESIDENT" in raw_upper:
        return "present"
    return "absent"
