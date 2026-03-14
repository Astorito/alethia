import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv(r'C:\Users\Jchi\OneDrive\Vídeos\Público\Documentos\Mosaico Analitica\Alethia\.env')
async def main():
    url = os.environ['DATABASE_URL'].replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(url)
    
    # Borrar dependencias primero, luego los políticos
    await conn.execute("""
        DELETE FROM vote_positions WHERE politician_id IN (
            SELECT id FROM politicians 
            WHERE chamber='deputies' 
            AND (full_name = upper(full_name) OR full_name = '')
        )
    """)
    await conn.execute("""
        DELETE FROM committee_memberships WHERE politician_id IN (
            SELECT id FROM politicians 
            WHERE chamber='deputies' 
            AND (full_name = upper(full_name) OR full_name = '')
        )
    """)
    await conn.execute("""
        DELETE FROM bill_authors WHERE politician_id IN (
            SELECT id FROM politicians 
            WHERE chamber='deputies' 
            AND (full_name = upper(full_name) OR full_name = '')
        )
    """)
    await conn.execute("""
        DELETE FROM politician_roles WHERE politician_id IN (
            SELECT id FROM politicians 
            WHERE chamber='deputies' 
            AND (full_name = upper(full_name) OR full_name = '')
        )
    """)
    
    deleted = await conn.execute("""
        DELETE FROM politicians 
        WHERE chamber='deputies' 
        AND (full_name = upper(full_name) OR full_name = '')
    """)
    print('Borrados:', deleted)
    
    total = await conn.fetchval("SELECT COUNT(*) FROM politicians WHERE chamber='deputies'")
    print('Diputados restantes:', total)
    
    await conn.close()
asyncio.run(main())
