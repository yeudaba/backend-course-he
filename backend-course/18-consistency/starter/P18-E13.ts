// P18-E13
// transferSafe(pool, fromId, toId, amount) → { transferId, fromBalance, toBalance }
// SAME_ACCOUNT | INVALID_AMOUNT | ACCOUNT_NOT_FOUND | INSUFFICIENT_FUNDS — נעילה לפי סדר id
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function transferSafe(pool: Pool, fromId: number, toId: number, amount: number) {
  // כתוב כאן
}
