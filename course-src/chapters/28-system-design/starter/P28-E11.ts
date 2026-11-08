// P28-E11: עימוד עם cursor (keyset pagination)
export interface Cursor {
  createdAt: string;
  id: number;
}

export function encodeCursor(c: Cursor): string {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function decodeCursor(raw: string): Cursor {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function nextPage<T extends Cursor>(rows: readonly T[], limit: number, after?: string): { data: T[]; nextCursor: string | null } {
  throw new Error("עוד לא כתבת את הפתרון");
}
