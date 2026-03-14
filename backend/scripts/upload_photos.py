"""
Script: upload_photos.py

Scrapea fotos desde hcdn.gob.ar/diputados/, matchea por nombre
contra la DB, sube a Supabase Storage y actualiza photo_url.

Uso:
    cd backend
    pip install beautifulsoup4 rapidfuzz
    python scripts/upload_photos.py
"""

import asyncio
import os
import re
from pathlib import Path

import httpx
import asyncpg
from bs4 import BeautifulSoup
from rapidfuzz import process, fuzz
from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")

SUPABASE_URL         = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
DATABASE_URL         = os.environ["DATABASE_URL"].replace(
    "postgresql+asyncpg://", "postgresql://"
)

BUCKET       = "politician-photos"
STORAGE_BASE = f"{SUPABASE_URL}/storage/v1/object"
PUBLIC_BASE  = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"
HEADERS_STORAGE = {
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "apikey": SUPABASE_SERVICE_KEY,
}

USER_AGENT = "Alethia-Scraper/1.0"
HCDN_BASE  = "https://www.hcdn.gob.ar"
MATCH_THRESHOLD = 35  # score minimo de similitud de nombre


# ── Scraping ──────────────────────────────────────────────────

async def fetch_slug_photo_map(client: httpx.AsyncClient) -> dict[str, str]:
    """Devuelve {slug: photo_url} desde la lista de diputados."""
    resp = await client.get(
        f"{HCDN_BASE}/diputados/",
        headers={"User-Agent": USER_AGENT},
        timeout=30,
        follow_redirects=True,
    )
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    result = {}
    for row in soup.select("tr"):
        links = row.find_all("a")
        img   = row.find("img", src=re.compile(r"parlamentaria\.hcdn\.gob\.ar"))
        if not links or not img:
            continue
        for link in links:
            href = link.get("href", "")
            m = re.match(r"^/diputados/([a-z0-9]+)/?$", href)
            if m:
                slug = m.group(1)
                src  = img["src"].replace("_small.", "_medium.")
                result[slug] = src
                break
    return result


async def fetch_name_for_slug(client: httpx.AsyncClient, slug: str) -> str | None:
    """Extrae el nombre completo desde la página de perfil del diputado."""
    try:
        resp = await client.get(
            f"{HCDN_BASE}/diputados/{slug}/",
            headers={"User-Agent": USER_AGENT},
            timeout=15,
            follow_redirects=True,
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # El nombre suele estar en un <h1> o en el title
        for selector in ["h1", "h2", ".nombre", ".diputado-nombre", "title"]:
            el = soup.select_one(selector)
            if el:
                text = el.get_text(separator=" ", strip=True)
                # Limpiar prefijos comunes
                text = re.sub(r"(Diputad[ao]|Honorable|Naci[oó]n|HCDN).*", "", text, flags=re.I).strip()
                if len(text) > 4:
                    return text
    except Exception:
        pass
    return None


# ── Normalizar nombre para comparacion ───────────────────────

def normalize_name(name: str) -> str:
    """Convierte 'Apellido, Nombre' o 'Nombre Apellido' a minúsculas sin puntuación."""
    import unicodedata
    name = " ".join(name.split())  # colapsa whitespace
    # Si tiene coma, reordenar: "Apellido, Nombre" -> "Nombre Apellido"
    if "," in name:
        parts = [p.strip() for p in name.split(",", 1)]
        name  = f"{parts[1]} {parts[0]}"
    # Quitar tildes
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    return name.lower()


# ── Download / Upload ─────────────────────────────────────────

async def download_photo(client: httpx.AsyncClient, url: str) -> bytes | None:
    try:
        resp = await client.get(url, headers={"User-Agent": USER_AGENT}, timeout=20, follow_redirects=True)
        resp.raise_for_status()
        if "image" not in resp.headers.get("content-type", ""):
            return None
        return resp.content
    except Exception as e:
        print(f"x descarga: {e}")
        return None


async def upload_to_supabase(client: httpx.AsyncClient, key: str, image_bytes: bytes, ext: str = "png") -> str | None:
    filename   = f"{key}.{ext}"
    upload_url = f"{STORAGE_BASE}/{BUCKET}/{filename}"
    try:
        resp = await client.put(
            upload_url,
            content=image_bytes,
            headers={**HEADERS_STORAGE, "Content-Type": f"image/{ext}", "x-upsert": "true"},
            timeout=30,
        )
        if resp.status_code in (200, 201):
            return f"{PUBLIC_BASE}/{filename}"
        print(f"x upload {filename}: {resp.status_code} {resp.text[:60]}")
        return None
    except Exception as e:
        print(f"x excepcion upload: {e}")
        return None


# ── Main ──────────────────────────────────────────────────────

async def main():
    conn = await asyncpg.connect(DATABASE_URL)
    rows = await conn.fetch(
        "SELECT id, external_id, full_name, photo_url FROM politicians ORDER BY full_name"
    )

    print(f"\n{'='*60}")
    print(f"  Legisladores en DB: {len(rows)}")
    print(f"{'='*60}\n")

    # Construir lookup de DB: nombre_normalizado -> (id, full_name)
    db_lookup: dict[str, tuple[str, str]] = {}
    for row in rows:
        name_clean = normalize_name(row["full_name"] or "")
        if name_clean:
            db_lookup[name_clean] = (str(row["id"]), row["full_name"])

    db_names = list(db_lookup.keys())

    updated = 0
    skipped = 0
    failed  = 0
    no_match = 0

    async with httpx.AsyncClient() as http:
        print("  Scrapeando lista HCDN...")
        slug_photo = await fetch_slug_photo_map(http)
        print(f"  {len(slug_photo)} diputados encontrados en HCDN\n")

        for slug, photo_url in slug_photo.items():
            # Obtener nombre desde el perfil
            hcdn_name = await fetch_name_for_slug(http, slug)
            if not hcdn_name:
                no_match += 1
                continue

            # Fuzzy match contra nombres de la DB
            norm_hcdn = normalize_name(hcdn_name)
            result = process.extractOne(norm_hcdn, db_names, scorer=fuzz.token_sort_ratio)

            if not result or result[1] < MATCH_THRESHOLD:
                print(f"  - sin match: '{hcdn_name}' (mejor: {result[1] if result else 0}%)")
                no_match += 1
                continue

            matched_name = result[0]
            pid, full_name = db_lookup[matched_name]

            # Verificar que no tenga ya URL de Storage
            row = next((r for r in rows if str(r["id"]) == pid), None)
            if row and SUPABASE_URL in (row["photo_url"] or ""):
                skipped += 1
                continue

            print(f"  -> {full_name[:40]:<40} ({result[1]}%) ", end="", flush=True)

            image_bytes = await download_photo(http, photo_url)
            if not image_bytes:
                print("x descarga")
                failed += 1
                await asyncio.sleep(0.2)
                continue

            ext = "png" if photo_url.endswith(".png") else "jpg"
            public_url = await upload_to_supabase(http, pid, image_bytes, ext)
            if not public_url:
                print("x upload")
                failed += 1
                await asyncio.sleep(0.2)
                continue

            await conn.execute(
                "UPDATE politicians SET photo_url = $1 WHERE id = $2", public_url, pid
            )
            print("ok")
            updated += 1
            await asyncio.sleep(0.2)

    await conn.close()

    print(f"\n{'='*60}")
    print(f"  ok Actualizados: {updated}")
    print(f"  -> Salteados:    {skipped}")
    print(f"  x  Fallidos:     {failed}")
    print(f"  ?  Sin match:    {no_match}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(main())