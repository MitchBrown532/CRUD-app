from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Item


# Create the app
def create_app():
    """
    Using Factory pattern (instead of a global object). It is the industry standard for a reason:
        1. Easier Testing:
            Very easy to create temporary apps for testing, thus avoiding pollution
        2. Flexible Config. 
            Can easily add parameters (e.g. config name == "dev") to give more control.
        3. Scalability.
            As code grows we will likely seperate it into Blueprints. Factory-style makes this transition smooth and easily scalable.
    """
    app = Flask(__name__)

    # Enable CORS for React Frontend
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})

    # Configure DB (creates app.db in backend folder)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db" # URI not URL - Uniform Resource Identifier (URI) is standard for DB connection strings, URLs are a type of URI specifically used for location (e.g. web address)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    # ---------------------- ROUTES ---------------------- #
    # Health check
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # Get items
    @app.get("/api/items")
    def list_items():
        """
            Return a list of all items in the database.
            Optional query param ?q=term filters results by name.
        """
        # Get optional search term from query string (e.g. /api/items?q=test)
        q = request.args.get("q", "", type=str).strip()
        
        # Start base query for all Item records
        query = Item.query

        # If a search term exists, filter by name (case-insensitive)
        if q:
            query = query.filter(Item.name.ilike(f"%{q}%"))
        
         # Fetch results ordered by newest first
        items = [it.to_dict() for it in query.order_by(Item.id.desc()).all()]
        
        return jsonify(items)

    # Create item
    @app.post("/api/items")
    def create_item():
        """
            Create a new item.
            Requires JSON body: { "name": "example" }
        """
        data = request.get_json() or {}
        name = data.get("name", "").strip()

        # Handle empty input
        if not name:
            return jsonify({"error": "name is required"}), 400
        
        # Enforce uniqueness
        if Item.query.filter_by(name=name).first():
            return jsonify({"error": "name already exists"}), 409
        
        # If no issues -> Create & save
        it = Item(name=name)
        db.session.add(it)
        db.session.commit()

        return jsonify(it.to_dict()), 201

    # Update item
    @app.put("/api/items/<int:item_id>")
    def update_item(item_id):
        """
            Update an existing item's name by ID.
            Requires JSON body: { "name": "new name" }
        """
        data = request.get_json() or {}
        name = (data.get("name") or "").strip()

        # Handle empty input
        if not name:
            return jsonify({"error": "name is required"}), 400

        it = Item.query.get(item_id)

        # Handle not found
        if not it:
            return jsonify({"error": "not found"}), 404

        # Prevent duplicates
        if name != it.name and Item.query.filter_by(name=name).first():
            return jsonify({"error": "name already exists"}), 409

        # If no issues -> update & save
        it.name = name
        db.session.commit()

        return jsonify(it.to_dict())

    # Delete item
    @app.delete("/api/items/<int:item_id>")
    def delete_item(item_id):
        """
        Delete an item by ID.
        No Requirements    
        """
        it = Item.query.get(item_id)
        if not it:
            return jsonify({"error": "not found"}), 404
        
        # If found -> Delete & save
        db.session.delete(it)
        db.session.commit()

        return jsonify({"ok": True})
    
    return app

# ---------------------- ENTRY POINT ---------------------- #
if __name__ == "__main__":
    app = create_app()

    # Create db tables automatically if they don't exist
    with app.app_context():
        db.create_all()

    # Start development server
    app.run(debug=True, port=5001)