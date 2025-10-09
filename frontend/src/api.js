// Helper function (fetch wrapper): sets base URL, JSON headers, parses JSON, and throws on non-2xx.
// Allows for clean code and avoids repetitive boild plate

export async function api(path, opts = {}) {
  const base = import.meta.env.VITE_API_URL; // API base from Vite env
  const res = await fetch(`${base}${path}`, {
    // fire request to base + path
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) }, // default JSON header + overrides
    ...opts, // allow method/body/etc. via opts
  });

  let data = null;
  try {
    data = await res.json(); // try to parse JSON
  } catch (_) {} // ignore parse errors; we'll handle via status

  if (!res.ok) {
    // on HTTP error, surface a readable message
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data ?? null; // return parsed JSON or null (for empty)
}
