// P30-E08
// לפני שה־repo הופך לציבורי (ומראיינים פותחים אותו): סריקה לסודות. סוד שעלה ל־GitHub — נחשב דלוף,
// גם אם מחקת אותו ב־commit הבא (הוא בהיסטוריה). מבטלים אותו ומייצרים חדש
export interface Finding {
  path: string;
  line: number;
  kind: "env-file" | "anthropic-key" | "aws-key" | "private-key" | "db-password" | "jwt-secret";
}

const PLACEHOLDER = /^(\$\{.*\}|<.*>|your[_-]?\w*|password|changeme|secret|xxx+|\*+|)$/i;

export function findSecrets(files: readonly { path: string; content: string }[]): Finding[] {
  const out: Finding[] = [];
  for (const f of files) {
    if (/(^|\/)node_modules\//.test(f.path)) continue;
    const base = f.path.split("/").pop()!;
    const isExample = /\.example$|\.sample$|\.template$/.test(base);
    if (/^\.env(\..+)?$/.test(base) && !isExample) out.push({ path: f.path, line: 0, kind: "env-file" });
    f.content.split("\n").forEach((text, i) => {
      const line = i + 1;
      if (/sk-ant-[A-Za-z0-9_-]{10,}/.test(text)) out.push({ path: f.path, line, kind: "anthropic-key" });
      if (/\bAKIA[0-9A-Z]{16}\b/.test(text)) out.push({ path: f.path, line, kind: "aws-key" });
      if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)) out.push({ path: f.path, line, kind: "private-key" });
      const db = /postgres(?:ql)?:\/\/[^:\s/@]+:([^@\s]+)@/.exec(text);
      if (db && !PLACEHOLDER.test(db[1])) out.push({ path: f.path, line, kind: "db-password" });
      const jwt = /^\s*JWT_SECRET\s*=\s*["']?([^"'\s#]*)/.exec(text);
      if (jwt && !isExample && !PLACEHOLDER.test(jwt[1])) out.push({ path: f.path, line, kind: "jwt-secret" });
    });
  }
  return out;
}
