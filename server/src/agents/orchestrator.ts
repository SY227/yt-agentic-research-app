--------------------------------------------------
import type { Memory } from "./types.js";
import { planNext } from "./planner.js";
import { executeStep } from "./executor.js";
import { verify } from "./verifier.js";

export async function runEarningsAgentic(input: {
  ticker: string;
  year?: number;
  quarter?: number;
  maxSteps?: number; // default 6
}) {
  const maxSteps = input.maxSteps ?? 6;

  const mem: Memory = {
    ticker: input.ticker,
    year: input.year,
    quarter: input.quarter,
    newsWindowDays: 2,
    transcriptText: "",
    callDatetime: null,
    price: {
      pre_call_price: null,
      post_call_price: null,
      abs_change: null,
      pct_change: null
    },
    news: [],
    debrief: undefined,
    attempts: 0,
    mode: "UNKNOWN"
  };

  for (let i = 0; i < maxSteps; i++) {
    mem.attempts = i + 1;

    const plan = planNext(mem);

    for (const step of plan.steps) {
      await executeStep(step, mem);
    }

    const check = verify(mem);
    if (check.done) {
      break;
    }

    const unique = new Map(check.suggestions.map((s, idx) => [`${s.type}-${idx}`, s]));
    for (const [, s] of unique) {
      await executeStep(s, mem);
    }
  }

  return mem.debrief ?? {
    ticker: input.ticker,
    period: { year: input.year, quarter: input.quarter },
    call_datetime: mem.callDatetime,
    price_context: mem.price,
    kpis: [],
    guidance: {},
    themes: [],
    risks: [],
    opportunities: [],
    quotes: [],
    qna: [],
    sources: [],
    disclaimer: "Educational use only; not investment advice.",
    executiveSummary:
      "Agent produced a minimal pre-call brief due to limited data. Try again later when the transcript is available."
  };
}


