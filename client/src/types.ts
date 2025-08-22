--------------------------------------------------
export interface PriceContext {
  pre_call_price: number | null;
  post_call_price: number | null;
  abs_change: number | null;
  pct_change: number | null;
}

export interface Debrief {
  ticker: string;
  period?: { year?: number; quarter?: number };
  call_datetime?: string | null;
  price_context: PriceContext;
  kpis: { name: string; reported: string; yoy?: string; surprise?: string }[];
  guidance?: {
    next_qtr?: Record<string, string>;
    full_year?: Record<string, string>;
  };
  themes: string[];
  risks: string[];
  opportunities: string[];
  quotes: { speaker: string; text: string }[];
  qna: { topic: string; answer: string }[];
  sources: { type: "transcript" | "news"; locator?: string; url?: string; excerpt?: string }[];
  disclaimer: string;
  executiveSummary: string;
}


