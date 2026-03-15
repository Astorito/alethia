"""
Script: upload_senator_photos.py
Descarga fotos de senadores desde senado.gob.ar y las sube a Supabase Storage.
URL de foto: https://www.senado.gob.ar/bundles/senadosenadores/images/fsenaG/{ext_id}.gif

Uso:
    cd backend
    python scripts/upload_senator_photos.py
"""

import asyncio
import os
from pathlib import Path

import httpx
import asyncpg
from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")

DATABASE_URL         = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql://")
SUPABASE_URL         = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

BUCKET       = "politician-photos"
STORAGE_BASE = f"{SUPABASE_URL}/storage/v1/object"
PUBLIC_BASE  = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"
HEADERS_ST   = {"Authorization": f"Bearer {SUPABASE_SERVICE_KEY}", "apikey": SUPABASE_SERVICE_KEY}

SENADO_BASE = "https://www.senado.gob.ar"
USER_AGENT  = "Alethia-Scraper/1.0"


async def upload_photo(client: httpx.AsyncClient, pid: str, ext_id: str) -> str | None:
    url = f"{SENADO_BASE}/bundles/senadosenadores/images/fsenaG/{ext_id}.gif"
    try:
        resp = await client.get(url, headers={"User-Agent": USER_AGENT}, timeout=15, follow_redirects=True)
        resp.raise_for_status()
        ct = resp.headers.get("content-type", "")
        if "image" not in ct and "gif" not in ct:
            return None
        up = await client.put(
            f"{STORAGE_BASE}/{BUCKET}/{pid}.gif",
            content=resp.content,
            headers={**HEADERS_ST, "Content-Type": "image/gif", "x-upsert": "true"},
            timeout=30,
        )
        if up.status_code in (200, 201):
            return f"{PUBLIC_BASE}/{pid}.gif"
        return None
    except Exception:
        return None


async def main():
    conn = await asyncpg.connect(DATABASE_URL)

    rows = await conn.fetch(
        "SELECT id, full_name, external_id FROM politicians WHERE chamber='senate' AND (photo_url IS NULL OR photo_url = '') ORDER BY full_name"
    )

    print(f"\n{'='*60}")
    print(f"  Senadores sin foto: {len(rows)}")
    print(f"{'='*60}\n")

    ok = failed = 0

    async with httpx.AsyncClient() as http:
        for row in rows:
            pid    = str(row["id"])
            ext_id = (row["external_id"] or "").strip()
            name   = " ".join((row["full_name"] or "").split())

            if not ext_id:
                print(f"  - sin ext_id: {name}")
                failed += 1
                continue

            print(f"  {name[:48]:<48} ", end="", flush=True)

            pub_url = await upload_photo(http, pid, ext_id)
            if pub_url:
                await conn.execute(
                    "UPDATE politicians SET photo_url=$1 WHERE id=$2",
                    pub_url, pid
                )
                print("ok")
                ok += 1
            else:
                print("x (sin foto en senado.gob.ar)")
                failed += 1

            await asyncio.sleep(0.2)

    await conn.close()

    print(f"\n{'='*60}")
    print(f"  ok  Subidas:  {ok}")
    print(f"  x   Fallidas: {failed}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(main())
