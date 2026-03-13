"""
Script: upload_photos.py

Descarga fotos de legisladores desde HCDN y Senado,
las sube a Supabase Storage y actualiza photo_url en la DB.

Uso:
    cd backend
    python scripts/upload_photos.py

Requiere en .env:
    SUPABASE_URL=https://xxxx.supabase.co
    SUPABASE_SERVICE_KEY=service_role_key   ← NO la anon key
    DATABASE_URL=postgresql+asyncpg://...
"""

import asyncio
import os
import sys
from pathlib import Path

import httpx
import asyncpg
from dotenv import load_dotenv

# ── Cargar .env desde la raíz del proyecto ───────────────────
ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")

SUPABASE_URL        = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
DATABASE_URL        = os.environ["DATABASE_URL"].replace(
    "postgresql+asyncpg://", "postgresql://"
)

BUCKET = "politician-photos"
STORAGE_BASE = f"{SUPABASE_URL}/storage/v1/object"
PUBLIC_BASE  = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"

HEADERS_STORAGE = {
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "apikey": SUPABASE_SERVICE_KEY,
}

USER_AGENT = "Alethia-Scraper/1.0 (+https://github.com/mosaico-analitica/alethia)"


# ─────────────────────────────────────────────────────────────
# Descargar imagen
# ─────────────────────────────────────────────────────────────

async def download_photo(client: httpx.AsyncClient, url: str) -> bytes | None:
    if not url or not url.startswith("http"):
        return None
    try:
        resp = await client.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=15,
            follow_redirects=True,
        )
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "image" not in content_type and "octet-stream" not in content_type:
            print(f"  ⚠ content-type inesperado ({content_type}): {url}")
            return None
        return resp.content
    except Exception as e:
        print(f"  ✗ error descargando {url}: {e}")
        return None


# ─────────────────────────────────────────────────────────────
# Subir a Supabase Storage
# ─────────────────────────────────────────────────────────────

async def upload_to_supabase(
    client: httpx.AsyncClient,
    external_id: str,
    image_bytes: bytes,
) -> str | None:
    filename = f"{external_id}.jpg"
    upload_url = f"{STORAGE_BASE}/{BUCKET}/{filename}"

    try:
        # Primero intentar con PUT (upsert)
        resp = await client.put(
            upload_url,
            content=image_bytes,
            headers={
                **HEADERS_STORAGE,
                "Content-Type": "image/jpeg",
                "x-upsert": "true",
            },
            timeout=30,
        )
        if resp.status_code in (200, 201):
            public_url = f"{PUBLIC_BASE}/{filename}"
            return public_url
        else:
            print(f"  ✗ error subiendo {filename}: {resp.status_code} {resp.text[:100]}")
            return None
    except Exception as e:
        print(f"  ✗ excepción subiendo {filename}: {e}")
        return None


# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────

async def main():
    # Conectar a Postgres directamente (más rápido que el ORM para bulk)
    conn = await asyncpg.connect(DATABASE_URL)

    # Traer todos los legisladores con su external_id y source_photo_url
    # source_photo_url es la URL original del HCDN/Senado que ya scrapeamos
    rows = await conn.fetch("""
        SELECT id, external_id, full_name, photo_url, source
        FROM politicians
        ORDER BY full_name
    """)

    print(f"\n{'='*60}")
    print(f"  Total legisladores: {len(rows)}")
    print(f"{'='*60}\n")

    updated = 0
    skipped = 0
    failed  = 0

    async with httpx.AsyncClient() as http:
        for row in rows:
            pid        = str(row["id"])
            ext_id     = row["external_id"] or pid
            full_name  = row["full_name"]
            source_url = row["photo_url"] or ""
            source     = row["source"] or ""

            # Si la photo_url ya apunta a Supabase Storage, saltar
            if SUPABASE_URL in source_url:
                skipped += 1
                continue

            # Construir la URL de origen si no la tenemos
            if not source_url:
                if source == "ckan_api" or source == "html_scrape":
                    # HCDN: https://www.hcdn.gob.ar/diputados/fotos/{external_id}.jpg
                    source_url = f"https://www.hcdn.gob.ar/diputados/fotos/{ext_id}.jpg"
                elif source == "senate":
                    # Senado: https://www.senado.gob.ar/senadores/fotos/{external_id}.jpg
                    source_url = f"https://www.senado.gob.ar/senadores/fotos/{ext_id}.jpg"
                else:
                    print(f"  ⚠ sin URL de foto para {full_name} (source={source})")
                    skipped += 1
                    continue

            print(f"  → {full_name[:40]:<40} ", end="", flush=True)

            # Descargar
            image_bytes = await download_photo(http, source_url)
            if not image_bytes:
                print("✗ descarga fallida")
                failed += 1
                await asyncio.sleep(0.3)
                continue

            # Subir a Supabase Storage
            public_url = await upload_to_supabase(http, ext_id, image_bytes)
            if not public_url:
                print("✗ upload fallido")
                failed += 1
                await asyncio.sleep(0.3)
                continue

            # Actualizar photo_url en la DB
            await conn.execute(
                "UPDATE politicians SET photo_url = $1 WHERE id = $2",
                public_url, pid,
            )

            print(f"✓ {public_url.split('/')[-1]}")
            updated += 1

            # Rate limiting para no martillar las fuentes
            await asyncio.sleep(0.4)

    await conn.close()

    print(f"\n{'='*60}")
    print(f"  ✓ Actualizados: {updated}")
    print(f"  → Salteados:    {skipped} (ya tenían URL de Storage)")
    print(f"  ✗ Fallidos:     {failed}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(main())