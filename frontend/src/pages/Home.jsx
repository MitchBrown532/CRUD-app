import { useEffect, useState } from "react";
import { get } from "../api";

export default function Home() {
  const [apiStatus, setApiStatus] = useState("Checking...");

  // Health check
  useEffect(() => {
    (async () => {
      try {
        const data = await get("/api/health");
        setApiStatus(data?.status ?? "unknown");
      } catch {
        setApiStatus("error");
      }
    })();
  }, []);

  const statusColor =
    apiStatus === "error" ? "red" : apiStatus === "unknown" ? "gray" : "green";

  return (
    <main style={{ padding: 16 }}>
      <h1>Home</h1>
      <p>
        Backend Status: <strong style={{ color: statusColor }}>{apiStatus}</strong>
      </p>
    </main>
  );
}
