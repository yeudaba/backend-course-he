// P29.5-E68: קישור אישור חתום
import { createHmac, timingSafeEqual } from "node:crypto";

type Claims = { runId: string; toolUseId: string; userId: number; exp: number };

const sign = (secret: string, payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

export function signApproval(secret: string, claims: Claims): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${sign(secret, payload)}`;
}

export function verifyApproval(secret: string, token: string, expect: { runId: string; toolUseId: string; userId: number; now: number }): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(secret, payload));

  try {
    const c = JSON.parse(Buffer.from(payload, "base64url").toString()) as Claims;
    return c.runId === expect.runId && c.toolUseId === expect.toolUseId && c.userId === expect.userId && expect.now < c.exp;
  } catch {
    return false;
  }
}
