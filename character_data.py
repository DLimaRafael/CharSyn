from sqlalchemy import or_
from models import BaseId, Character, Match
from models.archetype import Archetype
from utils import calculate_votes


def format_base_id_data(data) -> list[dict]:
    return [{"id": base.id, "name": base.name} for base in data]


def format_character_data(data: list, votes: dict = {}) -> list[dict]:
    return [
        {
            "id": character.id,
            "name": character.name,
            "base_id": character.base.id,
            "base_name": character.base.name,
            "rarity": character.rarity,
            "archetype_name": character.archetype.name,
            "votes": votes.get(character.id, 0),
        }
        for character in data
    ]


def get_matched_characters(character_id: int) -> list[dict]:
    matches = Match.query.filter(
        or_(Match.character_id == character_id, Match.match_id == character_id)
    ).all()

    matched_ids = [
        match.match_id if match.character_id == character_id else match.character_id
        for match in matches
    ]

    matched_characters = Character.query.filter(Character.id.in_(matched_ids)).all()
    votes = calculate_votes(matches, character_id)

    return format_character_data(matched_characters, votes)


def get_all_characters(character_name: str, character_id: int) -> list[dict]:
    current_character = Character.query.get_or_404(character_id)
    matches = Match.query.filter(
        or_(Match.character_id == character_id, Match.match_id == character_id)
    ).all()

    votes = calculate_votes(matches, character_id)

    all_characters = (
        Character.query.join(BaseId)
        .filter(
            or_(
                Character.name.ilike(f"%{character_name}%"),
                BaseId.name.ilike(f"%{character_name}%"),
            )
        )
        .filter(Character.base_id != current_character.base_id)
        .all()
    )

    return format_character_data(all_characters, votes)


def get_character_by_id(id: int) -> dict:
    character = Character.query.get_or_404(id)
    return format_character_data([character])[0]


def get_characters_by_name(name: str, base_id: int = 0) -> list[dict]:
    characters = (
        Character.query.join(BaseId)
        .filter(or_(Character.name.ilike(f"%{name}%"), BaseId.name.ilike(f"%{name}%")))
        .filter(Character.base_id != base_id)
        .all()
    )
    return format_character_data(characters)


def get_character_filters() -> dict:
    base_ids = BaseId.query.order_by(BaseId.name.asc()).all()
    archetypes = Archetype.query.all()
    rarities = (
        Character.query.distinct(Character.rarity)
        .order_by(Character.rarity.asc())
        .values(Character.rarity)
    )

    return {
        "base_ids": [(base.id, base.name) for base in base_ids],
        "archetypes": [(archetype.id, archetype.name) for archetype in archetypes],
        "rarities": [rarity[0] for rarity in rarities],
    }
