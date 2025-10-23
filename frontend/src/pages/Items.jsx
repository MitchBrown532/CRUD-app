import { useEffect, useState, useRef } from "react";
import { api } from "../api";

export default function Items() {
  // ------------- States -------------
  // Items (API results), Items' meta, loading state, and errors
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Add
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const addInputRef = useRef(null); // auto-focus input when add starts

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [savingId, setSavingId] = useState(null);
  const editRef = useRef(null); // auto-focus input when edit starts

  // Search
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300); // delay before re-rendering (rather than immediately after each keystroke)

  // Sorting
  const [sort, setSort] = useState("id"); // id | name | created_at
  const [order, setOrder] = useState("desc"); // asc | desc

  // Delete + Confirm
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ------------- Effects -------------
  // Fetch List
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await loadItems(debouncedQuery);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, meta.page, sort, order]);

  // Focus input for editing
  // Ref allows to enter & esc to be used
  useEffect(() => {
    if (editingId !== null) editRef.current?.focus();
  }, [editingId]);

  // ------------- Methods -------------
  // --- Fetch ---
  async function loadItems(q, page = meta.page, limit = meta.limit) {
    setLoading(true);
    setErr("");
    try {
      const qs =
        `?q=${encodeURIComponent(q || "")}` +
        `&page=${page}&limit=${limit}` +
        `&sort=${encodeURIComponent(sort)}` +
        `&order=${encodeURIComponent(order)}`;

      const data = await api(`/api/items${qs}`);
      setItems(data.items);
      setMeta({
        page: data.page,
        pages: data.pages,
        total: data.total,
        limit: data.limit,
      });
    } catch (e) {
      setErr(e.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  // --- Add ---
  async function onAdd(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setErr("");
    try {
      await api("/api/items", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setNewName(""); // clear field
      addInputRef.current?.focus(); // refocus for fast entry
      await loadItems(); // reload list after update
    } catch (e) {
      setErr(e.message || "Failed to add item");
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
  async function saveEdit(id) {
    const name = draft.trim();
    const original = items.find((x) => x.id === id)?.name ?? "";
    if (!name || name === original) return;
    setSavingId(id);
    setErr("");
    try {
      const updated = await api(`/api/items/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      cancelEdit();
    } catch (e) {
      setErr(e.message || "Failed to update item");
    } finally {
      setSavingId(false);
    }
  }

  // --- Delete ---
  function askDelete(id) {
    setConfirmId(id);
    setEditingId(null);
  }
  function cancelDelete() {
    setConfirmId(null);
  }
  async function doDelete(id) {
    if (deletingId) return; // prevent double clicks
    setDeletingId(id);
    setErr("");
    setConfirmId(null); // close confirm immediately for snappy feel

    // --- Optimistic Update ---
    // Snapshot for rollback
    const prevItems = items;
    const prevMeta = meta;

    // Store new values (compute only once + reusability/readability)
    // Updating before API results
    setItems((prev) => prev.filter((x) => x.id !== id));
    setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));

    try {
      await api(`/api/items/${id}`, { method: "DELETE" }); // api() throws on error (no need for if(!res = ok))
      // If no items in list, fetch next page.
      if (items.length === 1) {
        await loadItems();
      }
    } catch (e) {
      setErr(e.message || "Failed to delete item");
      setItems(prevItems); // rollback if failed
      setMeta(prevMeta);
      setConfirmId(id); // re-enable confirm if failed
    } finally {
      setDeletingId(null);
    }
  }
  // --- Navigation ---
  async function goPrev() {
    console.log("Prev test 1: ", meta.page);

    if (meta.page <= 1) return;
    await loadItems(query || "", meta.page - 1, meta.limit);
    console.log("prev test 2: ", meta.page);
  }

  async function goNext() {
    console.log("next test 1: ", meta.page);

    if (meta.page >= meta.pages) return;
    await loadItems(query || "", meta.page + 1, meta.limit);
    console.log("next test 2: ", meta.page);
  }

  // If no error - show list. If empty, display message.
  return (
    <div style={{ padding: 16 }}>
      <h1>Items</h1>

      {/* Error banner */}
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

      {/* Sorting */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>
          Sort:&nbsp;
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ marginRight: 8 }}
          >
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="created_at">Created</option>
          </select>
        </label>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

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
          ref={addInputRef}
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

      {/* Next/Prev + pagination info */}
      <p style={{ opacity: 0.7, marginTop: 4 }}>
        Showing {items.length} of {meta.total} (Page {meta.page} / {meta.pages})
      </p>
      <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
        <button onClick={() => goPrev()} disabled={meta.page <= 1}>
          Prev
        </button>
        <button onClick={() => goNext()} disabled={meta.page >= meta.pages}>
          Next
        </button>
      </div>
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
