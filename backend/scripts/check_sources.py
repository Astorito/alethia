import os
from dotenv import load_dotenv
import httpx

load_dotenv(r'C:\Users\Jchi\OneDrive\Vídeos\Público\Documentos\Mosaico Analitica\Alethia\.env')

url = os.environ['SUPABASE_URL']
key = os.environ['SUPABASE_SERVICE_KEY']

resp = httpx.post(
    f"{url}/storage/v1/object/list/Ejecutivo",
    headers={"Authorization": f"Bearer {key}", "apikey": key},
    json={"limit": 100, "offset": 0, "prefix": ""}
)
print(resp.status_code)
for item in resp.json():
    print(item.get('name'))
