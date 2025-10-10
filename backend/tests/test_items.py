import json
from models import db, Item

# --------------------- Health ---------------------
print("--------------------- Health Test ---------------------")

def test_health_ok(client):

    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.get_json() == {"status": "ok"}

    print("--------------------- Health Complete ---------------------")




# --------------------- List (pagination & search) ---------------------
print("####################--------------------- TESTS ENTRY POINT ---------------------####################")
print("--------------------- List Test ---------------------")
def test_list_defaults_and_pages_min1(client):
    r = client.get("/api/items")  # default page=1, limit=10
    
    r = client.get("/api/items")
    print("STATUS:", r.status_code, "MIME:", r.mimetype, "is_json:", r.is_json)
    try:
        print("RAW:", r.data.decode()[:300])
    except Exception:
        pass
    data = r.get_json()
    print("JSON TYPE:", type(data), "VALUE:", data)
    
    data = r.get_json()
    assert r.status_code == 200
    assert data["page"] == 1
    assert data["limit"] == 10
    assert data["total"] >= 1
    # even if empty, pages must be at least 1
    assert data["pages"] >= 1

def test_list_empty_pages_is_one(client):
   # Clear all then fetch list; pages should be 1, items empty
    with client.application.app_context():
        Item.query.delete()
        db.session.commit()
        
    r = client.get("/api/items")
    data = r.get_json()
    assert r.status_code == 200
    assert data["total"] == 0
    assert data["pages"] == 1
    assert data["items"] == []

def test_list_respects_limit_and_pagination(client):
    # First page with small limit
    r1 = client.get("/api/items?page=1&limit=5")
    d1 = r1.get_json()
    assert r1.status_code == 200
    assert d1["page"] == 1
    assert d1["limit"] == 5
    assert len(d1["items"]) == 5
    assert d1["pages"] >= 5  # 23 items / 5 ≈ 5 pages

    # Second page, different items expected (ids descending)
    r2 = client.get("/api/items?page=2&limit=5")
    d2 = r2.get_json()
    assert r2.status_code == 200
    assert d2["page"] == 2
    assert len(d2["items"]) == 5
    # Ensure non-overlap between page 1 and 2
    ids1 = {it["id"] for it in d1["items"]}
    ids2 = {it["id"] for it in d2["items"]}
    assert ids1.isdisjoint(ids2)

def test_search_filter_case_insensitive(client):
    r = client.get("/api/items?q=alp")
    data = r.get_json()
    assert r.status_code == 200
    names = [it["name"].lower() for it in data["items"]]
    assert any("alpha" in n for n in names)
print("--------------------- List Test ---------------------")

# --------------------- Create ---------------------
print("--------------------- Create Test ---------------------")

def test_create_valid(client, json_headers):
    payload = {"name": "New Thing"}
    r = client.post("/api/items", data=json.dumps(payload), headers=json_headers)
    assert r.status_code == 201
    body = r.get_json()
    assert body["name"] == "New Thing"
    assert isinstance(body["id"], int)

def test_create_rejects_empty(client, json_headers):
    r = client.post("/api/items", data=json.dumps({"name": "   "}), headers=json_headers)
    assert r.status_code == 400
    assert r.get_json()["error"] == "name is required"

def test_create_rejects_too_long(client, json_headers):
    long_name = "x" * 121
    r = client.post("/api/items", data=json.dumps({"name": long_name}), headers=json_headers)
    assert r.status_code == 400
    assert "≤ 120" in r.get_json()["error"]

def test_create_rejects_duplicate(client, json_headers):
    # "Alpha" exists from seed
    r = client.post("/api/items", data=json.dumps({"name": "Alpha"}), headers=json_headers)
    assert r.status_code == 409
    assert r.get_json()["error"] == "name already exists"

print("--------------------- Create Complete ---------------------")

# --------------------- Update ---------------------
print("--------------------- Update Test ---------------------")
def test_update_happy_path(client, json_headers):
    # Create then update
    r1 = client.post("/api/items", data=json.dumps({"name": "Temp"}), headers=json_headers)
    item_id = r1.get_json()["id"]
    r2 = client.put(f"/api/items/{item_id}", data=json.dumps({"name": "Temp Updated"}), headers=json_headers)
    assert r2.status_code == 200
    assert r2.get_json()["name"] == "Temp Updated"

def test_update_not_found(client, json_headers):
    r = client.put("/api/items/999999", data=json.dumps({"name": "Whatever"}), headers=json_headers)
    assert r.status_code == 404
    assert r.get_json()["error"] == "not found"

def test_update_duplicate_conflict(client, json_headers):
    # Try to rename an item to "Alpha" (already exists)
    # First create a distinct item
    r1 = client.post("/api/items", data=json.dumps({"name": "UniqueName"}), headers=json_headers)
    item_id = r1.get_json()["id"]
    r2 = client.put(f"/api/items/{item_id}", data=json.dumps({"name": "Alpha"}), headers=json_headers)
    assert r2.status_code == 409
    assert r2.get_json()["error"] == "name already exists"

def test_update_rejects_empty_name(client, json_headers):
    # Create then attempt empty update
    r1 = client.post("/api/items", data=json.dumps({"name": "ToEdit"}), headers=json_headers)
    item_id = r1.get_json()["id"]
    r2 = client.put(f"/api/items/{item_id}", data=json.dumps({"name": "   "}), headers=json_headers)
    assert r2.status_code == 400
    assert r2.get_json()["error"] == "name is required"
print("--------------------- Update Complete ---------------------")

# --------------------- Delete ---------------------
print("--------------------- Delete Test ---------------------")

def test_delete_204_and_then_404(client):
    # Create, delete, ensure 204, then second delete is 404
    r1 = client.post("/api/items", json={"name": "ToDelete"})
    item_id = r1.get_json()["id"]

    r2 = client.delete(f"/api/items/{item_id}")
    assert r2.status_code == 204
    assert r2.data == b""  # No Content

    r3 = client.delete(f"/api/items/{item_id}")
    assert r3.status_code == 404
    assert r3.get_json()["error"] == "not found"
print("--------------------- Delete Complete ---------------------")
print("####################--------------------- END OF TESTS ---------------------####################")
