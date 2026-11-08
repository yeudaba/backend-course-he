// P25-E18: מי הלקוח? (X-Forwarded-For ו־trust proxy)
export function clientIp(remoteAddress: string, forwardedFor: string | undefined, hops: number): string {
  return forwardedFor?.split(",")[0].trim() ?? remoteAddress; // לא נכון! הלקוח קובע מה כתוב שם
}
