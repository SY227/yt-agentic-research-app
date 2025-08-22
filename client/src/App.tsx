--------------------------------------------------
import React, { useState } from "react";
import DebriefForm from "./components/DebriefForm";
import DebriefView from "./components/DebriefView";
import LiveConsole from "./components/LiveConsole";
import { generateDebrief } from "./services/api";
import type { Debrief } from "./types";
import "./styles.css";

export default function App() {
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(args: { ticker: string; year?: number; quarter?: number; agentic?: boolean }) {
    try {
      const res = await generateDebrief(args);
      console.log("[UI] debrief response:", res);  // visibility
      setError(null);
      setDebrief(res);
    } catch (e: any) {
      console.error("[UI] debrief error:", e);
      setDebrief(null);
      setError(e?.message || "Request failed");
    }
  }

  return (
    <div className="container">
      <div className="app-title">📈 Earnings Debrief</div>

      {error && <div className="card" style={{borderColor:"#f39c12"}}>
        <b>Request error:</b> {error}
      </div>}

      <DebriefForm onSubmit={onSubmit} />
      <div className="row">
        <div>{debrief ? <DebriefView data={debrief} /> : <div className="card">Generate a debrief to see results.</div>}</div>
        <div>{debrief ? <LiveConsole ticker={debrief.ticker} /> : <div className="card">Live console appears after generating a debrief.</div>}</div>
      </div>
    </div>
  );
}


