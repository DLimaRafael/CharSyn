from http import HTTPStatus
from flask import Response, jsonify
from sqlalchemy import or_

from models import BaseId, Character, Match
from database import db


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


def calculate_votes(matches: list, character_id: int) -> dict:
    votes: dict = {}

    for match in matches:
        index = (
            match.match_id if match.character_id == character_id else match.character_id
        )
        votes[index] = match.votes
    return votes


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


# Match Functions
def get_matches(character_id: int) -> list[dict]:
    matches = Match.query.filter(
        or_(Match.character_id == character_id, Match.match_id == character_id)
    ).all()
    return [
        {
            "id": match.id,
            "character": (
                match.character if match.character.id == character_id else match.match
            ),
            "match": (
                match.match if match.character.id == character_id else match.character
            ),
            "votes": match.votes,
        }
        for match in matches
    ]


def get_best_matches(matches: list[dict]) -> list[dict]:
    return sorted(matches, key=lambda match: match["votes"], reverse=True)


def is_match_existent(character_id: int, match_id: int) -> Match | None:
    return Match.query.filter(
        or_(
            (Match.character_id == character_id) & (Match.match_id == match_id),
            (Match.character_id == match_id) & (Match.match_id == character_id),
        )
    ).first()


def is_match_valid(character_id: int, match_id: int) -> bool:
    base_character = Character.query.get_or_404(character_id).base_id
    match_character = Character.query.get_or_404(match_id).base_id

    return base_character != match_character


def add_vote(match_id: int, vote: int) -> Response:
    match = Match.query.get_or_404(match_id)

    match.votes += vote
    db.session.commit()
    return jsonify({"message": "Vote added successfully.", "status": HTTPStatus.OK})


def add_match(character_id: int, match_id: int) -> Response:
    if not is_match_valid(character_id, match_id):
        return jsonify(
            {"message": "You can't match characters with themselves!"},
            HTTPStatus.BAD_REQUEST,
        )

    new_match = Match(character_id=character_id, match_id=match_id, votes=1)
    db.session.add(new_match)
    db.session.commit()

    return jsonify(
        {"message": "Match added successfully!", "match_id": new_match.id},
        HTTPStatus.CREATED,
    )


def create_or_update_match(character_id: int, match_id: int, vote: int) -> Response:
    match = is_match_existent(character_id, match_id)
    if not match:
        return add_match(character_id, match_id)

    return add_vote(match.id, vote)
