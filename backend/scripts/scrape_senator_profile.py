"""
Script: scrape_senator_profile.py

Para cada senador en la DB (source = 'senate'):
  - Raspa su perfil en senado.gob.ar
  - Extrae: comisiones, personal, proyectos (todas las páginas)
  - Guarda en tablas: senator_commissions, senator_staff, senator_projects

Tablas esperadas (se crean si no existen):
  CREATE TABLE senator_commissions (
    id           SERIAL PRIMARY KEY,
    politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    role         TEXT,
    scraped_at   TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE senator_staff (
    id            SERIAL PRIMARY KEY,
    politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
    full_name     TEXT NOT NULL,
    category      TEXT,
    scraped_at    TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE senator_projects (
    id            SERIAL PRIMARY KEY,
    politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
    expediente    TEXT NOT NULL,
    date          TEXT,
    extract       TEXT,
    url           TEXT,
    scraped_at    TIMESTAMPTZ DEFAULT NOW()
  );

Uso:
    cd backend
    python scripts/scrape_senator_profile.py
"""

import asyncio
import os
from pathlib import Path

import httpx
import asyncpg
from bs4 import BeautifulSoup
from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")

DATABASE_URL = os.environ["DATABASE_URL"].replace(
    "postgresql+asyncpg://", "postgresql://"
)

SENADO_BASE = "https://www.senado.gob.ar"
USER_AGENT  = "Alethia-Scraper/1.0"


# ── Crear tablas ──────────────────────────────────────────────

CREATE_TABLES = """
CREATE TABLE IF NOT EXISTS senator_commissions (
    id            SERIAL PRIMARY KEY,
    politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    role          TEXT,
    scraped_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS senator_staff (
    id            SERIAL PRIMARY KEY,
    politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
    full_name     TEXT NOT NULL,
    category      TEXT,
    scraped_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS senator_projects (
    id            SERIAL PRIMARY KEY,
    politician_id UUID REFERENCES politicians(id) ON DELETE CASCADE,
    expediente    TEXT NOT NULL,
    date          TEXT,
    extract       TEXT,
    url           TEXT,
    scraped_at    TIMESTAMPTZ DEFAULT NOW()
);
"""


# ── Scraping helpers ──────────────────────────────────────────

def parse_commissions(soup: BeautifulSoup) -> list[dict]:
    result = []
    div = soup.find("div", id="Comision")
    if not div:
        return result
    for row in div.select("table tr"):
        cells = row.find_all("td")
        if len(cells) < 2:
            continue
        name = cells[0].get_text(strip=True)
        role = cells[1].get_text(strip=True)
        if name and name != "COMISIÓN":
            result.append({"name": name, "role": role})
    return result


def parse_staff(soup: BeautifulSoup) -> list[dict]:
    result = []
    div = soup.find("div", id="Personal")
    if not div:
        return result
    # El HTML del senado tiene <tr> rotos — muchos <td> sin <tr> padre
    # Recorremos todos los <td> secuencialmente en pares
    tds = div.select("table td")
    i = 0
    while i + 1 < len(tds):
        name = tds[i].get_text(strip=True)
        cat  = tds[i+1].get_text(strip=True)
        if name and name not in ("Nombre y Apellido", "Categoría"):
            # Validar que parezcan datos reales (nombre en mayúsculas, cat A-N)
            if len(name) > 3 and not name.startswith("Esta información"):
                result.append({"full_name": name, "category": cat})
        i += 2
    return result


def parse_projects_page(soup: BeautifulSoup) -> list[dict]:
    result = []
    for row in soup.select("#3 table tbody tr"):
        cells = row.find_all("td")
        if len(cells) < 3:
            continue
        link     = cells[0].find("a")
        exp      = cells[0].get_text(strip=True)
        date     = cells[1].get_text(strip=True)
        extract  = cells[2].get_text(strip=True)
        url      = (SENADO_BASE + link["href"]) if link else None
        result.append({"expediente": exp, "date": date, "extract": extract, "url": url})
    return result


def get_last_page(soup: BeautifulSoup) -> int:
    last = soup.select_one(".pagination .last a")
    if last:
        href = last.get("href", "")
        try:
            return int(href.split("ProyectosSenador=")[-1])
        except ValueError:
            pass
    return 1


async def scrape_senator(
    client: httpx.AsyncClient, ext_id: str
) -> dict:
    """Devuelve {commissions, staff, projects} para un senador."""
    base_url = f"{SENADO_BASE}/senadores/senador/{ext_id}"

    resp = await client.get(base_url, headers={"User-Agent": USER_AGENT}, timeout=20, follow_redirects=True)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    commissions = parse_commissions(soup)
    staff       = parse_staff(soup)
    projects    = parse_projects_page(soup)

    last_page = get_last_page(soup)
    for page in range(2, last_page + 1):
        await asyncio.sleep(0.3)
        try:
            r = await client.get(
                f"{base_url}?ProyectosSenador={page}",
                headers={"User-Agent": USER_AGENT},
                timeout=20,
                follow_redirects=True,
            )
            r.raise_for_status()
            projects += parse_projects_page(BeautifulSoup(r.text, "html.parser"))
        except Exception as e:
            print(f"    x página {page}: {e}")
            break

    return {"commissions": commissions, "staff": staff, "projects": projects}


# ── DB writes ─────────────────────────────────────────────────

async def save_senator_data(conn, pid: str, data: dict):
    # Borrar datos anteriores para este senador (idempotente)
    await conn.execute("DELETE FROM senator_commissions WHERE politician_id = $1", pid)
    await conn.execute("DELETE FROM senator_staff      WHERE politician_id = $1", pid)
    await conn.execute("DELETE FROM senator_projects   WHERE politician_id = $1", pid)

    for c in data["commissions"]:
        await conn.execute(
            "INSERT INTO senator_commissions (politician_id, name, role) VALUES ($1,$2,$3)",
            pid, c["name"], c["role"]
        )
    for s in data["staff"]:
        await conn.execute(
            "INSERT INTO senator_staff (politician_id, full_name, category) VALUES ($1,$2,$3)",
            pid, s["full_name"], s["category"]
        )
    for p in data["projects"]:
        await conn.execute(
            "INSERT INTO senator_projects (politician_id, expediente, date, extract, url) VALUES ($1,$2,$3,$4,$5)",
            pid, p["expediente"], p["date"], p["extract"], p["url"]
        )


# ── Main ──────────────────────────────────────────────────────

async def main():
    conn = await asyncpg.connect(DATABASE_URL)
    await conn.execute(CREATE_TABLES)

    rows = await conn.fetch(
        "SELECT id, external_id, full_name FROM politicians WHERE chamber = 'senate' ORDER BY full_name"
    )

    print(f"\n{'='*60}")
    print(f"  Senadores a procesar: {len(rows)}")
    print(f"{'='*60}\n")

    ok = 0
    failed = 0

    async with httpx.AsyncClient() as http:
        for row in rows:
            pid     = str(row["id"])
            ext_id  = (row["external_id"] or "").strip()
            name    = " ".join((row["full_name"] or "").split())

            if not ext_id:
                print(f"  - sin external_id: {name}")
                failed += 1
                continue

            print(f"  {name[:48]:<48} ", end="", flush=True)
            try:
                data = await scrape_senator(http, ext_id)
                await save_senator_data(conn, pid, data)
                print(
                    f"ok  "
                    f"({len(data['commissions'])} com, "
                    f"{len(data['staff'])} staff, "
                    f"{len(data['projects'])} proy)"
                )
                ok += 1
            except Exception as e:
                print(f"x {e}")
                failed += 1

            await asyncio.sleep(0.4)

    await conn.close()

    print(f"\n{'='*60}")
    print(f"  ok Procesados: {ok}")
    print(f"  x  Fallidos:   {failed}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(main())