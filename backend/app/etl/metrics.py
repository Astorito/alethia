"""
Political behavior metrics calculation engine.

Adapted from como_voto's methodology with extensions for:
  - Attendance percentage
  - Vote participation rate
  - Debate participation rate
  - Party alignment / government alignment
  - Legislative activity score
  - Asset growth tracking

como_voto reference methodology:
  - Attendance inferred from vote value (AUSENTE = absent)
  - Trailing AUSENTE after mandate end are discounted
  - Alignment calculated only on "contested" votes where
    coalitions differ
  - Procedural votes are excluded from alignment calculation
"""
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date
from typing import Optional


@dataclass
class LegislatorMetrics:
    legislator_id: str
    full_name: str = ""
    chamber: str = ""
    period_start: Optional[date] = None
    period_end: Optional[date] = None

    # Attendance
    total_sessions: int = 0
    sessions_present: int = 0
    sessions_absent: int = 0
    attendance_rate: float = 0.0

    # Voting
    total_votes: int = 0
    votes_participated: int = 0
    votes_absent: int = 0
    vote_participation_rate: float = 0.0
    votes_yes: int = 0
    votes_no: int = 0
    votes_abstain: int = 0

    # Debate
    total_session_with_debate: int = 0
    sessions_with_speech: int = 0
    total_speeches: int = 0
    total_words_spoken: int = 0
    debate_participation_rate: float = 0.0

    # Legislative activity
    bills_authored: int = 0
    bills_coauthored: int = 0
    bills_enacted: int = 0
    legislative_activity_score: float = 0.0

    # Alignment (como_voto methodology)
    party_alignment_rate: float = 0.0
    government_alignment_rate: float = 0.0
    party_alignment_votes: int = 0
    government_alignment_votes: int = 0

    # Asset growth
    asset_initial: Optional[float] = None
    asset_final: Optional[float] = None
    asset_growth_rate: Optional[float] = None


PROCEDURAL_KEYWORDS = [
    "MOCION DE ORDEN",
    "MOCIÓN DE ORDEN",
    "PEDIDO DE LICENCIA",
    "CUESTION DE PRIVILEGIO",
    "CUESTIÓN DE PRIVILEGIO",
    "APARTAMIENTO DEL REGLAMENTO",
    "JURAMENTO",
    "HOMENAJE",
]


def is_procedural_vote(title: str) -> bool:
    """
    Determine if a vote is procedural (should be excluded from alignment).
    Based on como_voto's is_contested logic.
    """
    title_upper = title.upper()
    return any(kw in title_upper for kw in PROCEDURAL_KEYWORDS)


def compute_majority_vote(positions: list[dict], coalition_blocs: set[str]) -> Optional[str]:
    """
    Compute the majority vote of a coalition for a given voting event.
    Adapted from como_voto's compute_combined_majority.
    
    Only counts active votes (yes/no/abstain), excludes absent.
    Returns the vote value with the highest count, or None if no active votes.
    """
    counts = defaultdict(int)
    for p in positions:
        if p.get("bloc") not in coalition_blocs:
            continue
        vote = p.get("vote_value", "")
        if vote in ("yes", "no", "abstain"):
            counts[vote] += 1

    if not counts:
        return None
    return max(counts, key=counts.get)


def is_contested_vote(
    positions: list[dict],
    coalition_a_blocs: set[str],
    coalition_b_blocs: set[str],
    title: str = "",
) -> bool:
    """
    A vote is 'contested' if the two main coalitions voted differently.
    Based on como_voto's is_contested logic:
    - Both coalitions must have a defined majority (not None/absent)
    - Their majorities must differ
    - Not a procedural vote
    """
    if is_procedural_vote(title):
        return False

    majority_a = compute_majority_vote(positions, coalition_a_blocs)
    majority_b = compute_majority_vote(positions, coalition_b_blocs)

    if majority_a is None or majority_b is None:
        return False
    if majority_a == "absent" or majority_b == "absent":
        return False

    return majority_a != majority_b


def compute_alignment(
    legislator_votes: list[dict],
    all_positions_by_vote: dict[str, list[dict]],
    coalition_blocs: set[str],
) -> tuple[float, int]:
    """
    Compute alignment rate between a legislator and a coalition.
    Returns (alignment_rate, total_contested_votes).
    
    For each contested vote where the legislator participated:
    - If legislator's vote matches coalition majority -> aligned
    """
    aligned = 0
    total = 0

    for lv in legislator_votes:
        vote_id = lv.get("vote_id")
        vote_value = lv.get("vote_value")

        if vote_value in ("absent", "present"):
            continue

        positions = all_positions_by_vote.get(vote_id, [])
        majority = compute_majority_vote(positions, coalition_blocs)
        if majority is None:
            continue

        total += 1
        if vote_value == majority:
            aligned += 1

    rate = (aligned / total * 100) if total > 0 else 0.0
    return rate, total


def count_trailing_absent(votes_chronological: list[dict]) -> int:
    """
    Count trailing AUSENTE votes that occur after a legislator's mandate ended.
    Based on como_voto's _count_trailing_ausente:
    - Find the last non-absent vote
    - Count absent votes after that date
    - If the very last vote is absent, it counts (legislator still in office)
    """
    if not votes_chronological:
        return 0

    last_active_idx = -1
    for i, v in enumerate(votes_chronological):
        if v.get("vote_value") not in ("absent",):
            last_active_idx = i

    if last_active_idx == -1:
        return 0

    trailing = 0
    for v in votes_chronological[last_active_idx + 1:]:
        if v.get("vote_value") == "absent":
            trailing += 1

    return trailing


def calculate_legislator_metrics(
    legislator_id: str,
    votes: list[dict],
    sessions: list[dict],
    speeches: list[dict],
    bills_authored: int = 0,
    bills_coauthored: int = 0,
    bills_enacted: int = 0,
) -> LegislatorMetrics:
    """
    Calculate all metrics for a single legislator.
    Combines como_voto methodology with Alethia extensions.
    """
    m = LegislatorMetrics(legislator_id=legislator_id)

    # Voting metrics
    trailing = count_trailing_absent(votes)
    effective_votes = votes[:len(votes) - trailing] if trailing > 0 else votes

    m.total_votes = len(effective_votes)
    for v in effective_votes:
        val = v.get("vote_value", "absent")
        if val == "yes":
            m.votes_yes += 1
            m.votes_participated += 1
        elif val == "no":
            m.votes_no += 1
            m.votes_participated += 1
        elif val == "abstain":
            m.votes_abstain += 1
            m.votes_participated += 1
        elif val == "absent":
            m.votes_absent += 1

    m.vote_participation_rate = (
        m.votes_participated / m.total_votes * 100
    ) if m.total_votes > 0 else 0.0

    # Session attendance (inferred from votes, como_voto style)
    session_ids = {v.get("session_id") for v in effective_votes if v.get("session_id")}
    m.total_sessions = len(session_ids)

    absent_sessions = set()
    present_sessions = set()
    for v in effective_votes:
        sid = v.get("session_id")
        if not sid:
            continue
        if v.get("vote_value") == "absent":
            absent_sessions.add(sid)
        else:
            present_sessions.add(sid)

    # If a legislator voted in ANY vote in a session, they were present
    m.sessions_present = len(present_sessions)
    m.sessions_absent = len(absent_sessions - present_sessions)
    m.attendance_rate = (
        m.sessions_present / m.total_sessions * 100
    ) if m.total_sessions > 0 else 0.0

    # Debate participation
    sessions_with_speech_set = {s.get("session_id") for s in speeches if s.get("session_id")}
    m.sessions_with_speech = len(sessions_with_speech_set)
    m.total_speeches = len(speeches)
    m.total_words_spoken = sum(s.get("word_count", 0) for s in speeches)
    m.total_session_with_debate = len(sessions) if sessions else m.total_sessions
    m.debate_participation_rate = (
        m.sessions_with_speech / m.total_session_with_debate * 100
    ) if m.total_session_with_debate > 0 else 0.0

    # Legislative activity
    m.bills_authored = bills_authored
    m.bills_coauthored = bills_coauthored
    m.bills_enacted = bills_enacted
    m.legislative_activity_score = _compute_activity_score(m)

    return m


def _compute_activity_score(m: LegislatorMetrics) -> float:
    """
    Composite legislative activity score (0-100).
    Weighted combination of attendance, voting, debate, and bills.
    """
    attendance_component = m.attendance_rate * 0.25
    vote_component = m.vote_participation_rate * 0.25
    debate_component = m.debate_participation_rate * 0.20

    # Bills: scale based on reasonable maximums
    bill_score = min(100, (m.bills_authored * 10 + m.bills_coauthored * 3 + m.bills_enacted * 20))
    bill_component = bill_score * 0.30

    return round(attendance_component + vote_component + debate_component + bill_component, 2)
