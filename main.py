from http import HTTPStatus
from flask import Flask, Response, jsonify, render_template, request
from sqlalchemy import or_
from data import get_characters_by_name, get_unmatched_characters
from models import Character, Match
from database import db

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)


with app.app_context():
    db.create_all()


@app.route("/")
def index() -> str:
    characters = Character.query.all()
    return render_template(
        "index.html",
        characters=characters,
    )


# CHARACTER INFORMATION


def get_matches(character_id: int) -> list[dict]:
    matches = Match.query.filter(
        or_(Match.character_id == character_id, Match.match_id == character_id)
    ).all()
    return [
        {
            "id": match.id,
            "character": match.character,
            "match": match.match,
            "votes": match.votes,
        }
        for match in matches
    ]


def get_best_matches(matches: list[dict]) -> list[dict]:
    return sorted(matches, key=lambda match: match["votes"], reverse=True)


def is_match_duplicate(character_id: int, match_id: int) -> bool:
    return (
        Match.query.filter_by(character_id=character_id, match_id=match_id).first()
        is not None
    )


def is_match_valid(character_id: int, match_id: int) -> bool:
    base_character = Character.query.get_or_404(character_id).base_id
    match_character = Character.query.get_or_404(match_id).base_id

    return base_character == match_character


@app.route("/search", methods=["POST"])
def search_characters_by_name() -> list[dict]:
    data = request.get_json()
    character_id = data.get("character_id")
    character_name = data.get("name")

    if character_id:
        return get_unmatched_characters(character_name, character_id)

    base_id = data.get("base_id")
    return get_characters_by_name(character_name, base_id)


@app.route("/character/<int:character_id>", methods=["GET"])
def character_details(character_id: int) -> str:
    character = Character.query.get_or_404(character_id)
    matches = get_matches(character.id)
    top_matches = get_best_matches(matches)
    return render_template(
        "character_details.html",
        character=character,
        matches=matches,
        top_matches=top_matches,
    )


@app.route("/character/<int:character_id>", methods=["POST"])
def add_match(character_id: int, match_id: int) -> Response:
    if is_match_duplicate(character_id, match_id):
        return jsonify(
            {"message": "Match already exists, you can vote on it instead."},
            HTTPStatus.BAD_REQUEST,
        )

    if not is_match_valid(character_id, match_id):
        return jsonify(
            {"message": "You can't match characters with themselves!"},
            HTTPStatus.BAD_REQUEST,
        )

    new_match = Match(character_id=character_id, match_id=match_id)
    db.session.add(new_match)
    db.session.commit()

    return jsonify(
        {"message": "Match added successfully!", "match_id": new_match.id},
        HTTPStatus.ACCEPTED,
    )


@app.route("/character/<int:character_id>/<int:match_id>", methods=["PATCH"])
def vote_match(match_id: int, vote_num: int) -> Response:
    match = Match.query.get_or_404(match_id)

    match.votes += vote_num
    db.session.add(match)
    db.session.commit()

    return jsonify({"message": "Vote registered!"}, HTTPStatus.ACCEPTED)


if __name__ == "__main__":
    app.run(debug=True)
