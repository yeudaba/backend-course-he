// P24-E81: headers של הגבלת קצב
export function rateLimitHeaders({ allowed, limit, remaining, resetMs }: { allowed: boolean; limit: number; remaining: number; resetMs: number }) {
  const reset = String(Math.max(1, Math.ceil(resetMs / 1000))); // שניות — לא מילישניות (P24-E23)
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(limit),
    "RateLimit-Remaining": String(Math.max(0, remaining)),
    "RateLimit-Reset": reset,
  };
  if (!allowed) headers["Retry-After"] = reset;
  return headers;
}
