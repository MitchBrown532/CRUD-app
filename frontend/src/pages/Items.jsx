import { useEffect, useState } from "react";

export default function Items() {
  const API = import.meta.env.VITE_API_URL;

  // Store API results, loading state, and any errors
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Local edit state per id (id -> draft name)
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  // Fetch item list
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/items`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`); // error catch
        setItems(await res.json()); // store item list
      } catch (e) {
        setErr(String(e));
      } finally {
        setLoading(false); // stop loading
      }
    }
    load();
  }, []); // fetch only once (upon page load)

  // Start edit: store id + prefill draft name
  function startEdit(it) {
    setEditingId(it.id);
    setDraft(it.name);
  }

  // Cancel edit: clear editing state
  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }

  // Save edit: use PUT, then update local state
  async function saveEdit(id) {
    try {
      const res = await fetch(`${API}/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const updated = await res.json();
      // Replace the edited item in local array
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      cancelEdit();
    } catch (e) {
      alert(`Update failed: ${e.message}`);
    }
  }

  // Delete item: Remove from local state
  async function remove(id) {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`${API}/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  // UI control depending on state
  if (loading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (err) return <p style={{ padding: 16, color: "crimson" }}>Error: {err}</p>;

  // If no error - show list. If empty, display message.
  return (
    <div style={{ padding: 16 }}>
      <h1>Items</h1>

      {/* Empty state */}
      {items.length === 0 && <p>No items yet.</p>}

      {/* List with edit/delete options inline */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((it) => (
          <li key={it.id} style={{ marginBottom: 10 }}>
            {editingId === it.id ? (
              // Edit mode: show input + save/cancel
              <>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  style={{ padding: 6, marginRight: 8 }}
                />
                <button
                  onClick={() => saveEdit(it.id)}
                  style={{ marginRight: 6 }}
                >
                  Save
                </button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              // Read mode: show name + edit/delete actions
              <>
                <span style={{ marginRight: 12 }}>{it.name}</span>
                <button
                  onClick={() => startEdit(it)}
                  style={{ marginRight: 6 }}
                >
                  Edit
                </button>
                <button onClick={() => remove(it.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
