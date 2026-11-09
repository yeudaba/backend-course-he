// P26.3-E14: כמויות של Kubernetes — CPU ו־memory
const BINARY: Record<string, number> = { Ki: 2 ** 10, Mi: 2 ** 20, Gi: 2 ** 30, Ti: 2 ** 40 };
const DECIMAL: Record<string, number> = { k: 1e3, M: 1e6, G: 1e9, T: 1e12 };

// מחזיר millicores: "250m" ← 250, "1" ← 1000, "0.5" ← 500
export function parseCpu(q: string | number): number {
  const s = String(q).trim();
  const m = /^(\d+(?:\.\d+)?)(m?)$/.exec(s);
  if (!m) throw new Error(`CPU לא תקין: ${q}`);
  const n = Number(m[1]);
  const milli = m[2] ? n : n * 1000;
  if (!Number.isInteger(milli)) throw new Error(`CPU לא תקין (פחות ממילי־ליבה): ${q}`);
  return milli;
}

// מחזיר בתים: "512Mi" ← 536870912, "1G" ← 1e9
export function parseMemory(q: string | number): number {
  const s = String(q).trim();
  const m = /^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti|k|M|G|T)?$/.exec(s);
  if (!m) throw new Error(`memory לא תקין: ${q}`);
  const unit = m[2] ? (BINARY[m[2]] ?? DECIMAL[m[2]]) : 1;
  return Math.round(Number(m[1]) * unit);
}

export function formatMemory(bytes: number): string {
  for (const u of ["Gi", "Mi", "Ki"]) if (bytes >= BINARY[u] && bytes % BINARY[u] === 0) return `${bytes / BINARY[u]}${u}`;
  return String(bytes);
}
