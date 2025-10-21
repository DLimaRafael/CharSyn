from flask import Flask, Response, render_template, request

from character_data import (
    get_all_characters,
    get_character_by_id,
    get_character_filters,
    get_characters_by_name,
    get_matched_characters,
)
from database import db
from filter_data import get_rarities
from match_data import create_or_update_match

# new import for stats
from stats_data import (
    get_archetype_counts,
    get_rarity_counts,
    get_top_pairs,
    get_bottom_pairs,
)

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)


with app.app_context():
    db.create_all()


@app.route("/")
def index() -> str:
    """
    Home / Dashboard page
    aggregates counts and top/bottom pairs and renders a dashboard template
    """
    # collect stats
    archetype_counts = get_archetype_counts()
    rarity_counts = get_rarity_counts()
    top_pairs = get_top_pairs(limit=10)
    bottom_pairs = get_bottom_pairs(limit=10)

    return render_template(
        "home.html",
        archetype_counts=archetype_counts,
        rarity_counts=rarity_counts,
        top_pairs=top_pairs,
        bottom_pairs=bottom_pairs,
    )


@app.route("/all-characters")
def all_characters() -> str:
    """
    Characters page
    Returns all Characters from Database
    """
    characters = get_characters_by_name("")
    return render_template(
        "all_characters.html",
        characters=characters,
        rarities=get_rarities(),
        filters=get_character_filters(),
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
    app.run(host="0.0.0.0", debug=True)
