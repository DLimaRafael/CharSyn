from models import Archetype, BaseId, Character


def get_base_ids() -> list[dict]:
    return BaseId.query.all()


def get_archetypes() -> list[dict]:
    return Archetype.query.all()


def get_rarities() -> list[int]:
    result = Character.query.with_entities(Character.rarity).distinct().all()
    return [rarity[0] for rarity in result]
