"""
Script: scrape_deputies.py
Carga diputados desde HCDN a Supabase (politicians + committees + bills).
"""

import asyncio, csv, io, os, re, unicodedata, uuid
from pathlib import Path
import httpx, asyncpg
from bs4 import BeautifulSoup
from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent.parent
load_dotenv(ROOT / ".env")

DATABASE_URL         = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql://")
SUPABASE_URL         = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
BUCKET               = "politician-photos"
STORAGE_BASE         = f"{SUPABASE_URL}/storage/v1/object"
PUBLIC_BASE          = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"
HEADERS_ST           = {"Authorization": f"Bearer {SUPABASE_SERVICE_KEY}", "apikey": SUPABASE_SERVICE_KEY}
HCDN_BASE            = "https://www.hcdn.gob.ar"
CSV_URL              = f"{HCDN_BASE}/system/modules/ar.gob.hcdn.diputados/formatters/generar-lista-diputados.csv"
USER_AGENT           = "Alethia-Scraper/1.0"


def normalize(t):
    t = " ".join(t.split()).lower()
    t = unicodedata.normalize("NFD", t)
    return "".join(c for c in t if unicodedata.category(c) != "Mn")

def fix_enc(s):
    try:    return s.encode("latin-1").decode("utf-8")
    except: return s

def titlecase(s):
    return " ".join(w.capitalize() for w in s.split())


async def fetch_list_map(client):
    """HTML list → {nombre_norm: {slug, photo_url}}"""
    resp = await client.get(f"{HCDN_BASE}/diputados/", headers={"User-Agent": USER_AGENT}, timeout=30, follow_redirects=True)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    result = {}
    for row in soup.select("tr"):
        img  = row.find("img", src=re.compile(r"parlamentaria\.hcdn"))
        link = row.find("a", href=re.compile(r"^/diputados/[a-z0-9]+/?$"))
        if not img or not link:
            continue
        name_raw = " ".join(link.get_text(strip=True).split())
        slug     = re.search(r"/diputados/([a-z0-9]+)/?", link["href"]).group(1)
        photo    = img["src"].replace("_small.", "_medium.")
        result[normalize(name_raw)] = {"slug": slug, "photo_url": photo}
    return result


async def upload_photo(client, pid, src):
    if not src: return None
    try:
        r = await client.get(src, headers={"User-Agent": USER_AGENT}, timeout=20, follow_redirects=True)
        r.raise_for_status()
        ext = "png" if ".png" in src else "jpg"
        up  = await client.put(
            f"{STORAGE_BASE}/{BUCKET}/{pid}.{ext}", content=r.content,
            headers={**HEADERS_ST, "Content-Type": f"image/{ext}", "x-upsert": "true"}, timeout=30)
        if up.status_code in (200, 201):
            return f"{PUBLIC_BASE}/{pid}.{ext}"
    except: pass
    return None


async def scrape_profile(client, slug):
    try:
        r    = await client.get(f"{HCDN_BASE}/diputados/{slug}/", headers={"User-Agent": USER_AGENT}, timeout=20, follow_redirects=True)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        return {"commissions": _parse_commissions(soup), "projects": _parse_projects(soup)}
    except Exception as e:
        return {"commissions": [], "projects": [], "error": str(e)}


def _parse_commissions(soup):
    result = []
    for h in soup.find_all(["h1","h2","h3","h4","b","strong"]):
        if "comisi" in h.get_text(strip=True).lower():
            tbl = h.find_next("table")
            if not tbl: continue
            for row in tbl.find_all("tr"):
                cells = row.find_all("td")
                if not cells: continue
                name = cells[0].get_text(strip=True)
                role = cells[1].get_text(strip=True) if len(cells) > 1 else "VOCAL"
                if name and len(name) > 4 and "comisi" not in name.lower():
                    result.append({"name": name, "role": role or "VOCAL"})
            if result: break
    if not result:
        for a in soup.select("a[href*='/comisiones/']"):
            name = a.get_text(strip=True)
            if name and len(name) > 4:
                result.append({"name": name, "role": "VOCAL"})
    return result


def _parse_projects(soup):
    result = []
    for tbl in soup.find_all("table"):
        headers = [th.get_text(strip=True).lower() for th in tbl.find_all("th")]
        if any(k in " ".join(headers) for k in ("expediente", "proyecto", "extracto")):
            for row in tbl.find_all("tr"):
                cells = row.find_all("td")
                if len(cells) < 2: continue
                link    = cells[0].find("a")
                exp     = cells[0].get_text(strip=True)
                if not exp or exp.lower() in ("expediente", "número"): continue
                date    = cells[1].get_text(strip=True) if len(cells) > 1 else ""
                extract = cells[2].get_text(strip=True) if len(cells) > 2 else ""
                href    = link["href"] if link else ""
                url     = (HCDN_BASE + href) if href.startswith("/") else href or None
                result.append({"expediente": exp, "date": date, "extract": extract[:500], "url": url})
    return result


async def upsert_committee(conn, name):
    row = await conn.fetchrow("SELECT id FROM committees WHERE name = $1", name)
    if row: return str(row["id"])
    cid = str(uuid.uuid4())
    await conn.execute(
        "INSERT INTO committees (id, name, chamber, created_at, updated_at) VALUES ($1,$2,'deputies',NOW(),NOW())",
        cid, name)
    return cid


async def save_profile_data(conn, pid, data):
    await conn.execute("DELETE FROM committee_memberships WHERE politician_id = $1", pid)
    for c in data["commissions"]:
        try:
            cid = await upsert_committee(conn, c["name"])
            await conn.execute(
                """INSERT INTO committee_memberships (politician_id, committee_id, role, created_at, updated_at)
                   VALUES ($1,$2,$3,NOW(),NOW())
                   ON CONFLICT (politician_id, committee_id) DO UPDATE SET role = EXCLUDED.role""",
                pid, cid, c["role"])
        except: pass
    for p in data["projects"]:
        if not p["expediente"]: continue
        try:
            ex = await conn.fetchrow("SELECT id FROM bills WHERE external_id = $1", p["expediente"])
            if ex:
                bill_id = str(ex["id"])
            else:
                bill_id = str(uuid.uuid4())
                await conn.execute(
                    """INSERT INTO bills (id, external_id, title, presented_at, source_url, chamber, created_at, updated_at)
                       VALUES ($1,$2,$3,$4,$5,'deputies',NOW(),NOW())""",
                    bill_id, p["expediente"], p["extract"] or p["expediente"], p["date"] or None, p["url"])
            await conn.execute(
                "INSERT INTO bill_authors (bill_id, politician_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
                bill_id, pid)
        except: pass


async def main():
    conn = await asyncpg.connect(DATABASE_URL)

    async with httpx.AsyncClient() as http:

        # 1. Lista HTML → slug + foto
        print("Scrapeando lista HTML...")
        list_map = await fetch_list_map(http)
        print(f"  {len(list_map)} diputados en lista HTML\n")

        # 2. CSV → datos básicos
        print("Descargando CSV...")
        resp    = await http.get(CSV_URL, headers={"User-Agent": USER_AGENT}, timeout=30, follow_redirects=True)
        resp.raise_for_status()
        # Leer con utf-8-sig para eliminar BOM automáticamente
        content = resp.content.decode("utf-8-sig", errors="replace")
        # Si tiene caracteres raros, intentar latin-1
        if "Ã" in content:
            content = resp.content.decode("latin-1", errors="replace")
        reader   = csv.reader(io.StringIO(content))
        all_rows = list(reader)
        # Primera fila = headers, limpiar BOM y espacios
        headers  = [h.strip().lstrip("\ufeff").strip('"') for h in all_rows[0]]
        print(f"  Headers: {headers}")
        csv_rows = []
        for r in all_rows[1:]:
            if len(r) >= len(headers):
                csv_rows.append(dict(zip(headers, [fix_enc(v.strip()) for v in r])))
        print(f"  {len(csv_rows)} diputados en CSV\n")

        print(f"{'='*65}")
        ok = failed = no_slug = 0

        for row in csv_rows:
            apellido = titlecase(fix_enc(row.get("Apellido", "")))
            nombre   = titlecase(fix_enc(row.get("Nombre", "")))
            distrito = row.get("Distrito", "").title()
            bloque   = fix_enc(row.get("Bloque", ""))

            if not apellido:
                continue

            # Nombre completo: "Nombre Apellido"
            full_name = f"{nombre} {apellido}".strip()

            # Buscar en list_map — el HTML tiene formato "Apellido, Nombre"
            norm_ap_nom = normalize(f"{apellido}, {nombre}")
            norm_nom_ap = normalize(full_name)
            html_data   = (
                list_map.get(norm_ap_nom) or
                list_map.get(norm_nom_ap) or
                next((v for k, v in list_map.items() if normalize(apellido) in k), None)
            )

            slug      = html_data["slug"]      if html_data else None
            photo_src = html_data["photo_url"] if html_data else None

            print(f"  {full_name[:46]:<46} ", end="", flush=True)

            # Upsert politician
            ex = await conn.fetchrow(
                "SELECT id, photo_url FROM politicians WHERE full_name=$1 AND chamber='deputies'",
                full_name)
            if ex:
                pid           = str(ex["id"])
                current_photo = ex["photo_url"] or ""
                await conn.execute(
                    "UPDATE politicians SET province=$1, updated_at=NOW() WHERE id=$2",
                    distrito, pid)
            else:
                pid = str(uuid.uuid4())
                await conn.execute(
                    """INSERT INTO politicians
                       (id, full_name, first_name, last_name, province, chamber, source, created_at, updated_at)
                       VALUES ($1,$2,$3,$4,$5,'deputies','xml_api',NOW(),NOW())""",
                    pid, full_name, nombre, apellido, distrito)
                current_photo = ""

            # Foto
            if photo_src and SUPABASE_URL not in current_photo:
                pub = await upload_photo(http, pid, photo_src)
                if pub:
                    await conn.execute("UPDATE politicians SET photo_url=$1 WHERE id=$2", pub, pid)

            # Perfil
            if slug:
                profile = await scrape_profile(http, slug)
                await save_profile_data(conn, pid, profile)
                print(f"ok  ({len(profile['commissions'])} com, {len(profile['projects'])} proy)")
            else:
                print("ok  (sin slug)")
                no_slug += 1

            ok += 1
            await asyncio.sleep(0.25)

    await conn.close()
    print(f"\n{'='*65}")
    print(f"  ok  Procesados: {ok}")
    print(f"  ?   Sin slug:   {no_slug}")
    print(f"  x   Fallidos:   {failed}")
    print(f"{'='*65}\n")


if __name__ == "__main__":
    asyncio.run(main())