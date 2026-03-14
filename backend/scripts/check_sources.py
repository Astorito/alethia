import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv(r'C:\Users\Jchi\OneDrive\Vídeos\Público\Documentos\Mosaico Analitica\Alethia\.env')
async def main():
    url = os.environ['DATABASE_URL'].replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(url)
    await conn.execute("ALTER TABLE politicians ADD COLUMN IF NOT EXISTS bloc TEXT")
    print('Columna bloc agregada')
    await conn.close()
asyncio.run(main())
