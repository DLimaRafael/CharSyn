from database import db
from sqlalchemy import ForeignKey


class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, ForeignKey("character.id"), nullable=False)
    match_id = db.Column(db.Integer, ForeignKey("character.id"), nullable=False)
    votes = db.Column(db.Integer, default=0, nullable=False)
    # relationships
    character = db.relationship(
        "Character", foreign_keys=[character_id], backref="matches"
    )
    match = db.relationship("Character", foreign_keys=[match_id])

    def __repr__(self) -> str:
        return f"Match between <{self.character.name}> and <{self.match.name}>: {self.votes}"
