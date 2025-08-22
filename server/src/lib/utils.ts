--------------------------------------------------
export function clampText(text: string, max = 10000): string {
  if (!text) return "";
  return text.length <= max ? text : text.slice(0, max) + "\n...[truncated]...";
}

export function parseFmpDate(dt: string): Date | null {
  // FMP often: "2025-08-14 12:34:56"
  const iso = dt?.replace(" ", "T") + "Z";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function extractJsonFromText(mixed: string): string {
  const start = mixed.indexOf("{");
  const end = mixed.lastIndexOf("}");
  if (start >= 0 && end > start) return mixed.slice(start, end + 1);
  throw new Error("No JSON object found in model response.");
}


