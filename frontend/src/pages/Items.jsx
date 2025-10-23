import { useRef, useState } from "react";
import { useListParams } from "../hooks/useListParams";
import { useDebounce } from "../hooks/useDebounce";
import { useItemsData } from "../hooks/useItemsData";
import ItemRow from "../components/ItemRow";
import { api } from "../api";

export default function Items() {
  // ------------- Hooks -------------

  // List params (for pushing to URL to have persistent search/sort)
  const { query, setQuery, page, setPage, sort, setSort, order, setOrder } =
    useListParams();
  const debouncedQuery = useDebounce(query, 300);

  // Item Data (fetch + meta + errors)
  const { items, setItems, meta, setMeta, loading, err, setErr, reload } =
    useItemsData({
      query: debouncedQuery,
      sort,
      order,
      page,
    });

  // ------------- States -------------

  // Add
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const addInputRef = useRef(null); // auto-focus input when add starts

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [savingId, setSavingId] = useState(null);
  const editRef = useRef(null); // auto-focus input when edit starts

  // Delete + Confirm
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ------------- Methods -------------
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
      await reload(); // reload list after update
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
    setTimeout(() => editRef.current?.focus(), 0);
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
      // If empty & not page 1 - move back a page
      if (prevItems.length === 1 && page > 1) {
        setPage(page - 1); // triggers fetch via hook
        // If empty & page 1 - refresh
      } else if (prevItems.length === 1) {
        await reload();
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

  // --- Pagination ---
  async function goPrev() {
    if (page <= 1) return;
    setPage((p) => p - 1);
  }
  async function goNext() {
    if (page >= meta.pages) return;
    setPage((p) => p + 1);
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
            onChange={(e) => {
              setSort(e.target.value);
            }}
            style={{ marginRight: 8 }}
          >
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="created_at">Created</option>
          </select>
        </label>
        <select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
          }}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
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

      {/* List */}
      <ul style={{ marginTop: 8 }}>
        {items.map((it) => (
          <ItemRow
            key={it.id}
            it={it}
            editingId={editingId}
            draft={draft}
            savingId={savingId}
            confirmId={confirmId}
            editRef={editRef}
            onStartEdit={startEdit}
            onDraft={setDraft}
            onSave={saveEdit}
            onCancelEdit={cancelEdit}
            onAskDelete={askDelete}
            onConfirmDelete={doDelete}
            onCancelDelete={cancelDelete}
          />
        ))}
      </ul>

      {/* Pagination */}
      <div>
        <p style={{ opacity: 0.7, marginTop: 4 }}>
          Showing {items.length} of {meta.total} (Page {page} / {meta.pages})
        </p>
        <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
          <button onClick={() => goPrev()} disabled={page <= 1}>
            Prev
          </button>
          <button onClick={() => goNext()} disabled={page >= meta.pages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
