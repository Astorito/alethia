"""
Script standalone para ejecutar el pipeline ETL directamente.

Este script:
1. Crea su propia conexion a Supabase (no depende de FastAPI)
2. Ejecuta el pipeline completo secuencialmente
3. Imprime logs en tiempo real

Uso:
    cd backend
    .venv/Scripts/activate  (Windows: .venv\\Scripts\\activate)
    python run_pipeline.py

Para ejecutar solo ciertos pasos:
    python run_pipeline.py --steps deputies,senators,bills
"""
import asyncio
import argparse
import sys
from pathlib import Path

# Agregar el backend al path para imports
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.config import get_settings
from app.etl.pipeline import AlethiaPipeline


ALL_STEPS = [
    "deputies",
    "senators",
    "deputies_votes",
    "senate_votes",
    "bills",
    "executive",
    "assets",
]


async def run_step(step_name: str, async_session) -> bool:
    """
    Ejecuta un paso del pipeline con su propia sesion de DB.
    Retorna True si fue exitoso, False si fallo.
    Cada paso tiene sesion independiente para que un fallo no rompa los demas.
    """
    print(f"\n{'='*60}")
    print(f"PASO: {step_name.upper()}")
    print(f"{'='*60}")

    async with async_session() as db:
        pipeline = AlethiaPipeline(db)
        step_map = {
            "deputies": pipeline.ingest_deputies,
            "senators": pipeline.ingest_senators,
            "deputies_votes": lambda: pipeline.ingest_votes("deputies"),
            "senate_votes": lambda: pipeline.ingest_votes("senate"),
            "bills": pipeline.ingest_bills,
            "executive": pipeline.ingest_executive,
            "assets": pipeline.ingest_asset_declarations,
        }

        if step_name not in step_map:
            print(f"  ERROR: paso desconocido '{step_name}'")
            print(f"  Pasos validos: {', '.join(step_map.keys())}")
            return False

        try:
            await step_map[step_name]()
            print(f"  [OK] {step_name} completado")
            return True
        except Exception as e:
            print(f"  [FAIL] {step_name} fallo: {e}")
            import traceback
            traceback.print_exc()
            return False


async def main(steps: list[str] | None = None) -> None:
    """
    Ejecuta el pipeline ETL contra Supabase.
    Cada paso usa su propia sesion de DB para aislar fallos.

    Args:
        steps: Lista de pasos a ejecutar. Si es None, ejecuta todos.
    """
    settings = get_settings()

    print("Conectando a Supabase...")
    print(f"URL: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'oculta'}")

    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        pool_size=5,
        max_overflow=10,
    )

    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    steps_to_run = steps or ALL_STEPS

    print("\n" + "="*60)
    print("INICIANDO PIPELINE")
    print(f"Pasos: {', '.join(steps_to_run)}")
    print("="*60)

    results: dict[str, bool] = {}
    for step_name in steps_to_run:
        results[step_name] = await run_step(step_name, async_session)

    await engine.dispose()

    print("\n" + "="*60)
    print("RESUMEN")
    print("="*60)
    ok = [s for s, r in results.items() if r]
    fail = [s for s, r in results.items() if not r]
    for s in ok:
        print(f"  [OK] {s}")
    for s in fail:
        print(f"  [FAIL] {s}  <-- FALLO")

    print("="*60)
    if fail:
        print(f"COMPLETADO CON {len(fail)} ERROR(ES)")
    else:
        print("PIPELINE COMPLETADO SIN ERRORES")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Ejecuta el pipeline ETL de Alethia contra Supabase"
    )
    parser.add_argument(
        "--steps",
        type=str,
        help="Pasos especificos a ejecutar, separados por coma (ej: deputies,senators,bills)"
    )
    
    args = parser.parse_args()
    
    steps = None
    if args.steps:
        steps = [s.strip() for s in args.steps.split(",")]
    
    try:
        asyncio.run(main(steps))
    except KeyboardInterrupt:
        print("\n\nInterrumpido por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError fatal: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
