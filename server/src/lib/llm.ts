--------------------------------------------------
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../config.js";
import { clampText, extractJsonFromText } from "./utils.js";
import type { Debrief, KPI, PriceContext } from "../types.js";

type SummarizeArgs = {
  ticker: string;
  transcriptText: string;
  news: { title: string; url: string; text: string; publishedAt: string }[];
  price: PriceContext;
  year?: number;
  quarter?: number;
};

const disclaimer = "Educational use only; not investment advice.";

function heuristicSummary(args: SummarizeArgs): Debrief {
  const { ticker, news, price, year, quarter } = args;
  const themes = news.slice(0, 3).map(n => n.title).filter(Boolean);
  const kpis: KPI[] = [];
  return {
    ticker,
    period: { year, quarter },
    call_datetime: null,
    price_context: price,
    kpis,
    guidance: {},
    themes,
    risks: [],
    opportunities: [],
    quotes: [],
    qna: [],
    sources: news.slice(0, 5).map(n => ({ type: "news" as const, url: n.url, excerpt: n.title })),
    disclaimer,
    executiveSummary: `Auto-generated overview for ${ticker}. Price move context included. Top themes extracted from recent headlines.`
  };
}

export async function summarizeEarnings(args: SummarizeArgs): Promise<Debrief> {
  if (!GEMINI_API_KEY) {
    return heuristicSummary(args);
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const newsBlock = args.news.slice(0, 12).map(n => `- ${n.title} (${n.publishedAt})\n  ${n.url}`).join("\n");

  const prompt = `
You are an analyst. Produce a STRICT JSON object (no markdown, no prose outside JSON) with this schema:

{
  "ticker": string,
  "period": {"year": number | null, "quarter": number | null},
  "call_datetime": string | null,
  "price_context": {"pre_call_price": number | null, "post_call_price": number | null, "abs_change": number | null, "pct_change": number | null},
  "kpis": [{"name": string, "reported": string, "yoy": string | null, "surprise": string | null}],
  "guidance": {"next_qtr": { [k: string]: string } | null, "full_year": { [k: string]: string } | null},
  "themes": string[],
  "risks": string[],
  "opportunities": string[],
  "quotes": [{"speaker": string, "text": string}],
  "qna": [{"topic": string, "answer": string}],
  "sources": [{"type": "transcript" | "news", "locator": string | null, "url": string | null, "excerpt": string | null}],
  "disclaimer": string,
  "executiveSummary": string
}

Rules:
- Base facts primarily on the transcript (if present), adding recent news for color. Cite transcript with "locator" like "para 42" or "section Header".
- Include at least 3 KPIs if available (Revenue, EPS, GM, etc.). If unknown, put empty array.
- Keep "executiveSummary" to 80–120 words, punchy and neutral.
- If unsure, use null or empty values rather than guessing.

INPUT:
Ticker: ${args.ticker}
Period: year=${args.year ?? "null"}, quarter=${args.quarter ?? "null"}

PRICE CONTEXT:
${JSON.stringify(args.price)}

RECENT NEWS HEADLINES (most recent first):
${newsBlock}

TRANSCRIPT (first 10k chars):
"""${clampText(args.transcriptText, 10000)}"""
`;

  const res = await model.generateContent(prompt);
  const text = res.response.text();
  let obj: Debrief;
  try {
    obj = JSON.parse(extractJsonFromText(text));
  } catch (e) {
    // Fall back to heuristic if parsing fails
    return heuristicSummary(args);
  }

  // Always enforce disclaimer + ticker
  obj.ticker = args.ticker;
  obj.disclaimer = disclaimer;
  return obj;
}


