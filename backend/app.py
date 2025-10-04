from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})

# Temporary in-memory store
ITEMS = []
NEXT_ID = 1

# Health check
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

# Get items
@app.get("/api/items")
def list_items():
    return jsonify(ITEMS)

# Create item
@app.post("/api/items")
def create_item():
    global NEXT_ID
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    item = {"id": NEXT_ID, "name": name}
    NEXT_ID += 1
    ITEMS.append(item)
    return jsonify(item), 201

# Update item
@app.put("/api/items/<int:item_id>")
def update_item(item_id):
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400

    # Find item and update its name
    for it in ITEMS:
        if it["id"] == item_id:
            it["name"] = name
            return jsonify(it)
    return jsonify({"error": "not found"}), 404

# Delete item
@app.delete("/api/items/<int:item_id>")
def delete_item(item_id):
    # Filter out the target id
    global ITEMS
    before = len(ITEMS)
    ITEMS = [it for it in ITEMS if it["id"] != item_id]
    if len(ITEMS) == before:
        return jsonify({"error": "not found"}), 404
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(debug=True, port=5001)
