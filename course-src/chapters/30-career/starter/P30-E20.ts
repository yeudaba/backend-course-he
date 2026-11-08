// P30-E20: "הסורק לא מצא את .env.production שעלה ל־GitHub, מדווח על 'שורה 0', ומציף אותנו בהתראות על .env.example" — שלוש תקלות
export interface Finding {
  path: string;
  line: number;
  kind: "env-file" | "anthropic-key" | "db-password";
}

export function findSecrets(files: readonly { path: string; content: string }[]): Finding[] {
  const out: Finding[] = [];
  for (const f of files) {
    const base = f.path.split("/").pop()!;
    if (base === ".env") out.push({ path: f.path, line: 0, kind: "env-file" });
    f.content.split("\n").forEach((text, i) => {
      if (/sk-ant-[A-Za-z0-9_-]{10,}/.test(text)) out.push({ path: f.path, line: i, kind: "anthropic-key" });
      if (/postgres(?:ql)?:\/\/[^:\s/@]+:([^@\s]+)@/.test(text)) out.push({ path: f.path, line: i, kind: "db-password" });
    });
  }
  return out;
}
