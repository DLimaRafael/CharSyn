from sqlalchemy import or_

from models import BaseId, Character, Match


def format_character_data(data: list) -> list[dict]:
    return [
        {
            "id": character.id,
            "name": character.name,
            "base_id": character.base_id,
            "base_name": character.base.name,
            "rarity": character.rarity,
            "archetype": character.archetype.name,
        }
        for character in data
    ]


def get_unmatched_characters(character_name: str, character_id: int) -> list[dict]:
    current_character = Character.query.get_or_404(character_id)
    matched_ids = Match.query.filter(
        or_(Match.character_id == character_id, Match.match_id == character_id)
    ).all()

    unmatched_characters = (
        Character.query.filter(Character.id.notin_(matched_ids))
        .filter(Character.name.ilike(f"%{character_name}%"))
        .filter(Character.base_id != current_character.base_id)
        .all()
    )

    return format_character_data(unmatched_characters)


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
