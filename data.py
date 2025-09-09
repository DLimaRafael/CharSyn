from sqlalchemy import or_

from models import BaseId, Character, Match


def format_character_data(data: list) -> list[dict]:
    return [
        {
            "id": character.id,
            "name": character.name,
            "base_id": character.base.id,
            "base_name": character.base.name,
            "rarity": character.rarity,
            "archetype": character.archetype.name,
        }
        for character in data
    ]


def get_unmatched_characters(
    character_id: int, character_list: list[dict]
) -> list[dict]:
    matches = Match.query.filter_by(character_id=character_id).all()
    match_ids = {match["match_id"] for match in matches}
    filtered = [
        character for character in character_list if character["id"] not in match_ids
    ]

    return filtered


def get_characters_by_name(name: str) -> list[dict]:
    characters = (
        Character.query.join(BaseId)
        .filter(or_(Character.name.ilike(f"%{name}%"), BaseId.name.ilike(f"%{name}%")))
        .all()
    )
    return format_character_data(characters)
