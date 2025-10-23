// src/components/ItemRow.jsx
export default function ItemRow({
  it,
  editingId,
  draft,
  savingId,
  confirmId,
  editRef,
  onStartEdit,
  onDraft,
  onSave,
  onCancelEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}) {
  const isEditing = editingId === it.id;
  const isSaving = savingId === it.id;
  const isConfirming = confirmId === it.id;

  return (
    <li style={{ marginBottom: 8 }}>
      {isEditing ? (
        <>
          <input
            ref={editRef}
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave(it.id);
              if (e.key === "Escape") onCancelEdit();
            }}
            style={{ marginRight: 6, padding: 6 }}
            aria-label="Edit item name"
          />
          <button
            onClick={() => onSave(it.id)}
            disabled={
              isSaving || draft.trim() === "" || draft.trim() === it.name
            }
            style={{ marginRight: 6 }}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button onClick={onCancelEdit}>Cancel</button>
        </>
      ) : (
        <>
          <span style={{ marginRight: 8 }}>{it.name}</span>
          <button onClick={() => onStartEdit(it)} style={{ marginRight: 6 }}>
            Edit
          </button>
          {isConfirming ? (
            <>
              <button
                onClick={() => onConfirmDelete(it.id)}
                style={{ marginRight: 6 }}
              >
                Confirm?
              </button>
              <button onClick={onCancelDelete}>Cancel</button>
            </>
          ) : (
            <button onClick={() => onAskDelete(it.id)}>Delete</button>
          )}
        </>
      )}
    </li>
  );
}
