--------------------------------------------------
import type { Debrief } from "../types";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export async function generateDebrief(input: { ticker: string; year?: number; quarter?: number; agentic?: boolean }): Promise<Debrief> {
  const res = await fetch(`${API_BASE}/api/earnings/debrief`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export function openConsoleStream(ticker: string, onMessage: (data: any) => void): () => void {
  const url = `${API_BASE}/api/console/${encodeURIComponent(ticker)}/stream`;
  const es = new EventSource(url);
  es.addEventListener("update", (ev) => {
    try {
      const payload = JSON.parse((ev as MessageEvent).data);
      onMessage(payload);
    } catch {}
  });
  es.addEventListener("error", () => {});
  return () => es.close();
}


