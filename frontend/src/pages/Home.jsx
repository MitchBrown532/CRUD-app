import { useEffect, useState } from "react";

export default function Home() {
  // Local state to track the backend's status
  const [api, setApi] = useState("Checking...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health`)
      .then((r) => r.json()) // Parse JSON from response
      .then((d) => setApi(d.status ?? "unknown")) // Update UI with backend status
      .catch(() => setApi("error")); // If fetch fails, show error
  }, []); // '[]' means run only once (when the component renders).

  return (
    <div style={{ padding: 16 }}>
      <h1>Home</h1>
      <p>
        Backend Status: <strong>{api}</strong>
      </p>
    </div>
  );
}
