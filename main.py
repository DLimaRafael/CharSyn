from flask import Flask, Response, render_template, request
from data import (
    create_or_update_match,
    get_character_by_id,
    get_characters_by_name,
    get_matched_characters,
    get_all_characters,
)
from models import Character
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
@app.route("/search", methods=["POST"])
def search_characters_by_name() -> list[dict]:
    data = request.get_json()
    base_id = data.get("base_id")
    character_id = data.get("character_id")
    character_name = data.get("name")
    has_match_filter = data.get("is_matching")

    if has_match_filter:
        return get_matched_characters(character_id)
    if character_id:
        return get_all_characters(character_name, character_id)

    return get_characters_by_name(character_name, base_id)


@app.route("/character/<int:character_id>", methods=["GET"])
def character_details(character_id: int) -> str:
    character = get_character_by_id(character_id)
    matches = get_matched_characters(character["id"])
    return render_template(
        "character_details.html",
        character=character,
        matches=matches,
    )


@app.route("/character", methods=["POST"])
def vote_match() -> Response:
    data = request.get_json()
    character_id: int = data.get("character_id")
    match_id: int = data.get("match_id")
    vote: int = data.get("vote")

    return create_or_update_match(character_id, match_id, vote)


if __name__ == "__main__":
    app.run(debug=True)
