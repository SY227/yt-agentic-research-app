--------------------------------------------------
import React from "react";
import type { Debrief } from "../types";
import HeroCard from "./HeroCard";

export default function DebriefView({ data }: { data: Debrief }) {
  const pc = data.price_context || {};
  const tone = typeof pc.pct_change === "number"
    ? (pc.pct_change > 0 ? "good" : (pc.pct_change < 0 ? "bad" : "neutral"))
    : "neutral";

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0 }}>{data.ticker} — Earnings Debrief</h2>
        {data.call_datetime && <div className="badge">Call: {new Date(data.call_datetime).toLocaleString()}</div>}
      </div>

      <div className="hero">
        <HeroCard title="Pre vs Post" value={`${pc.pre_call_price ?? "?"} → ${pc.post_call_price ?? "?"}`} />
        <HeroCard title="Abs Change" value={pc.abs_change != null ? pc.abs_change.toString() : "?"} tone={tone as any} />
        <HeroCard title="% Change" value={pc.pct_change != null ? `${pc.pct_change}%` : "?"} tone={tone as any} />
        <HeroCard title="KPIs Found" value={`${data.kpis?.length ?? 0}`} />
      </div>

      {data.executiveSummary && (
        <div className="section">
          <h3>Executive Summary</h3>
          <div>{data.executiveSummary}</div>
        </div>
      )}

      {!!(data.kpis?.length) && (
        <div className="section">
          <h3>KPIs</h3>
          <div className="kv">
            {data.kpis.map((k, i) => (
              <div key={i} className="card" style={{ padding: 10 }}>
                <div style={{ fontWeight: 600 }}>{k.name}</div>
                <div className="badge">Reported: {k.reported}</div>
                {k.yoy && <div className="badge" style={{ marginLeft: 6 }}>YoY: {k.yoy}</div>}
                {k.surprise && <div className="badge" style={{ marginLeft: 6 }}>Surprise: {k.surprise}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.guidance && (data.guidance.next_qtr || data.guidance.full_year) && (
        <div className="section">
          <h3>Guidance</h3>
          {data.guidance.next_qtr && (
            <div style={{ marginBottom: 8 }}>
              <div className="badge" style={{ marginBottom: 6 }}>Next Quarter</div>
              <div className="mono">{JSON.stringify(data.guidance.next_qtr, null, 2)}</div>
            </div>
          )}
          {data.guidance.full_year && (
            <div>
              <div className="badge" style={{ marginBottom: 6 }}>Full Year</div>
              <div className="mono">{JSON.stringify(data.guidance.full_year, null, 2)}</div>
            </div>
          )}
        </div>
      )}

      {!!data.themes?.length && (
        <div className="section">
          <h3>Themes</h3>
          <ul>{data.themes.map((t, i) => <li className="bullet" key={i}>{t}</li>)}</ul>
        </div>
      )}

      {!!data.risks?.length && (
        <div className="section">
          <h3>Risks</h3>
          <ul>{data.risks.map((t, i) => <li className="bullet" key={i}>{t}</li>)}</ul>
        </div>
      )}

      {!!data.opportunities?.length && (
        <div className="section">
          <h3>Opportunities</h3>
          <ul>{data.opportunities.map((t, i) => <li className="bullet" key={i}>{t}</li>)}</ul>
        </div>
      )}

      {!!data.quotes?.length && (
        <div className="section">
          <h3>Notable Quotes</h3>
          <ul>{data.quotes.map((q, i) => <li className="bullet" key={i}><b>{q.speaker}:</b> {q.text}</li>)}</ul>
        </div>
      )}

      {!!data.qna?.length && (
        <div className="section">
          <h3>Q&amp;A</h3>
          <ul>{data.qna.map((q, i) => <li className="bullet" key={i}><b>{q.topic}:</b> {q.answer}</li>)}</ul>
        </div>
      )}

      {!!data.sources?.length && (
        <div className="section">
          <h3>Sources</h3>
          <ul>
            {data.sources.map((s, i) => (
              <li className="bullet" key={i}>
                <span className="badge" style={{ marginRight: 8 }}>{s.type}</span>
                {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a> : (s.locator || "—")}
                {s.excerpt ? <> — {s.excerpt}</> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="section">
        <div className="badge">{data.disclaimer}</div>
      </div>
    </div>
  );
}


