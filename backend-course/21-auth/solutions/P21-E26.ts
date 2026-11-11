// P21-E26: JWT ביד — HS256 עם node:crypto
import { createHmac, timingSafeEqual } from "node:crypto";

export type Claims = { sub: number; role: string; iat: number; exp: number };

const b64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
const sign = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("base64url");

export function signJwt(payload: { sub: number; role: string }, secret: string, expiresInSec: number, now = Math.floor(Date.now() / 1000)): string {
  const data = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ ...payload, iat: now, exp: now + expiresInSec })}`;
  return `${data}.${sign(data, secret)}`;
}

export function verifyJwt(token: string, secret: string, now = Math.floor(Date.now() / 1000)): Claims {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("טוקן לא תקין");
  const [header, payload, signature] = parts;

  const expected = Buffer.from(sign(`${header}.${payload}`, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("חתימה לא תקינה");
  }

  let head: { alg?: string };
  let claims: Claims;
  try {
    head = JSON.parse(Buffer.from(header, "base64url").toString());
    claims = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    throw new Error("טוקן לא תקין");
  }
  if (head.alg !== "HS256") throw new Error("טוקן לא תקין");
  if (typeof claims.exp !== "number" || now >= claims.exp) throw new Error("פג תוקף");
  return claims;
}

const SECRET = "dev-secret-at-least-32-characters-long!!";
const token = signJwt({ sub: 7, role: "user" }, SECRET, 900, 1793872800);
console.log(token);
console.log(verifyJwt(token, SECRET, 1793872900));
for (const [t, now] of [[token, 1793873700], [token.slice(0, -2) + "xx", 1793872900]] as const) {
  try {
    verifyJwt(t, SECRET, now);
  } catch (err) {
    console.log((err as Error).message);
  }
}
