--------------------------------------------------
import { Router } from "express";
import { z } from "zod";
import { summarizeEarnings } from "../lib/llm.js";
import { getTranscriptByPeriod, getTranscriptLatest, getQuoteNow, getLastTwoDailyCloses, getStockNewsWindow, getLatestTranscriptPeriod } from "../lib/fmp.js";
import type { PriceContext } from "../types.js";
import { runEarningsAgentic } from "../agents/orchestrator.js";

const router = Router();

// NEW: latest period discovery
router.get("/latest-period/:ticker", async (req, res) => {
  try {
    const ticker = String(req.params.ticker || "").toUpperCase();
    if (!ticker) return res.status(400).json({ error: "ticker required" });
    const yq = await getLatestTranscriptPeriod(ticker);
    if (!yq) return res.status(404).json({ error: "No earnings period found" });
    res.json(yq);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "Bad request" });
  }
});

const DebriefReq = z.object({
  ticker: z.string().min(1),
  year: z.number().int().optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  agentic: z.boolean().optional()
});

router.post("/debrief", async (req, res) => {
  try {
    const { ticker, year, quarter, agentic } = DebriefReq.parse(req.body);

    if (agentic) {
      const debrief = await runEarningsAgentic({ ticker, year, quarter, maxSteps: 6 });
      return res.json(debrief);
    }

    // --- Non-agentic path with latest-period discovery ---
    let yy = year, qq = quarter;
    if (!(yy && qq)) {
      const yq = await getLatestTranscriptPeriod(ticker);
      if (yq) { yy = yq.year; qq = yq.quarter; }
    }

    let transcript = null as null | { text: string; call_datetime?: string | null; };
    if (yy && qq) {
      transcript = await getTranscriptByPeriod(ticker, yy, qq);
    }
    if (!transcript) {
      transcript = await getTranscriptLatest(ticker);
    }

    // Graceful data fetches
    const [qRes, cRes, nRes] = await Promise.allSettled([
      getQuoteNow(ticker),
      getLastTwoDailyCloses(ticker),
      getStockNewsWindow(ticker, 2)
    ]);
    const quote  = (qRes.status === "fulfilled") ? qRes.value : { price: null, previousClose: null };
    const closes = (cRes.status === "fulfilled") ? cRes.value : [];
    const news   = (nRes.status === "fulfilled") ? nRes.value  : [];

    const prevClose = closes.length >= 1 ? closes[0] : quote.previousClose ?? null;
    const cur = quote.price ?? null;
    const abs = (cur != null && prevClose != null) ? Number((cur - prevClose).toFixed(4)) : null;
    const pct = (cur != null && prevClose != null && prevClose !== 0) ? Number((((cur - prevClose) / prevClose) * 100).toFixed(2)) : null;

    const price: PriceContext = {
      pre_call_price: prevClose,
      post_call_price: cur,
      abs_change: abs,
      pct_change: pct
    };

    const debrief = await summarizeEarnings({
      ticker,
      transcriptText: transcript?.text ?? "",
      news,
      price,
      year: yy,
      quarter: qq
    });

    if (transcript?.call_datetime) debrief.call_datetime = transcript.call_datetime;
    if (transcript?.text) debrief.sources = [{ type: "transcript" }, ...(debrief.sources || [])];

    res.json(debrief);
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: e.message || "Bad request" });
  }
});

export default router;


