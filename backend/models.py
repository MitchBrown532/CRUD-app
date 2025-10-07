from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Create a single SQLAlchemy instance to use across the app.
# The `db` object will be initialized by the Flask app later.
db = SQLAlchemy()

class Item(db.Model):
    __tablename__ = "items" # explicit table name (optional but good practice)

    # Fields
    id = db.Column(db.Integer, primary_key=True) # Unique ID
    name = db.Column(db.String(120), nullable = False, unique = True) # Name (required)
    created_at = db.Column(db.DateTime, nullable = False, default=datetime.utcnow) # Creation Date (required)

    # Function to convert into a dictionary
    # Why?
        # 1: Makes it serializable. (example: Jsonify() doesn't work on SQLAlchemy model objects)
        # 2: Gives control over which fields to show the API
        # 3: Industry standard. Each model will likely need it's own to_dict() or similar method regardless of chosen framework
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat()
        }
