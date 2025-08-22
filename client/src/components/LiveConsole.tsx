--------------------------------------------------
import React, { useEffect, useState } from "react";
import { openConsoleStream } from "../services/api";

type Snapshot = {
  quote?: { price?: number | null; previousClose?: number | null };
  news?: { title: string; url: string; publishedAt: string }[];
};

export default function LiveConsole({ ticker }: { ticker: string }) {
  const [snap, setSnap] = useState<Snapshot>({});
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    const close = openConsoleStream(ticker, setSnap);
    return () => close();
  }, [ticker, active]);

  const price = snap.quote?.price ?? null;
  const prev = snap.quote?.previousClose ?? null;
  const pct = (price != null && prev != null && prev > 0) ? (((price - prev) / prev) * 100).toFixed(2) : null;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Live Console</h3>
        <button onClick={() => setActive(v => !v)}>{active ? "Pause" : "Resume"}</button>
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="badge">Last Price: {price ?? "?"}</div>
        <div className="badge" style={{ marginLeft: 6 }}>Prev Close: {prev ?? "?"}</div>
        <div className="badge" style={{ marginLeft: 6 }}>% Change: {pct ?? "?"}</div>
      </div>
      <div className="section">
        <h3>Latest News</h3>
        <ul>
          {(snap.news ?? []).map((n, i) => (
            <li key={i} className="bullet">
              <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a> — <span className="badge">{new Date(n.publishedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


