import { useEffect, useState } from "react";

export default function Items() {
  // Store API results, loading state, and any errors
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Fetch item list
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items`);
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

  // UI control depending on state
  if (loading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (err) return <p style={{ padding: 16, color: "crimson" }}>Error: {err}</p>;

  // If no error - show list. If empty, display message.
  return (
    <div style={{ padding: 16 }}>
      <h1>Items</h1>
      {items.length === 0 ? (
        <p>No items yet</p>
      ) : (
        <ul>
          {items.map((it) => (
            <li key={it.id}>{it.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
