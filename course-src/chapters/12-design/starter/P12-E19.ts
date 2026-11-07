// P12-E19
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}

// { page, pageSize, offset } — ברירות מחדל 1 / 20; page שלם >= 1; pageSize שלם 1–100
// "page חייב להיות מספר שלם חיובי" | "pageSize חייב להיות בין 1 ל־100"
export function parsePagination(query: Record<string, string | undefined>): { page: number; pageSize: number; offset: number } {
  // כתוב כאן
}
