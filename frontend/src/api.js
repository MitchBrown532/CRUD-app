// Helper function (fetch wrapper): sets base URL, JSON headers, parses JSON, and throws on non-2xx.
// Allows for clean code and avoids repetitive boiler plate

export async function api(path, opts = {}) {
  const base = import.meta.env.VITE_API_URL;
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) }, 
    ...opts, // method, body, etc.
  });

  // Parse JSON (null if failed - console log in dev)
  const data = await res.json().catch(() => {
    if (import.meta.env.DEV) console.warn("Failed to parse JSON response:", path);
    return null;
  });

  // Error check
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data;
    err.path = path;
    throw err;
  }

  return data;
}

// CRUD helpers
export const get = (path, opts) => api(path, { method: "GET", ...opts });
export const post = (path, body, opts) =>
  api(path, { method: "POST", body: JSON.stringify(body), ...opts });
export const put = (path, body, opts) =>
  api(path, { method: "PUT", body: JSON.stringify(body), ...opts });
export const del = (path, opts) => api(path, { method: "DELETE", ...opts });
