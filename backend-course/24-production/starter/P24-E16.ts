// P24-E16: תשלום אחד בלבד — גם כש־20 בקשות עם אותו מפתח מגיעות יחד
import type pg from "pg";

export interface Payment {
  id: number;
  userId: number;
  amountCents: number;
}

export async function createPayment(pool: pg.Pool, userId: number, key: string, amountCents: number): Promise<{ replayed: boolean; payment: Payment }> {
  throw new Error("לא מומש"); // כתוב כאן
}
