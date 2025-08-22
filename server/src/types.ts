--------------------------------------------------
export interface PriceContext {
  pre_call_price: number | null;
  post_call_price: number | null;
  abs_change: number | null;
  pct_change: number | null;
}

export interface SourceRef {
  type: "transcript" | "news";
  locator?: string | null;  // e.g., "para 42"
  url?: string | null;
  excerpt?: string | null;
}

export interface KPI {
  name: string;
  reported: string;
  yoy?: string;
  surprise?: string;
}

export interface Debrief {
  ticker: string;
  period?: { year?: number; quarter?: number };
  call_datetime?: string | null;
  price_context: PriceContext;
  kpis: KPI[];
  guidance?: {
    next_qtr?: Record<string, string>;
    full_year?: Record<string, string>;
  };
  themes: string[];
  risks: string[];
  opportunities: string[];
  quotes: { speaker: string; text: string }[];
  qna: { topic: string; answer: string }[];
  sources: SourceRef[];
  disclaimer: string;
  executiveSummary: string;
}


