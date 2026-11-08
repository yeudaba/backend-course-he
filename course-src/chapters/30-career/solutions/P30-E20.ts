// P30-E20
export interface Finding {
  path: string;
  line: number;
  kind: "env-file" | "anthropic-key" | "db-password";
}

export function findSecrets(files: readonly { path: string; content: string }[]): Finding[] {
  const out: Finding[] = [];
  for (const f of files) {
    const base = f.path.split("/").pop()!;
    // תקלה 1: היה base === ".env" ← .env.production ו־.env.local עברו בלי התראה
    if (/^\.env(\..+)?$/.test(base) && !base.endsWith(".example")) out.push({ path: f.path, line: 0, kind: "env-file" });
    f.content.split("\n").forEach((text, i) => {
      // תקלה 2: מספרי השורות התחילו מ־0 ← "שורה 0" בהודעה, והשורה הלא נכונה בעורך
      if (/sk-ant-[A-Za-z0-9_-]{10,}/.test(text)) out.push({ path: f.path, line: i + 1, kind: "anthropic-key" });
      const db = /postgres(?:ql)?:\/\/[^:\s/@]+:([^@\s]+)@/.exec(text);
      // תקלה 3: כל כתובת עם סיסמה דווחה — גם YOUR_PASSWORD ב־.env.example ← אלף התראות שווא, ואף אחד לא קורא אותן
      if (db && !/^(\$\{.*\}|<.*>|your[_-]?\w*|password|changeme)$/i.test(db[1])) out.push({ path: f.path, line: i + 1, kind: "db-password" });
    });
  }
  return out;
}
