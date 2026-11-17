// P24-E66: מה עושים עם הבקשה?
export type Entry = { fingerprint: string; status: number | null; body?: unknown; createdAt: number };
export type Decision =
  | { action: "execute" }
  | { action: "replay"; status: number; body: unknown }
  | { action: "reject"; status: 409 | 422; code: string };

export function decide(entry: Entry | undefined, fp: string, now: number, ttlMs: number): Decision {
  if (!entry || now - entry.createdAt >= ttlMs) return { action: "execute" }; // פג תוקף = כאילו לא קיים
  if (entry.fingerprint !== fp) return { action: "reject", status: 422, code: "IDEMPOTENCY_KEY_REUSED" };
  if (entry.status === null) return { action: "reject", status: 409, code: "IDEMPOTENCY_IN_PROGRESS" };
  return { action: "replay", status: entry.status, body: entry.body };
}

export function shouldStore(status: number): boolean {
  return status >= 200 && status < 500; // 5xx = "לא הצלחנו" ← release, כדי שאפשר יהיה לנסות שוב
}
