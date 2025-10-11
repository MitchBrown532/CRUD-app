import { useEffect, useState } from "react";
import { api } from "../api";

export default function Home() {
  // Local state to track the backend's status
  const [apiStatus, setApiStatus] = useState("Checking...");

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/api/health");
        setApiStatus(data?.status ?? "unknown");
      } catch {
        setApiStatus("error");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Home</h1>
      <p>
        Backend Status: <strong>{apiStatus}</strong>
      </p>
    </div>
  );
}
