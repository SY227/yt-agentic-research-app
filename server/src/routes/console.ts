--------------------------------------------------
import { Router } from "express";
import { getQuoteNow, getStockNewsWindow } from "../lib/fmp.js";

const router = Router();

// Server-Sent Events stream: quote + latest news every 5s
router.get("/console/:ticker/stream", async (req, res) => {
  const { ticker } = req.params;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders?.();

  let timer: NodeJS.Timeout | null = null;
  let closed = false;

  async function tick() {
    try {
      const [q, news] = await Promise.all([
        getQuoteNow(ticker),
        getStockNewsWindow(ticker, 1)
      ]);
      const payload = JSON.stringify({ quote: q, news: news.slice(0, 5) });
      res.write(`event:update\ndata:${payload}\n\n`);
    } catch (e) {
      res.write(`event:error\ndata:${JSON.stringify({ message: "stream error" })}\n\n`);
    }
    if (!closed) timer = setTimeout(tick, 5000);
  }

  tick();

  req.on("close", () => {
    closed = true;
    if (timer) clearTimeout(timer);
  });
});

export default router;


