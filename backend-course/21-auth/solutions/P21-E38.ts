// P21-E38: parseBcrypt
export type BcryptParts = { version: string; cost: number; salt: string; hash: string };

const RE = /^\$(2[aby])\$(\d{2})\$([./A-Za-z0-9]{22})([./A-Za-z0-9]{31})$/;

export function parseBcrypt(value: string): BcryptParts | null {
  const m = value.match(RE);
  if (!m) return null;
  const cost = Number(m[2]);
  if (cost < 4 || cost > 31) return null;
  return { version: m[1], cost, salt: m[3], hash: m[4] };
}
