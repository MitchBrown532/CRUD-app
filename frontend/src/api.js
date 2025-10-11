// Helper function (fetch wrapper): sets base URL, JSON headers, parses JSON, and throws on non-2xx.
// Allows for clean code and avoids repetitive boild plate

export async function api(path, opts = {}) {
  const base = import.meta.env.VITE_API_URL; // API base from Vite env
  const res = await fetch(`${base}${path}`, {
    // fire request to base + path
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) }, // default JSON header + overrides
    ...opts, // allow method/body/etc. via opts
  });

  // Parse JSON (null if failed)
  const data = await res.json().catch(() => null);

  // Error check
  if (!res.ok) {
    // on HTTP error, surface a readable message
    const msg = data?.error || data?.message || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data;
}
