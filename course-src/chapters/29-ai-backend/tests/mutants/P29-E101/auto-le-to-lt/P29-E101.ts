// P29-E101: קריאת פלט מובנה של מודל — מתוקן
const CATEGORIES = ["billing", "shipping", "other"] as const;
type Category = (typeof CATEGORIES)[number];
type Result = { ok: true; value: { category: Category; confidence: number } } | { ok: false; error: string };

function extractJson(text: string): string | null {
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  if (fence) return fence[1];
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start >= 0 && end > start ? text.slice(start, end + 1) : null;
}

export function parseClassification(text: string): Result {
  const raw = extractJson(text);
  if (raw === null) return { ok: false, error: "אין JSON בתשובה" };
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: "JSON לא תקין" };
  }
  if (!CATEGORIES.includes(data?.category)) return { ok: false, error: `קטגוריה לא מוכרת: ${data?.category}` };
  if (typeof data.confidence !== "number" || !(data.confidence >= 0 && data.confidence < 1)) return { ok: false, error: "confidence לא תקין" };
  return { ok: true, value: { category: data.category, confidence: data.confidence } };
}
