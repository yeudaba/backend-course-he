// P22-E36 — הקוד שבודקים (לא משנים אותו)
export type ListQuery = { page: number; limit: number; status?: "todo" | "done"; q?: string };

// "?page=2&limit=10&status=done&q=חלב" ← { page: 2, limit: 10, status: "done", q: "חלב" }
export function parseListQuery(search: string): ListQuery {
  const p = new URLSearchParams(search);
  const page = p.has("page") ? Number(p.get("page")) : 1;
  const limit = p.has("limit") ? Number(p.get("limit")) : 20;
  if (!Number.isInteger(page) || page < 1) throw new RangeError("page לא תקין");
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new RangeError("limit לא תקין");
  const out: ListQuery = { page, limit };
  const status = p.get("status");
  if (status !== null) {
    if (status !== "todo" && status !== "done") throw new RangeError("status לא תקין");
    out.status = status;
  }
  const q = p.get("q")?.trim();
  if (q) out.q = q;
  return out;
}
