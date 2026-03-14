import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv(r'C:\Users\Jchi\OneDrive\Vídeos\Público\Documentos\Mosaico Analitica\Alethia\.env')
async def main():
    url = os.environ['DATABASE_URL'].replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(url)
    rows = await conn.fetch("SELECT full_name, bloc, province FROM politicians WHERE chamber='deputies' ORDER BY full_name LIMIT 5")
    for r in rows:
        print(f"{r['full_name'][:30]:<30} bloc={repr(r['bloc'])}")
    await conn.close()
asyncio.run(main())
