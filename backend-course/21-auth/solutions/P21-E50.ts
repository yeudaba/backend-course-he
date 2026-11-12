// P21-E50: jwtInfo — רק לתצוגה. לא להחלטות הרשאה!
export type JwtInfo = { alg: string; sub: number; role: string; secondsLeft: number; expired: boolean };

const fromB64 = (part: string) => JSON.parse(Buffer.from(part, "base64url").toString("utf8"));

export function jwtInfo(token: string, nowSec: number): JwtInfo {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("טוקן לא תקין");
  let header: { alg: string };
  let payload: { sub: number; role: string; exp: number };
  try {
    header = fromB64(parts[0]);
    payload = fromB64(parts[1]);
  } catch {
    throw new Error("טוקן לא תקין");
  }
  return {
    alg: header.alg,
    sub: payload.sub,
    role: payload.role,
    secondsLeft: Math.max(0, payload.exp - nowSec),
    expired: nowSec >= payload.exp,
  };
}
