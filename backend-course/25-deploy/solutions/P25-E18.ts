// P25-E18
// כמו "trust proxy" של Express עם מספר: hops = כמה proxies שלנו יש לפני השרת.
// X-Forwarded-For הוא רשימה: "<מה שהלקוח כתב>, …, <מה שה־proxy הראשון שלנו ראה>". כל proxy מוסיף בסוף.
// סומכים רק על hops הכתובות האחרונות — את מה שלפניהן כל אחד יכול לזייף.
export function clientIp(remoteAddress: string, forwardedFor: string | undefined, hops: number): string {
  const chain = [remoteAddress, ...(forwardedFor ?? "").split(",").map((s) => s.trim()).filter(Boolean).reverse()];
  // chain[0] = מי שהתחבר אלינו ישירות; chain[k] = מה ש־proxy מספר k כתב
  return chain[Math.min(hops, chain.length - 1)];
}
