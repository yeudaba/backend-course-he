// P12-E24
export type Wallet = { id: string; balanceAgorot: number };
export interface WalletRepo {
  find(id: string): Promise<Wallet | null>;
  save(w: Wallet): Promise<void>;
}
export class NotFoundError extends Error {}
export class ValidationError extends Error {}
export class InsufficientFundsError extends Error {}

// transfer({ from, to, amount, idempotencyKey }) → { transferId, fromBalance, toBalance } (בשקלים)
// סכום חיובי עד 2 ספרות; ארנק חסר → NotFoundError; אותו ארנק / סכום לא תקין → ValidationError
// אין מספיק → InsufficientFundsError | אותו idempotencyKey → אותה תוצאה, בלי העברה נוספת
export class TransferService {
  // כתוב כאן
}
