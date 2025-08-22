--------------------------------------------------
import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT || 4000);
export const FMP_API_KEY = process.env.FMP_API_KEY || "";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

if (!FMP_API_KEY) {
  console.warn("[WARN] FMP_API_KEY not set. API routes will fail to fetch live data.");
}


