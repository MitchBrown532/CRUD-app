// src/hooks/useItemsData.js
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";

export function useItemsData({ query, sort, order, page, limit = 10 }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(
    async (q = query, p = page, l = limit, s = sort, o = order) => {
      setLoading(true);
      setErr("");
      try {
        const qs =
          `?q=${encodeURIComponent(q || "")}` +
          `&page=${p}&limit=${l}` +
          `&sort=${encodeURIComponent(s)}` +
          `&order=${encodeURIComponent(o)}`;
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
    },
    [query, page, limit, sort, order]
  );

  // initial & reactive fetch
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!cancel) await load();
    })();
    return () => {
      cancel = true;
    };
  }, [load]);

  const reload = () => load();

  return { items, setItems, meta, setMeta, loading, err, setErr, reload };
}
