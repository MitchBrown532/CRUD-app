import { useEffect, useState, useRef } from "react";
import { api } from "../api";

export default function Items() {
  // ------------- States -------------
  // API results, loading state, and errors
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Add
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit
  // Ref allows for using enter + esc
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [savingId, setSavingId] = useState(null);
  const editRef = useRef(null);

  // Search
  // Debounce allows for delay before re-rendering (rather than immediately after each keystroke)
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Delete + Confirm
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ------------- Effects -------------
  // Fetch items for load & search
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const qs = debouncedQuery
          ? `?q=${encodeURIComponent(debouncedQuery)}`
          : "";
        const data = await api(`/api/items${qs}`);
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to load items");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Focus input for editing
  // Ref allows to enter & esc to be used
  useEffect(() => {
    if (editingId !== null) editRef.current?.focus();
  }, [editingId]);

  // ------------- Methods -------------
  // --- Add ---
  async function onAdd(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setErr("");
    try {
      const created = await api("/api/items", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    } catch (e) {
      setErr(e.message);
    } finally {
      setAdding(false);
    }
  }

  // --- Edit ---
  function startEdit(it) {
    setEditingId(it.id);
    setDraft(it.name);
    setConfirmId(null);
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }
  async function saveEdit(it) {
    const name = draft.trim();
    const original = items.find((x) => x.id === id)?.name ?? "";
    if (!name || name === original) return;
    setSavingId(id);
    setErr("");
    try {
      const updated = await api(`/api/items/${id}`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      cancelEdit();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSavingId(false);
    }
  }

  // --- Edit ---
  function askDelete(id) {
    setConfirmId(id);
    setEditingId(null);
  }
  function cancelDelete() {
    setConfirmId(null);
  }
  async function doDelete(id) {
    setDeletingId(id);
    setErr("");
    try {
      await api(`/api/items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== id));
      setConfirmId(null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  // If no error - show list. If empty, display message.
  return (
    <div style={{ padding: 16 }}>
      <h1>Items</h1>

      {/* centralized error banner */}
      {err && (
        <div
          style={{
            margin: "8px 0 16px",
            padding: 8,
            border: "1px solid #f3c2c2",
            background: "#fff4f4",
            color: "#a40000",
          }}
        >
          {err}
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items…"
          style={{ padding: 8, width: 260, marginRight: 8 }}
          aria-label="Search items"
        />
        {loading && <span>Searching…</span>}
      </div>

      {/* Add */}
      <form onSubmit={onAdd} style={{ marginBottom: 16 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New item name"
          style={{ padding: 8, width: 260, marginRight: 8 }}
          aria-label="New item name"
        />
        <button disabled={adding || newName.trim() === ""}>
          {adding ? "Adding…" : "Add Item"}
        </button>
      </form>

      {/* Empty states */}
      {!loading && items.length === 0 && (
        <div style={{ color: "#555", marginTop: 8 }}>
          {debouncedQuery ? (
            <>
              No results for “<em>{debouncedQuery}</em>”.
            </>
          ) : (
            <>No items yet. Add your first item above.</>
          )}
        </div>
      )}

      {/* If not empty - list. Each item has edit & delete in line */}
      <ul style={{ marginTop: 8 }}>
        {items.map((it) => (
          <li key={it.id} style={{ marginBottom: 8 }}>
            {editingId === it.id ? (
              <>
                <input
                  ref={editRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(it.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  style={{ marginRight: 6, padding: 6 }}
                  aria-label="Edit item name"
                />
                <button
                  onClick={() => saveEdit(it.id)}
                  disabled={
                    savingId === it.id ||
                    draft.trim() === "" ||
                    draft.trim() === it.name
                  }
                  style={{ marginRight: 6 }}
                >
                  {savingId === it.id ? "Saving…" : "Save"}
                </button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ marginRight: 8 }}>{it.name}</span>

                <button
                  onClick={() => startEdit(it)}
                  style={{ marginRight: 6 }}
                >
                  Edit
                </button>

                {confirmId === it.id ? (
                  <>
                    <button
                      onClick={() => doDelete(it.id)}
                      disabled={deletingId === it.id}
                      style={{ marginRight: 6 }}
                    >
                      {deletingId === it.id ? "Deleting…" : "Confirm?"}
                    </button>
                    <button onClick={cancelDelete}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => askDelete(it.id)}>Delete</button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* tiny debounce hook */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
