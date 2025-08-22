--------------------------------------------------
import axios from "axios";
import { FMP_API_KEY } from "../config.js";
import { parseFmpDate } from "./utils.js";

const BASE = "https://financialmodelingprep.com";

async function get<T>(path: string, params: Record<string, any> = {}): Promise<T> {
  if (!FMP_API_KEY) throw new Error("Missing FMP_API_KEY");
  const url = `${BASE}${path}`;
  const { data, status } = await axios.get<T>(url, {
    params: { apikey: FMP_API_KEY, ...params },
    timeout: 15000,
    validateStatus: () => true
  });
  if (status >= 400 || (data as any)?.["Error Message"]) {
    throw new Error((data as any)?.["Error Message"] || `HTTP ${status}`);
  }
  return data;
}

export async function getTranscriptLatest(ticker: string): Promise<{ text: string; call_datetime?: string | null; } | null> {
  try {
    const data = await get<any[]>("/api/v4/earning_call_transcript", { symbol: ticker });
    if (Array.isArray(data) && data.length) {
      const best = [...data].sort((a, b) => (b.content?.length ?? 0) - (a.content?.length ?? 0))[0];
      const call_dt = best?.date ? parseFmpDate(best.date)?.toISOString() : null;
      return { text: best?.content ?? "", call_datetime: call_dt ?? null };
    }
  } catch {}
  return null;
}

export async function getTranscriptByPeriod(ticker: string, year: number, quarter: number): Promise<{ text: string; call_datetime?: string | null; } | null> {
  try {
    const data = await get<any[]>(`/api/v3/earning_call_transcript/${ticker}`, { year, quarter });
    if (Array.isArray(data) && data.length) {
      const best = [...data].sort((a, b) => (b.content?.length ?? 0) - (a.content?.length ?? 0))[0];
      const call_dt = best?.date ? parseFmpDate(best.date)?.toISOString() : null;
      return { text: best?.content ?? "", call_datetime: call_dt ?? null };
    }
  } catch {}
  return null;
}

/** Discover the latest (year, quarter) for a ticker from the transcript index. */
export async function getLatestTranscriptPeriod(
  ticker: string
): Promise<{ year: number; quarter: number } | null> {
  try {
    const data = await get<any[]>("/api/v4/earning_call_transcript", { symbol: ticker });
    if (Array.isArray(data) && data.length) {
      const withYq = data.filter(e => Number.isFinite(e?.year) && Number.isFinite(e?.quarter));
      const best = (withYq.length ? withYq : data)
        .sort((a, b) => (b?.year ?? 0) - (a?.year ?? 0) || (b?.quarter ?? 0) - (a?.quarter ?? 0))[0];
      const y = Number(best?.year);
      const q = Number(best?.quarter);
      return (Number.isFinite(y) && Number.isFinite(q)) ? { year: y, quarter: q } : null;
    }
  } catch {}
  return null;
}

export async function getQuoteNow(ticker: string): Promise<{ price: number | null; previousClose: number | null; }>{
  const arr = await get<any[]>(`/api/v3/quote/${ticker}`);
  const q = Array.isArray(arr) && arr.length ? arr[0] : {};
  const price = typeof q.price === "number" ? q.price : (typeof q?.c === "number" ? q.c : null);
  const prev = typeof q.previousClose === "number" ? q.previousClose : (typeof q?.pc === "number" ? q.pc : null);
  return { price, previousClose: prev };
}

export async function getLastTwoDailyCloses(ticker: string): Promise<number[]> {
  const data = await get<any>(`/api/v3/historical-price-full/${ticker}`, { timeseries: 2, serietype: "line" });
  const hist = data?.historical ?? [];
  const closes = hist.slice(0, 2).map((h: any) => Number(h.close)).filter((n: any) => !isNaN(n));
  return closes;
}

// ---- Yahoo RSS fallback if FMP /stock_news is gated on plan ----
async function fetchYahooRss(ticker: string) {
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 30).map(m => m[1]);
  const pick = (block: string, tag: string) => {
    const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
    return m ? m[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, "").trim() : "";
  };
  return items.map(block => ({
    title: pick(block, "title"),
    url: pick(block, "link"),
    text: "",
    publishedAt: (() => {
      const d = new Date(pick(block, "pubDate"));
      return isNaN(d.getTime()) ? "" : d.toISOString();
    })()
  }));
}

export async function getStockNewsWindow(ticker: string, days: number): Promise<{ title: string; url: string; text: string; publishedAt: string; }[]> {
  const now = Date.now();
  const cutoff = now - days * 24 * 3600 * 1000;
  try {
    const limit = Math.min(Math.max(days * 20, 20), 200);
    const arr = await get<any[]>(`/api/v3/stock_news`, { tickers: ticker, limit });
    return (arr || [])
      .map((n: any) => ({
        title: n.title || "",
        url: n.url || n.link || "",
        text: n.text || "",
        publishedAt: (parseFmpDate(n.publishedDate)?.toISOString()) || ""
      }))
      .filter(n => new Date(n.publishedAt).getTime() >= cutoff);
  } catch {
    // Fallback to RSS if FMP news is gated
    const rss = await fetchYahooRss(ticker);
    return rss.filter(n => new Date(n.publishedAt).getTime() >= cutoff).slice(0, 20);
  }
}


