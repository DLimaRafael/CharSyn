from database import db
from sqlalchemy import ForeignKey


class Character(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    base_id = db.Column(db.Integer, ForeignKey("base_id.id"), nullable=False)
    base = db.relationship("BaseId", backref="characters")
    name = db.Column(db.String(40), nullable=False)
    archetype_id = db.Column(db.Integer, ForeignKey("archetype.id"), nullable=False)
    archetype = db.relationship("Archetype")
    rarity = db.Column(db.Integer)

    def __repr__(self):
        return f"Character [{self.base.name}] {self.name}"
