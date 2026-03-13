# Deploy en Railway

Este documento explica como desplegar el backend de Alethia en Railway con actualizaciones automaticas cada 6 horas.

## 1. Preparar el proyecto

Asegurate de tener en la raiz del repo:
- `backend/requirements.txt` (ya existe)
- `backend/Procfile` (ya existe)
- `backend/railway.json` (ya existe)

## 2. Crear proyecto en Railway

1. Ir a https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Seleccionar el repositorio de Alethia
4. Railway detectara automaticamente el `backend/` como el directorio raiz

## 3. Configurar variables de entorno

En el panel de Railway, ir a "Variables" y agregar:

```
DATABASE_URL=postgresql+asyncpg://postgres:TU_PASSWORD@db.qzwqromsghsnkcublkaz.supabase.co:5432/postgres
DATABASE_URL_SYNC=postgresql://postgres:TU_PASSWORD@db.qzwqromsghsnkcublkaz.supabase.co:5432/postgres

SCRAPER_USER_AGENT=Alethia-Scraper/1.0 (+https://github.com/mosaico-analitica/alethia)
SCRAPER_REQUEST_DELAY=0.5

HCDN_API_BASE=https://datos.hcdn.gob.ar/api/3/action
HCDN_WEB_BASE=https://www.hcdn.gob.ar
HCDN_VOTES_BASE=https://votaciones.hcdn.gob.ar
SENATE_BASE=https://www.senado.gob.ar
CASA_ROSADA_BASE=https://www.casarosada.gob.ar
ANTICORRUPCION_BASE=https://www.argentina.gob.ar/anticorrupcion
```

**IMPORTANTE**: Usar la password real de Supabase (no la que esta en el .env local).

## 4. Configurar Cron Job (actualizacion automatica cada 6 horas)

Railway tiene cron jobs nativos:

1. En Railway, ir a tu servicio → "Cron Jobs"
2. Crear nuevo cron job:
   - **Name**: `pipeline-update`
   - **Schedule**: `0 */6 * * *` (cada 6 horas)
   - **Command**: `python run_pipeline.py`

O si Railway no tiene cron jobs disponibles en tu plan, usar GitHub Actions:

## Alternativa: GitHub Actions (gratis)

Crear `.github/workflows/update-data.yml`:

```yaml
name: Update Data from Official Sources

on:
  schedule:
    - cron: '0 */6 * * *'  # Cada 6 horas
  workflow_dispatch:  # Permitir ejecucion manual

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run pipeline
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DATABASE_URL_SYNC: ${{ secrets.DATABASE_URL_SYNC }}
          SCRAPER_USER_AGENT: ${{ secrets.SCRAPER_USER_AGENT }}
          SCRAPER_REQUEST_DELAY: '0.5'
          HCDN_API_BASE: 'https://datos.hcdn.gob.ar/api/3/action'
          HCDN_WEB_BASE: 'https://www.hcdn.gob.ar'
          HCDN_VOTES_BASE: 'https://votaciones.hcdn.gob.ar'
          SENATE_BASE: 'https://www.senado.gob.ar'
          CASA_ROSADA_BASE: 'https://www.casarosada.gob.ar'
          ANTICORRUPCION_BASE: 'https://www.argentina.gob.ar/anticorrupcion'
        run: |
          cd backend
          python run_pipeline.py
```

Luego, en GitHub → Settings → Secrets and variables → Actions, agregar:
- `DATABASE_URL`
- `DATABASE_URL_SYNC`
- `SCRAPER_USER_AGENT`

## 5. Verificar el deploy

1. Railway te dara una URL tipo `https://alethia-api.up.railway.app`
2. Probar: `GET https://alethia-api.up.railway.app/health`
3. Probar: `GET https://alethia-api.up.railway.app/api/v1/pipeline/runs`
4. Ejecutar manualmente: `POST https://alethia-api.up.railway.app/api/v1/pipeline/run`

## 6. Conectar frontend en Vercel

En Vercel, configurar la variable de entorno:
```
NEXT_PUBLIC_API_URL=https://alethia-api.up.railway.app
```

Re-deployar el frontend.

## Arquitectura final

```
HCDN/Senado/CasaRosada (fuentes)
         |
         v
Railway (API + Cron cada 6hs)
         |
         v
Supabase (PostgreSQL)
         |
         v
Vercel (Frontend Next.js)
```

## Troubleshooting

- Si el pipeline falla, revisar los logs en Railway
- Si no hay datos, verificar que DATABASE_URL apunta a Supabase correctamente
- Para forzar una ejecucion manual: usar el boton "Run workflow" en GitHub Actions
