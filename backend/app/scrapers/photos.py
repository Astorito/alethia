"""
Photo scraper + MinIO uploader for politician profile images.

Flow:
  1. Each legislator's photo_url comes from the source scraper
     (HCDN provides photo_id links, Senate provides direct URLs).
  2. This module downloads the raw image from the source.
  3. Uploads it to MinIO bucket "politicians" under key:
         politicians/{external_id}.jpg
  4. Returns the permanent internal URL:
         http://minio:9000/politicians/{external_id}.jpg
     (or the public CDN URL if configured)

MinIO is already in the docker-compose stack at port 9000/9001.
No Supabase needed — MinIO is S3-compatible and self-hosted.
"""
import io
from typing import Optional

import httpx
import structlog
from minio import Minio
from minio.error import S3Error

from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()

BUCKET_NAME = "politicians"
PHOTO_CONTENT_TYPE = "image/jpeg"


def get_minio_client() -> Minio:
    return Minio(
        endpoint=settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )


def ensure_bucket_exists(client: Minio):
    """Create the politicians bucket if it doesn't exist yet."""
    if not client.bucket_exists(BUCKET_NAME):
        client.make_bucket(BUCKET_NAME)
        policy = _public_read_policy(BUCKET_NAME)
        client.set_bucket_policy(BUCKET_NAME, policy)
        logger.info("created MinIO bucket", bucket=BUCKET_NAME)


def _public_read_policy(bucket: str) -> str:
    """S3 bucket policy that allows public GET on all objects."""
    import json
    return json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"AWS": ["*"]},
            "Action": ["s3:GetObject"],
            "Resource": [f"arn:aws:s3:::{bucket}/*"],
        }],
    })


async def download_photo(url: str) -> Optional[bytes]:
    """Download a photo from a remote URL."""
    if not url or not url.startswith("http"):
        return None
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(
                url,
                headers={"User-Agent": settings.SCRAPER_USER_AGENT},
            )
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "")
            if not any(t in content_type for t in ("image/", "application/octet-stream")):
                logger.warning("unexpected content type for photo", url=url, content_type=content_type)
            return resp.content
    except Exception as e:
        logger.error("failed to download photo", url=url, error=str(e))
        return None


def upload_photo_to_minio(
    client: Minio,
    external_id: str,
    image_bytes: bytes,
    content_type: str = PHOTO_CONTENT_TYPE,
) -> str:
    """
    Upload image bytes to MinIO and return the public URL.
    Object key: politicians/{external_id}.jpg
    """
    ext = "jpg" if "jpeg" in content_type or "jpg" in content_type else "png"
    object_name = f"{external_id}.{ext}"

    client.put_object(
        bucket_name=BUCKET_NAME,
        object_name=object_name,
        data=io.BytesIO(image_bytes),
        length=len(image_bytes),
        content_type=content_type,
    )

    public_url = f"http://{settings.MINIO_ENDPOINT}/{BUCKET_NAME}/{object_name}"
    logger.info("photo uploaded to MinIO", object=object_name, url=public_url)
    return public_url


async def process_politician_photo(
    external_id: str,
    source_url: str,
) -> Optional[str]:
    """
    Full flow: download + upload to MinIO.
    Returns the permanent MinIO URL, or None if failed.
    """
    client = get_minio_client()
    ensure_bucket_exists(client)

    # Skip if already uploaded
    try:
        object_name = f"{external_id}.jpg"
        client.stat_object(BUCKET_NAME, object_name)
        existing_url = f"http://{settings.MINIO_ENDPOINT}/{BUCKET_NAME}/{object_name}"
        logger.debug("photo already exists in MinIO, skipping", external_id=external_id)
        return existing_url
    except S3Error:
        pass

    image_bytes = await download_photo(source_url)
    if not image_bytes:
        return None

    return upload_photo_to_minio(client, external_id, image_bytes)


def build_hcdn_photo_url(photo_id: str) -> str:
    """Build the full photo URL from an HCDN photo_id."""
    if not photo_id:
        return ""
    return f"https://www.hcdn.gob.ar/diputados/fotos/{photo_id}.jpg"


def build_senate_photo_url(senator_id: str) -> str:
    """Build the full photo URL for a senator by their ID."""
    if not senator_id:
        return ""
    return f"https://www.senado.gob.ar/senadores/fotos/{senator_id}.jpg"
