from sqlalchemy import func, asc, desc
from sqlalchemy.orm import aliased

from database import db
from models import Archetype, Character, Match, BaseId


def get_archetype_counts() -> list[dict]:
    """
    Returns list of {archetype: name, count: n}
    Includes archetypes that have at least one character.
    """
    rows = (
        db.session.query(Archetype.name, func.count(Character.id))
        .join(Character, Archetype.id == Character.archetype_id)
        .group_by(Archetype.name)
        .all()
    )
    return [{"archetype": r[0], "count": r[1]} for r in rows]


def get_rarity_counts() -> list[dict]:
    """
    Returns list of {rarity: int, count: n}
    """
    rows = (
        db.session.query(Character.rarity, func.count(Character.id))
        .group_by(Character.rarity)
        .order_by(desc(Character.rarity))
        .all()
    )
    return [{"rarity": int(r[0]), "count": r[1]} for r in rows]


def _pairs_with_names(order_by_votes_desc=True, limit=10, only_positive_votes=True):
    """
    Helper to return pairs with character names and vote counts.
    Returns list of {char_a_id, char_a_name, char_b_id, char_b_name, votes}
    """
    A = aliased(Character)
    B = aliased(Character)
    BaseA = aliased(BaseId)
    BaseB = aliased(BaseId)

    query = (
        db.session.query(
            Match.character_id,
            Match.match_id,
            Match.votes,
            A.name.label("a_name"),
            BaseA.name.label("a_base"),
            B.name.label("b_name"),
            BaseB.name.label("b_base"),
        )
        .join(A, A.id == Match.character_id)
        .join(BaseA, BaseA.id == A.base_id)
        .join(B, B.id == Match.match_id)
        .join(BaseB, BaseB.id == B.base_id)
    )

    if only_positive_votes:
        query = query.filter(Match.votes > 0)

    if order_by_votes_desc:
        query = query.order_by(desc(Match.votes))
    else:
        query = query.order_by(asc(Match.votes))

    rows = query.limit(limit).all()

    return [
        {
            "char_a_id": r[0],
            "char_b_id": r[1],
            "votes": r[2],
            "char_a_name": r[3],
            "char_a_base_name": r[4],
            "char_b_name": r[5],
            "char_b_base_name": r[6],
        }
        for r in rows
    ]


def get_top_pairs(limit=10) -> list[dict]:
    return _pairs_with_names(
        order_by_votes_desc=True, limit=limit, only_positive_votes=True
    )


def get_bottom_pairs(limit=10) -> list[dict]:
    # For bottom pairs we restrict to positive votes to avoid showing many zero-vote pairs.
    return _pairs_with_names(
        order_by_votes_desc=False, limit=limit, only_positive_votes=True
    )
