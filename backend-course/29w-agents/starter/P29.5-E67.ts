// P29.5-E67: ‏guardrail להחזר במסד
// כתוב וייצא:
//   type Req = { customerId: number; orderId: number; amountCents: number; toolUseId: string; maxCents: number };
//   type Out = { status: "refunded"; remainingCents: number } | { status: "duplicate" } | { status: "rejected"; reason: "bad_amount" | "not_found" | "bad_status" | "over_limit" | "over_remaining" };
//   export function refundWithGuard(pool: pg.Pool, req: Req): Promise<Out>
//
// בדיקה:  npm run check P29.5-E67
