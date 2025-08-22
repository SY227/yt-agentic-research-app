--------------------------------------------------
import { getTranscriptByPeriod, getTranscriptLatest, getLastTwoDailyCloses, getQuoteNow, getStockNewsWindow, getLatestTranscriptPeriod } from "../lib/fmp.js";
import { summarizeEarnings } from "../lib/llm.js";
import type { Memory, Step } from "./types.js";

export async function executeStep(step: Step, mem: Memory): Promise<void> {
  switch (step.type) {
    case "DISCOVER_LATEST_PERIOD": {
      if (!(mem.year && mem.quarter)) {
        const yq = await getLatestTranscriptPeriod(mem.ticker);
        if (yq) {
          mem.year = yq.year;
          mem.quarter = yq.quarter;
        }
      }
      break;
    }
    case "FETCH_TRANSCRIPT_PERIOD": {
      if (!(mem.year && mem.quarter)) return;
      const t = await getTranscriptByPeriod(mem.ticker, mem.year, mem.quarter);
      if (t?.text) {
        mem.transcriptText = t.text;
        mem.callDatetime = t.call_datetime ?? mem.callDatetime ?? null;
        mem.mode = "POST_CALL";
      }
      break;
    }
    case "FETCH_TRANSCRIPT_LATEST": {
      const t = await getTranscriptLatest(mem.ticker);
      if (t?.text) {
        mem.transcriptText = t.text;
        mem.callDatetime = t.call_datetime ?? mem.callDatetime ?? null;
        mem.mode = "POST_CALL";
      } else if (mem.mode === "UNKNOWN") {
        mem.mode = "PRE_CALL";
      }
      break;
    }
    case "COMPUTE_PRICE_CONTEXT": {
      const [q, closes] = await Promise.all([
        getQuoteNow(mem.ticker),
        getLastTwoDailyCloses(mem.ticker)
      ]);
      const prevClose = closes.length >= 1 ? closes[0] : q.previousClose ?? null;
      const cur = q.price ?? null;
      const abs = (cur != null && prevClose != null) ? Number((cur - prevClose).toFixed(4)) : null;
      const pct = (cur != null && prevClose != null && prevClose !== 0) ? Number((((cur - prevClose) / prevClose) * 100).toFixed(2)) : null;

      mem.price = {
        pre_call_price: prevClose,
        post_call_price: cur,
        abs_change: abs,
        pct_change: pct
      };
      break;
    }
    case "FETCH_NEWS_WINDOW": {
      const news = await getStockNewsWindow(mem.ticker, mem.newsWindowDays);
      mem.news = news;
      break;
    }
    case "WIDEN_NEWS_WINDOW": {
      mem.newsWindowDays = Math.min(mem.newsWindowDays + 2, 10);
      const news = await getStockNewsWindow(mem.ticker, mem.newsWindowDays);
      mem.news = news;
      break;
    }
    case "SUMMARIZE_DEBRIEF": {
      const debrief = await summarizeEarnings({
        ticker: mem.ticker,
        transcriptText: mem.transcriptText || "",
        news: mem.news || [],
        price: mem.price,
        year: mem.year,
        quarter: mem.quarter
      });
      if (mem.callDatetime) {
        debrief.call_datetime = mem.callDatetime;
      }
      if ((mem.transcriptText || "").length > 0) {
        debrief.sources = [{ type: "transcript" }, ...(debrief.sources || [])];
      }
      mem.debrief = debrief;
      break;
    }
    default:
      break;
  }
}


