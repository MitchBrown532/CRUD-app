import { useEffect, useState } from "react";

export default function Items() {
  const API = import.meta.env.VITE_API_URL;

  // For API results, loading state, and any errors
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // For editing entries
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  // Search state + debounce
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Set debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300); // debounce 300ms
    return () => clearTimeout(t);
  }, [query]);

  // Fetch item list (On load & search)
  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");

      try {
        const url = `${API}/api/items${
          debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ""
        }`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setItems(await res.json());
      } catch (e) {
        setErr(String(e));
      } finally {
        setLoading(false); // stop loading
      }
    }
    load();
  }, [API, debouncedQuery]);

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

  // If no error - show list. If empty, display message.
  return (
    <div style={{ padding: 16 }}>
      <h1>Items</h1>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search items…"
        style={{ padding: 8, margin: "12px 0", width: "100%", maxWidth: 420 }}
      />

      {/* Status messages inline */}
      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
      {loading && <p style={{ opacity: 0.7 }}>Searching…</p>}

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
