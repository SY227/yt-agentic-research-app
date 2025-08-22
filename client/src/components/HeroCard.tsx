--------------------------------------------------
import React from "react";

export default function HeroCard(props: { title: string; value: string; sub?: string; tone?: "good" | "bad" | "neutral" }) {
  const color =
    props.tone === "good" ? "var(--good)"
    : props.tone === "bad" ? "var(--bad)"
    : "var(--accent)";
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>{props.title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 6 }}>{props.value}</div>
      {props.sub && <div className="badge" style={{ marginTop: 8 }}>{props.sub}</div>}
    </div>
  );
}


