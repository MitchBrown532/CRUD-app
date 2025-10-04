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

# Fetch Items
@app.get("/api/items")
def list_items():
    return jsonify(ITEMS)

# Create Items
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

if __name__ == "__main__":
    app.run(debug=True, port=5001)
