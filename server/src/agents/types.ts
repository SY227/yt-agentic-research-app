--------------------------------------------------
export type StepType =
  | "DISCOVER_LATEST_PERIOD"
  | "FETCH_TRANSCRIPT_PERIOD"
  | "FETCH_TRANSCRIPT_LATEST"
  | "COMPUTE_PRICE_CONTEXT"
  | "FETCH_NEWS_WINDOW"
  | "WIDEN_NEWS_WINDOW"
  | "SUMMARIZE_DEBRIEF";

export interface Step {
  type: StepType;
  note?: string;
}

export interface Memory {
  ticker: string;
  year?: number;
  quarter?: number;
  newsWindowDays: number;
  transcriptText: string;
  callDatetime?: string | null;
  price: {
    pre_call_price: number | null;
    post_call_price: number | null;
    abs_change: number | null;
    pct_change: number | null;
  };
  news: { title: string; url: string; text: string; publishedAt: string }[];
  debrief?: any;
  attempts: number;
  mode: "UNKNOWN" | "PRE_CALL" | "POST_CALL";
}

export interface Verification {
  done: boolean;
  issues: string[];
  suggestions: Step[];
}

export interface Plan {
  steps: Step[];
  reason?: string;
}


