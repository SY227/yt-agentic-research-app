--------------------------------------------------
import type { Memory, Plan, Step } from "./types.js";

export function planNext(memory: Memory): Plan {
  const steps: Step[] = [];

  const needPeriod = !(memory.year && memory.quarter);
  if (needPeriod) {
    steps.push({ type: "DISCOVER_LATEST_PERIOD", note: "Find latest Y/Q from transcript index" });
  }

  const missingTranscript = !memory.transcriptText || memory.transcriptText.trim().length < 1000;

  if (missingTranscript) {
    if (!needPeriod) {
      steps.push({ type: "FETCH_TRANSCRIPT_PERIOD", note: "Use known Y/Q" });
    }
    steps.push({ type: "FETCH_TRANSCRIPT_LATEST", note: "Fallback to latest transcript" });
  }

  steps.push({ type: "COMPUTE_PRICE_CONTEXT" });

  if (!memory.news?.length) {
    steps.push({ type: "FETCH_NEWS_WINDOW", note: `Fetch ${memory.newsWindowDays}d of news` });
  }

  steps.push({ type: "SUMMARIZE_DEBRIEF" });
  return { steps, reason: "Default plan with latest-period discovery." };
}


