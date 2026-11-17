// P24-E87: הגבלה ל־login — לפי IP ולפי חשבון
type Rule = { limit: number; windowMs: number };

export function createLoginLimiter({
  now,
  perIp = { limit: 20, windowMs: 60_000 },
  perEmail = { limit: 5, windowMs: 15 * 60_000 },
}: { now: () => number; perIp?: Rule; perEmail?: Rule }) {
  const byIp = new Map<string, number[]>();
  const failures = new Map<string, number[]>();
  const norm = (email: string) => email.trim().toLowerCase();
  const recent = (map: Map<string, number[]>, key: string, windowMs: number) => {
    const t = now();
    const list = (map.get(key) ?? []).filter((x) => t - x < windowMs);
    if (list.length) map.set(key, list);
    else map.delete(key); // לא משאירים מפתחות ריקים (E79)
    return list;
  };
  const wait = (list: number[], windowMs: number) => Math.ceil((list[0] + windowMs - now()) / 1000);

  return {
    check(ip: string, email: string) {
      const ips = recent(byIp, ip, perIp.windowMs);
      if (ips.length >= perIp.limit) return { allowed: false as const, reason: "ip" as const, retryAfterSeconds: wait(ips, perIp.windowMs) };
      const fails = recent(failures, norm(email), perEmail.windowMs);
      if (fails.length >= perEmail.limit) return { allowed: false as const, reason: "email" as const, retryAfterSeconds: wait(fails, perEmail.windowMs) };
      byIp.set(ip, [...ips, now()]); // רק ניסיון שעבר נספר
      return { allowed: true as const };
    },
    fail(email: string) {
      const key = norm(email);
      failures.set(key, [...recent(failures, key, perEmail.windowMs), now()]);
    },
    succeed(email: string) {
      failures.delete(norm(email));
    },
  };
}
