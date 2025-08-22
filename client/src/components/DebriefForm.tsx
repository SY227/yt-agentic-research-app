--------------------------------------------------
import React, { useState } from "react";

type Props = {
  onSubmit: (args: { ticker: string; year?: number; quarter?: number; agentic?: boolean }) => Promise<void>;
};

export default function DebriefForm({ onSubmit }: Props) {
  const [ticker, setTicker] = useState("AAPL");
  const [year, setYear] = useState<string>("");
  const [quarter, setQuarter] = useState<string>("");
  const [agentic, setAgentic] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ticker: ticker.trim().toUpperCase(),
        year: year ? Number(year) : undefined,
        quarter: quarter ? Number(quarter) : undefined,
        agentic
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div>
        <label>Ticker</label>
        <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="e.g., NVDA" />
      </div>
      <div>
        <label>Year (optional)</label>
        <input value={year} onChange={e => setYear(e.target.value)} placeholder="2025" />
      </div>
      <div>
        <label>Quarter (1–4, optional)</label>
        <input value={quarter} onChange={e => setQuarter(e.target.value)} placeholder="2" />
      </div>
      <div>
        <label>Agentic Mode</label>
        <select value={agentic ? "1" : "0"} onChange={e => setAgentic(e.target.value === "1")}>
          <option value="1">On (Planner → Executor → Verifier)</option>
          <option value="0">Off (single-pass)</option>
        </select>
      </div>
      <div>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Working…" : "Generate Debrief"}
        </button>
      </div>
    </form>
  );
}


