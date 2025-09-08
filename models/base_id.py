from database import db


class BaseId(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(40), nullable=False)

    def __repr__(self):
        return f"Base Character <{self.name}>"
