--------------------------------------------------
import type { Memory, Verification, Step } from "./types.js";

export function verify(mem: Memory): Verification {
  const issues: string[] = [];
  const suggestions: Step[] = [];

  if (!mem.debrief) {
    issues.push("No debrief generated yet.");
    return { done: false, issues, suggestions };
  }

  const kpiCount = Array.isArray(mem.debrief.kpis) ? mem.debrief.kpis.length : 0;
  if (mem.mode === "POST_CALL" && kpiCount < 3) {
    issues.push(`Only ${kpiCount} KPIs extracted; expected ≥3 after a call.`);
    suggestions.push({ type: "WIDEN_NEWS_WINDOW", note: "Broaden context for extraction" });
    suggestions.push({ type: "SUMMARIZE_DEBRIEF", note: "Retry extraction/summarization" });
  }

  const pc = mem.price || {};
  if (pc.pre_call_price == null || pc.post_call_price == null) {
    issues.push("Price context incomplete.");
    suggestions.push({ type: "COMPUTE_PRICE_CONTEXT" });
  }

  const haveSummary = typeof mem.debrief.executiveSummary === "string" && mem.debrief.executiveSummary.length > 0;

  const done =
    !!mem.debrief &&
    haveSummary &&
    (
      mem.mode === "PRE_CALL" ||
      (mem.mode === "POST_CALL" && kpiCount >= 3)
    );

  return { done, issues, suggestions };
}


