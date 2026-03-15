import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv(r'C:\Users\Jchi\OneDrive\Vídeos\Público\Documentos\Mosaico Analitica\Alethia\.env')
async def main():
    url = os.environ['DATABASE_URL'].replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(url)
    total = await conn.fetchval("SELECT COUNT(*) FROM politicians WHERE chamber='senate'")
    con_foto = await conn.fetchval("SELECT COUNT(*) FROM politicians WHERE chamber='senate' AND photo_url IS NOT NULL AND photo_url != ''")
    print(f'Senadores total: {total}')
    print(f'Con foto: {con_foto}')
    rows = await conn.fetch("SELECT full_name, external_id, photo_url FROM politicians WHERE chamber='senate' LIMIT 3")
    for r in rows:
        print(f"  {r['full_name'][:30]} | ext_id={r['external_id']} | foto={'SI' if r['photo_url'] else 'NO'}")
    await conn.close()
asyncio.run(main())
