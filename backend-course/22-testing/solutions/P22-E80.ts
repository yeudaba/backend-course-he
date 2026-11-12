// P22-E80 — הקוד שבודקים (לא משנים אותו). JWT ביד, עם node:crypto (כמו P21-E26)
import { createHmac, timingSafeEqual } from "node:crypto";

export type Claims = { sub: number; role: string; iat: number; exp: number };
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");

export function signJwt(payload: { sub: number; role: string }, secret: string, expiresInSec: number, now: number): string {
  const h = b64({ alg: "HS256", typ: "JWT" });
  const p = b64({ sub: payload.sub, role: payload.role, iat: now, exp: now + expiresInSec });
  const s = createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
  return `${h}.${p}.${s}`;
}

export function verifyJwt(token: string, secret: string, now: number): Claims {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("טוקן לא תקין");
  const [h, p, s] = parts;
  let header: { alg?: string };
  try {
    header = JSON.parse(Buffer.from(h, "base64url").toString());
  } catch {
    throw new Error("טוקן לא תקין");
  }
  if (header.alg !== "HS256") throw new Error("טוקן לא תקין");
  const expected = Buffer.from(createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url"));
  const given = Buffer.from(s);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new Error("חתימה לא תקינה");
  const claims: Claims = JSON.parse(Buffer.from(p, "base64url").toString());
  if (now >= claims.exp) throw new Error("פג תוקף");
  return claims;
}
