// P12-E19
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}

function parseIntStrict(text: string): number | null {
  return /^\d+$/.test(text.trim()) ? Number(text.trim()) : null;
}

export function parsePagination(query: Record<string, string | undefined>): { page: number; pageSize: number; offset: number } {
  let page = 1;
  if (query.page !== undefined) {
    const p = parseIntStrict(query.page);
    if (p === null || p < 1) {
      throw new ValidationError("page", "page חייב להיות מספר שלם חיובי");
    }
    page = p;
  }
  let pageSize = 20;
  if (query.pageSize !== undefined) {
    const s = parseIntStrict(query.pageSize);
    if (s === null || s < 1 || s > 100) {
      throw new ValidationError("pageSize", "pageSize חייב להיות בין 1 ל־100");
    }
    pageSize = s;
  }
  return { page, pageSize, offset: (page - 1) * pageSize };
}

console.log(parsePagination({ page: "3", pageSize: "10" }), parsePagination({}));
