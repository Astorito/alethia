import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv(r'C:\Users\Jchi\OneDrive\Vídeos\Público\Documentos\Mosaico Analitica\Alethia\.env')
async def main():
    url = os.environ['DATABASE_URL'].replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(url)
    total = await conn.fetchval("SELECT COUNT(*) FROM politicians WHERE chamber='senate'")
    con_foto = await conn.fetchval("SELECT COUNT(*) FROM politicians WHERE chamber='senate' AND photo_url IS NOT NULL AND photo_url != ''")
    sin_foto = await conn.fetch("SELECT id, full_name, external_id FROM politicians WHERE chamber='senate' AND (photo_url IS NULL OR photo_url = '') LIMIT 5")
    print(f'Total senadores: {total}')
    print(f'Con foto: {con_foto}')
    print(f'Sin foto (ejemplos):')
    for r in sin_foto:
        print(f"  {r['full_name'][:35]} | ext_id={r['external_id']}")
    await conn.close()
asyncio.run(main())
