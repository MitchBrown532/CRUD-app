from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Item
from math import ceil
from sqlalchemy import func
from typing import Optional

# Create the app
def create_app(test_config: Optional[dict] = None):
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

    # CORS: allow React dev server only
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})

    # Configure DB (creates app.db in backend folder)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db" # URI not URL - Uniform Resource Identifier (URI) is standard for DB connection strings, URLs are a type of URI specifically used for location (e.g. web address)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Apply testing configs BEFORE init (if necessary)
    if test_config:
        app.config.update(test_config)

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
        List items with pagination and optional filtering by name.
        Query params:
            q:     filter (default "")
            page:  page number (>= 1, default 1)
            limit: page size (1<= limit <= 50, default 10)
        Response:
            { items, page, pages, total, limit }
        """
        # Init Responses
        q = (request.args.get("q") or "").strip()
        page = max(request.args.get("page", 1, type=int), 1)
        limit = request.args.get("limit", 10, type=int)
        limit = min(max(limit, 1), 50)
            
        # Start base query for all Item records
        query = Item.query

        # If a search term exists, filter by name (case-insensitive)
        if q:
            query = query.filter(Item.name.ilike(f"%{q}%"))
        
        # Fetch results
        total = query.count()
        items = (
            query.order_by(Item.id.desc()) # newest first
            .offset((page - 1) * limit) # ignore items from previous pages
            .limit(limit) # set limit for page
            .all()
        )
        pages = max(ceil(total / limit), 1)

        return jsonify({
        "items": [it.to_dict() for it in items],
        "page": page,
        "pages": pages,
        "total": total,
        "limit": limit,
    })

    # Create item
    @app.post("/api/items")
    def create_item():
        """
        Create an item.

        Body:
            { name: <string> }   # required, <= 120 chars

        Response (201 Created):
            { id, name, created_at }

        Errors:
            400: name missing or too long
            409: duplicate name (case insensitive)
    """
        data = request.get_json() or {}
        name = data.get("name", "").strip()

        # --- Error Checks ---
            # Input Empty
        if not name:
            return jsonify({"error": "name is required"}), 400
        
            # Input too long
        if len(name) > 120:
            return jsonify({"error": "name must be ≤ 120 chars"}), 400
        
            # Input not unique (case insensitive)
        if Item.query.filter(func.lower(Item.name) == name.lower()).first():
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
        Update item name by ID.
        Body: { "name": <string> }
        Errors:
          400: name missing
          404: not found
          409: duplicate name (case insensitive)
        """
        data = request.get_json() or {}
        name = (data.get("name") or "").strip()

        # --- Error Checks
            # Empty Input
        if not name:
            return jsonify({"error": "name is required"}), 400
        
        it = Item.query.get(item_id) # if !empty, fetch item by ID

            # Input not found
        if not it:
            return jsonify({"error": "not found"}), 404

            # Input not unique (case-insensitive)
        if (
            name.lower() != it.name.lower() and
            Item.query.filter(func.lower(Item.name) == name.lower()).first()
        ):
            return jsonify({"error": "name already exists"}), 409

        # If no issues -> update & save
        it.name = name
        db.session.commit()
        return jsonify(it.to_dict())

    # Delete item
    @app.delete("/api/items/<int:item_id>")
    def delete_item(item_id):
        """
        Delete by ID.
        Errors:
          404: not found
        Success:
          204 No Content
        """
        it = Item.query.get(item_id)
        if not it:
            return jsonify({"error": "not found"}), 404
        
        # If found -> Delete & save
        db.session.delete(it)
        db.session.commit()

        # return jsonify({"ok": True}) - inferior return (not "REST-y")
        # This version better because:
            # 204 means “The request succeeded, but there’s nothing to return.”, 200 means “The request succeeded, and here’s a response body.”
            # Delete doesn't need to return data, just success report
            # 204 is "REST-y" (official HTTP semantics for successful DELETE)
        return ("", 204) 
    return app

# ---------------------- ENTRY POINT ---------------------- #
if __name__ == "__main__":
    app = create_app()

    # Create db tables automatically if they don't exist
    with app.app_context():
        db.create_all()

    # Start development server
    app.run(debug=True, port=5001)