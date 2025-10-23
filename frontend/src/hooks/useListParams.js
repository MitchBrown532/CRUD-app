// src/hooks/useSearchSortPage.js
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export function useListParams() {
  const [sp, setSp] = useSearchParams();

  const [query, setQuery] = useState(sp.get("q") || "");
  const [page, setPage] = useState(Number(sp.get("page") || 1));
  const [sort, setSort] = useState(sp.get("sort") || "id"); // id | name | created_at
  const [order, setOrder] = useState(sp.get("order") || "desc"); // asc | desc

  // push state -> URL (refresh/share-safe)
  useEffect(() => {
    const p = new URLSearchParams(sp);
    p.set("q", query);
    p.set("page", String(page));
    p.set("sort", sort);
    p.set("order", order);
    setSp(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, sort, order]);

  return { query, setQuery, page, setPage, sort, setSort, order, setOrder };
}
