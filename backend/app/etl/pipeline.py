"""
Main ETL pipeline orchestrator.

Coordinates the full data ingestion flow:
  1. Scraping  → raw data from official sources
  2. Transform → normalize, clean, deduplicate
  3. Load      → upsert into PostgreSQL
  4. Compute   → calculate derived metrics

Designed to run incrementally (only fetch new data since last run).
"""
import asyncio
from datetime import datetime
from typing import Optional
from uuid import UUID

import structlog
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.models import (
    Institution, Party, Politician, PoliticianRole,
    Session, Vote, VotePosition, Bill, BillAuthor,
    Committee, CommitteeMembership, ParliamentaryBloc,
    ExecutiveOfficial, ExecutiveAction,
    AssetDeclaration, AssetItem, ScrapingRun, Speech,
    SessionAttendance,
)
from app.scrapers.hcdn_legislators import HCDNLegislatorScraper
from app.scrapers.hcdn_votes import HCDNVoteScraper
from app.scrapers.hcdn_bills import HCDNBillScraper
from app.scrapers.hcdn_sessions import HCDNSessionScraper
from app.scrapers.senate import SenateScraper
from app.scrapers.executive import ExecutiveScraper
from app.scrapers.asset_declarations import AssetDeclarationScraper
from app.scrapers.photos import process_politician_photo, build_hcdn_photo_url, build_senate_photo_url
from app.etl.normalization import (
    normalize_name, canonicalize_province, classify_bloc_to_coalition, parse_date,
)

logger = structlog.get_logger()


class AlethiaPipeline:
    """Orchestrates the full ETL pipeline."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self._institution_cache: dict[str, UUID] = {}
        self._party_cache: dict[str, UUID] = {}
        self._politician_cache: dict[str, UUID] = {}

    async def _get_or_create_institution(self, name: str, short_name: str, inst_type: str) -> UUID:
        cache_key = short_name or name
        if cache_key in self._institution_cache:
            return self._institution_cache[cache_key]

        result = await self.db.execute(
            select(Institution).where(Institution.short_name == short_name)
        )
        inst = result.scalar_one_or_none()
        if not inst:
            inst = Institution(name=name, short_name=short_name, type=inst_type)
            self.db.add(inst)
            await self.db.flush()

        self._institution_cache[cache_key] = inst.id
        return inst.id

    async def _get_or_create_party(self, name: str) -> Optional[UUID]:
        if not name:
            return None
        normalized = normalize_name(name)
        if normalized in self._party_cache:
            return self._party_cache[normalized]

        result = await self.db.execute(
            select(Party).where(Party.name == name)
        )
        party = result.scalar_one_or_none()
        if not party:
            party = Party(name=name, short_name=name[:20])
            self.db.add(party)
            await self.db.flush()

        self._party_cache[normalized] = party.id
        return party.id

    async def _get_or_create_politician(self, data: dict, institution_id: UUID) -> UUID:
        ext_id = data.get("external_id", "")
        name = data.get("full_name", "")
        cache_key = ext_id or normalize_name(name)

        if cache_key in self._politician_cache:
            return self._politician_cache[cache_key]

        if ext_id:
            result = await self.db.execute(
                select(Politician).where(Politician.external_id == ext_id)
            )
            pol = result.scalar_one_or_none()
        else:
            normalized = normalize_name(name)
            result = await self.db.execute(
                select(Politician).where(
                    Politician.full_name == name
                )
            )
            pol = result.scalar_one_or_none()

        if not pol:
            pol = Politician(
                full_name=name,
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                province=canonicalize_province(data.get("province", "")),
                photo_url=data.get("photo_url", ""),
                external_id=ext_id,
                source="xml_api",
            )
            self.db.add(pol)
            await self.db.flush()

        self._politician_cache[cache_key] = pol.id
        return pol.id

    async def _log_run(self, source: str) -> ScrapingRun:
        run = ScrapingRun(source=source)
        self.db.add(run)
        await self.db.flush()
        return run

    async def _finish_run(self, run: ScrapingRun, found: int, created: int, updated: int, error: str = None):
        run.finished_at = datetime.utcnow()
        run.status = "failed" if error else "completed"
        run.records_found = found
        run.records_created = created
        run.records_updated = updated
        run.error_message = error

    # ─── DEPUTIES PIPELINE ───────────────────────────────────

    async def ingest_deputies(self):
        """Full pipeline for HCDN deputies data."""
        run = await self._log_run("hcdn_legislators")
        created = 0

        try:
            deputies_inst_id = await self._get_or_create_institution(
                "Cámara de Diputados de la Nación", "HCD", "deputies"
            )

            async with HCDNLegislatorScraper() as scraper:
                # Legislators
                raw = await scraper.scrape_legislators()
                for item in raw:
                    pol_id = await self._get_or_create_politician(item, deputies_inst_id)
                    party_id = await self._get_or_create_party(item.get("party", ""))

                    existing_role = await self.db.execute(
                        select(PoliticianRole).where(
                            PoliticianRole.politician_id == pol_id,
                            PoliticianRole.institution_id == deputies_inst_id,
                            PoliticianRole.ended_at.is_(None),
                        )
                    )
                    if not existing_role.scalar_one_or_none():
                        role = PoliticianRole(
                            politician_id=pol_id,
                            institution_id=deputies_inst_id,
                            party_id=party_id,
                            role_title="Diputado Nacional",
                            started_at=parse_date(item.get("mandate_start", "")) or datetime.utcnow().date(),
                            ended_at=parse_date(item.get("mandate_end", "")),
                            district=canonicalize_province(item.get("province", "")),
                        )
                        self.db.add(role)
                        created += 1

                # Blocs
                blocs = await scraper.scrape_blocs()
                for b in blocs:
                    stmt = pg_insert(ParliamentaryBloc).values(
                        institution_id=deputies_inst_id,
                        name=b["name"],
                        short_name=b.get("short_name"),
                        interbloc_name=b.get("interbloc_name"),
                        president_name=b.get("president_name"),
                        member_count=b.get("member_count", 0),
                        external_id=b.get("external_id"),
                    ).on_conflict_do_update(
                        index_elements=["institution_id", "name"],
                        set_={"member_count": b.get("member_count", 0)},
                    )
                    await self.db.execute(stmt)

                # Committees
                committees_raw = await scraper.scrape_committees()
                committee_cache = {}
                for c in committees_raw:
                    cname = c["committee_name"]
                    if cname not in committee_cache:
                        stmt = pg_insert(Committee).values(
                            institution_id=deputies_inst_id,
                            name=cname,
                            external_id=c.get("committee_id"),
                        ).on_conflict_do_nothing()
                        await self.db.execute(stmt)
                        result = await self.db.execute(
                            select(Committee).where(
                                Committee.institution_id == deputies_inst_id,
                                Committee.name == cname,
                            )
                        )
                        comm = result.scalar_one_or_none()
                        if comm:
                            committee_cache[cname] = comm.id

                    if cname in committee_cache and c.get("legislator_id"):
                        pol_id = self._politician_cache.get(c["legislator_id"])
                        if pol_id:
                            stmt = pg_insert(CommitteeMembership).values(
                                committee_id=committee_cache[cname],
                                politician_id=pol_id,
                                role=c.get("role", "member"),
                            ).on_conflict_do_nothing()
                            await self.db.execute(stmt)

            await self.db.commit()
            await self._finish_run(run, len(raw), created, 0)
            logger.info("deputies ingestion complete", created=created, total=len(raw))

        except Exception as e:
            await self._finish_run(run, 0, 0, 0, str(e))
            logger.error("deputies ingestion failed", error=str(e))
            raise

    # ─── SENATORS PIPELINE ───────────────────────────────────

    async def ingest_senators(self):
        """Full pipeline for Senate data."""
        run = await self._log_run("senate_legislators")
        created = 0

        try:
            senate_inst_id = await self._get_or_create_institution(
                "Senado de la Nación", "HSN", "senate"
            )

            async with SenateScraper() as scraper:
                raw = await scraper.scrape_senators()
                for item in raw:
                    pol_id = await self._get_or_create_politician(item, senate_inst_id)
                    party_id = await self._get_or_create_party(item.get("party", ""))

                    existing_role = await self.db.execute(
                        select(PoliticianRole).where(
                            PoliticianRole.politician_id == pol_id,
                            PoliticianRole.institution_id == senate_inst_id,
                            PoliticianRole.ended_at.is_(None),
                        )
                    )
                    if not existing_role.scalar_one_or_none():
                        role = PoliticianRole(
                            politician_id=pol_id,
                            institution_id=senate_inst_id,
                            party_id=party_id,
                            role_title="Senador Nacional",
                            started_at=datetime.utcnow().date(),
                            district=canonicalize_province(item.get("province", "")),
                        )
                        self.db.add(role)
                        created += 1

            await self.db.commit()
            await self._finish_run(run, len(raw), created, 0)
            logger.info("senators ingestion complete", created=created, total=len(raw))

        except Exception as e:
            await self._finish_run(run, 0, 0, 0, str(e))
            raise

    # ─── VOTES PIPELINE ──────────────────────────────────────

    async def ingest_votes(self, chamber: str = "deputies"):
        """
        Ingest voting records.
        For deputies: uses CKAN API first, then falls back to HTML.
        For senate: uses como_voto-style POST scraping.
        """
        run = await self._log_run(f"{chamber}_votes")
        created = 0

        try:
            if chamber == "deputies":
                inst_id = await self._get_or_create_institution(
                    "Cámara de Diputados de la Nación", "HCD", "deputies"
                )
                async with HCDNVoteScraper() as scraper:
                    raw_votes = await scraper.scrape_votes_from_ckan()
            else:
                inst_id = await self._get_or_create_institution(
                    "Senado de la Nación", "HSN", "senate"
                )
                raw_votes = []
                async with SenateScraper() as scraper:
                    current_year = datetime.utcnow().year
                    for year in range(current_year, current_year - 3, -1):
                        actas = await scraper.scrape_vote_list(year)
                        for acta in actas:
                            detail = await scraper.scrape_vote_detail(acta["acta_id"])
                            if detail:
                                for pos in detail.get("positions", []):
                                    pos["vote_external_id"] = detail["external_id"]
                                    pos["vote_title"] = detail["title"]
                                    pos["vote_date"] = detail["date"]
                                    pos["vote_result"] = detail["result"]
                                    pos["vote_type"] = detail.get("vote_type", "")
                                    pos["chamber"] = "senate"
                                raw_votes.extend(detail.get("positions", []))

            # Group by vote event
            votes_by_id: dict[str, list[dict]] = {}
            for rv in raw_votes:
                vid = rv.get("vote_external_id", "")
                if vid:
                    votes_by_id.setdefault(vid, []).append(rv)

            for vid, positions in votes_by_id.items():
                first = positions[0]
                vote_date = parse_date(first.get("vote_date", ""))

                existing = await self.db.execute(
                    select(Vote).where(Vote.external_id == vid)
                )
                if existing.scalar_one_or_none():
                    continue

                # Find or create session for this vote's date
                session = None
                if vote_date:
                    result = await self.db.execute(
                        select(Session).where(
                            Session.institution_id == inst_id,
                            Session.date == vote_date,
                        )
                    )
                    session = result.scalar_one_or_none()

                if not session:
                    session = Session(
                        institution_id=inst_id,
                        title=f"Sesión {vote_date or 'sin fecha'}",
                        date=vote_date or datetime.utcnow().date(),
                        status="completed",
                    )
                    self.db.add(session)
                    await self.db.flush()

                counts = {"yes": 0, "no": 0, "abstain": 0, "absent": 0}
                for p in positions:
                    v = p.get("vote_value", "absent")
                    if v in counts:
                        counts[v] += 1

                vote = Vote(
                    session_id=session.id,
                    title=first.get("vote_title", ""),
                    vote_type=first.get("vote_type", ""),
                    result=first.get("vote_result", ""),
                    yes_count=counts["yes"],
                    no_count=counts["no"],
                    abstain_count=counts["abstain"],
                    absent_count=counts["absent"],
                    voted_at=datetime.combine(vote_date, datetime.min.time()) if vote_date else None,
                    external_id=vid,
                )
                self.db.add(vote)
                await self.db.flush()

                for p in positions:
                    legislator_name = p.get("legislator_name", "")
                    if not legislator_name:
                        continue

                    pol_id = await self._get_or_create_politician(
                        {"full_name": legislator_name, "external_id": p.get("legislator_id", ""),
                         "province": p.get("province", "")},
                        inst_id,
                    )

                    vp = VotePosition(
                        vote_id=vote.id,
                        politician_id=pol_id,
                        position=p.get("vote_value", "absent"),
                    )
                    self.db.add(vp)

                created += 1

            await self.db.commit()
            await self._finish_run(run, len(raw_votes), created, 0)
            logger.info("votes ingestion complete", chamber=chamber, vote_events=created)

        except Exception as e:
            await self._finish_run(run, 0, 0, 0, str(e))
            raise

    # ─── BILLS PIPELINE ──────────────────────────────────────

    async def ingest_bills(self):
        """Ingest bills/projects from HCDN CKAN."""
        run = await self._log_run("hcdn_bills")
        created = 0
        errors = 0

        try:
            inst_id = await self._get_or_create_institution(
                "Cámara de Diputados de la Nación", "HCD", "deputies"
            )

            async with HCDNBillScraper() as scraper:
                raw = await scraper.scrape_bills()
                logger.info("processing bills", total=len(raw))
                
                # Debug: ver las primeras filas
                if raw:
                    logger.info("sample bill data", 
                              keys=list(raw[0].keys()),
                              external_id=raw[0].get("external_id", "N/A"),
                              number=raw[0].get("number", "N/A"))
                
                for idx, item in enumerate(raw):  # Procesar TODOS los proyectos
                    ext_id = item.get("external_id", "").strip()
                    if not ext_id:
                        if idx < 5:  # Log solo las primeras vacías
                            logger.warning("bill without external_id", 
                                         idx=idx, 
                                         number=item.get("number"),
                                         title=item.get("title", "")[:50])
                        continue
                    
                    try:
                        existing = await self.db.execute(
                            select(Bill).where(Bill.external_id == ext_id)
                        )
                        if existing.scalar_one_or_none():
                            continue

                        mapped_status = self._map_bill_status(item.get("status", ""))
                        bill = Bill(
                            institution_id=inst_id,
                            title=item.get("title", "")[:500],  # Truncar si es necesario
                            number=item.get("number", "")[:50],
                            summary=item.get("summary", "")[:2000],
                            status=mapped_status,
                            introduced_at=parse_date(item.get("date_presented", "")),
                            external_id=ext_id[:100],
                            source="xml_api",  # Explicitamente setear el source
                        )
                        self.db.add(bill)
                        await self.db.flush()

                        author_id = item.get("author_id", "")
                        if author_id and author_id in self._politician_cache:
                            ba = BillAuthor(
                                bill_id=bill.id,
                                politician_id=self._politician_cache[author_id],
                                role=item.get("author_role", "author"),
                            )
                            self.db.add(ba)

                        created += 1
                        if created % 100 == 0:
                            logger.info("bills progress", created=created, processed=idx)
                    except Exception as item_error:
                        errors += 1
                        logger.error("bill insert failed", 
                                   external_id=ext_id, 
                                   error=str(item_error),
                                   status=self._map_bill_status(item.get("status", "")))
                        continue

            await self.db.commit()
            await self._finish_run(run, len(raw), created, 0, None)
            logger.info("bills ingestion complete", created=created, errors=errors)

        except Exception as e:
            await self._finish_run(run, 0, 0, 0, str(e))
            logger.error("bills pipeline failed", error=str(e))
            raise

    # ─── EXECUTIVE PIPELINE ──────────────────────────────────

    async def ingest_executive(self):
        """Ingest executive branch data."""
        run = await self._log_run("executive")
        created = 0

        try:
            async with ExecutiveScraper() as scraper:
                speeches = await scraper.scrape_speeches()
                for s in speeches:
                    action = ExecutiveAction(
                        action_type=s.get("action_type", "speech"),
                        title=s.get("title", ""),
                        date=parse_date(s.get("date", "")) or datetime.utcnow().date(),
                        summary=s.get("summary", ""),
                        source_url=s.get("source_url", ""),
                    )
                    self.db.add(action)
                    created += 1

                decrees = await scraper.scrape_decrees()
                for d in decrees:
                    action = ExecutiveAction(
                        action_type=d.get("action_type", "decree"),
                        title=d.get("title", ""),
                        number=d.get("number", ""),
                        date=parse_date(d.get("date", "")) or datetime.utcnow().date(),
                        source_url=d.get("source_url", ""),
                    )
                    self.db.add(action)
                    created += 1

            await self.db.commit()
            await self._finish_run(run, len(speeches) + len(decrees), created, 0)

        except Exception as e:
            await self._finish_run(run, 0, 0, 0, str(e))
            raise

    # ─── ASSET DECLARATIONS PIPELINE ─────────────────────────

    async def ingest_asset_declarations(self):
        """Ingest asset declarations from the Anti-Corruption Office."""
        run = await self._log_run("asset_declarations")
        created = 0

        try:
            async with AssetDeclarationScraper() as scraper:
                index = await scraper.scrape_declarations_index()

                for entry in index:
                    name = entry.get("official_name", "")
                    year = entry.get("declaration_year")
                    if not name or not year:
                        continue

                    existing = await self.db.execute(
                        select(AssetDeclaration).where(
                            AssetDeclaration.official_name == name,
                            AssetDeclaration.declaration_year == year,
                        )
                    )
                    if existing.scalar_one_or_none():
                        continue

                    detail_url = entry.get("source_url", "")
                    detail = None
                    if detail_url:
                        detail = await scraper.scrape_declaration_detail(detail_url)

                    # Try to link to existing politician
                    pol_id = None
                    normalized = normalize_name(name)
                    if normalized in self._politician_cache:
                        pol_id = self._politician_cache[normalized]

                    decl = AssetDeclaration(
                        politician_id=pol_id,
                        official_name=name,
                        declaration_year=year,
                        total_assets=detail.get("total_assets") if detail else None,
                        source_url=detail_url,
                    )
                    self.db.add(decl)
                    await self.db.flush()

                    if detail:
                        for item in detail.get("items", []):
                            ai = AssetItem(
                                declaration_id=decl.id,
                                category=item.get("category", "other"),
                                description=item.get("description", ""),
                                value=item.get("value"),
                                company_name=item.get("company_name"),
                            )
                            self.db.add(ai)

                    created += 1

            await self.db.commit()
            await self._finish_run(run, len(index), created, 0)

        except Exception as e:
            await self._finish_run(run, 0, 0, 0, str(e))
            raise

    # ─── PHOTOS PIPELINE ─────────────────────────────────────

    async def ingest_photos(self):
        """
        Download all politician photos from source URLs and store in MinIO.
        After this runs, photo_url is replaced with the permanent MinIO URL.
        """
        run = await self._log_run("photos")
        updated = 0

        try:
            result = await self.db.execute(
                select(Politician).where(
                    Politician.photo_url.isnot(None),
                    Politician.photo_url != "",
                )
            )
            politicians = result.scalars().all()

            for pol in politicians:
                if not pol.external_id:
                    continue

                # Build source URL: if photo_url is already a MinIO URL, skip
                if "minio" in (pol.photo_url or "") or "/politicians/" in (pol.photo_url or ""):
                    continue

                source_url = pol.photo_url
                # For HCDN: photo_url may be a relative path or photo_id
                if source_url and not source_url.startswith("http"):
                    source_url = build_hcdn_photo_url(source_url)

                minio_url = await process_politician_photo(
                    external_id=pol.external_id,
                    source_url=source_url,
                )
                if minio_url:
                    pol.photo_url = minio_url
                    updated += 1

            await self.db.commit()
            await self._finish_run(run, len(politicians), 0, updated)
            logger.info("photos ingestion complete", updated=updated, total=len(politicians))

        except Exception as e:
            await self._finish_run(run, 0, 0, 0, str(e))
            raise

    # ─── FULL PIPELINE ───────────────────────────────────────

    async def run_full_pipeline(self):
        """Execute all ingestion tasks in sequence."""
        logger.info("starting full pipeline")
        steps = [
            ("deputies", self.ingest_deputies),
            ("senators", self.ingest_senators),
            ("deputies_votes", lambda: self.ingest_votes("deputies")),
            ("senate_votes", lambda: self.ingest_votes("senate")),
            ("bills", self.ingest_bills),
            ("executive", self.ingest_executive),
            ("assets", self.ingest_asset_declarations),
            # NOTA: "photos" requiere MinIO. Sin Docker, usamos URLs oficiales directamente.
            # ("photos", self.ingest_photos),
        ]
        for name, fn in steps:
            try:
                logger.info(f"running step: {name}")
                await fn()
            except Exception as e:
                logger.error(f"step failed: {name}", error=str(e))
                continue
        logger.info("full pipeline complete")

    @staticmethod
    def _map_bill_status(raw: str) -> str:
        raw_lower = raw.strip().lower()
        mapping = {
            "ingresado": "draft",
            "en comisión": "committee",
            "en comision": "committee",
            "dictaminado": "floor",
            "media sanción": "floor",
            "media sancion": "floor",
            "sancionado": "passed",
            "promulgado": "enacted",
            "rechazado": "rejected",
            "vetado": "vetoed",
        }
        for key, val in mapping.items():
            if key in raw_lower:
                return val
        return "draft"
