import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddItem() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // Called upon form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    try {
      // Post new item
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      // Error Handling
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // Clear input & navigate to items (will adjust when refactoring this into a component)
      setName("");
      navigate("/items");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1> Add Item</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item Name"
          required
          style={{ padding: 8, marginRight: 8 }}
        />
        <button disabled={saving}>{saving ? "Saving..." : "Add"}</button>
      </form>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
}
