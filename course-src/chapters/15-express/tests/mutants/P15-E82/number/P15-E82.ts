// P15-E82: פרמטרים של רשימה — בלי Zod
export type ListQuery = { page: number; limit: number; offset: number; sort: string; order: "asc" | "desc" };
export type Issue = { path: string; message: string };
export type ListQueryResult =
  | { ok: true; value: ListQuery }
  | { ok: false; error: { code: "VALIDATION_ERROR"; message: string; details: Issue[] } };

// מחרוזת של ספרות בלבד ← מספר; כל השאר ← null
function digits(value: unknown): number | null {
  const n = Number(value); return Number.isInteger(n) ? n : null;
}

export function parseListQuery(query: Record<string, unknown>, allowedSort: string[]): ListQueryResult {
  const details: Issue[] = [];

  let page = 1;
  if (query.page !== undefined) {
    const n = digits(query.page);
    if (n === null || n < 1) details.push({ path: "page", message: "page חייב להיות מספר שלם חיובי" });
    else page = n;
  }

  let limit = 20;
  if (query.limit !== undefined) {
    const n = digits(query.limit);
    if (n === null || n < 1 || n > 100) details.push({ path: "limit", message: "limit חייב להיות בין 1 ל־100" });
    else limit = n;
  }

  let sort = allowedSort[0];
  let order: "asc" | "desc" = "asc";
  if (query.sort !== undefined) {
    const raw = typeof query.sort === "string" ? query.sort : "";
    const field = raw.startsWith("-") ? raw.slice(1) : raw;
    if (!allowedSort.includes(field)) {
      details.push({ path: "sort", message: `אפשר למיין לפי: ${allowedSort.join(", ")}` });
    } else {
      sort = field;
      order = raw.startsWith("-") ? "desc" : "asc";
    }
  }

  if (details.length > 0) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details } };
  }
  return { ok: true, value: { page, limit, offset: (page - 1) * limit, sort, order } };
}

console.log(JSON.stringify(parseListQuery({ page: "3", limit: "25", sort: "-price" }, ["createdAt", "price"])));
console.log(JSON.stringify(parseListQuery({ page: "0", sort: "x" }, ["createdAt", "price"])));
