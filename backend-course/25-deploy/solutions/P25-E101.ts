// P25-E101: למה ה־deploy נכשל? לקרוא את הלוג
const PREFIXES = ["הגדרות שרת לא תקינות — ", "הגדרות לא תקינות ב־.env — "];

function candidates(line: string): string[] {
  try {
    const o = JSON.parse(line) as { msg?: unknown; err?: { message?: unknown } };
    return [o?.msg, o?.err?.message].filter((x): x is string => typeof x === "string");
  } catch {
    return [line];
  }
}

export function configProblemsFromLogs(text: string) {
  const out: { name: string; message: string }[] = [];
  const seen = new Set<string>();
  for (const line of text.split("\n")) {
    for (const c of candidates(line)) {
      for (const prefix of PREFIXES) {
        const i = c.indexOf(prefix);
        if (i === -1) continue;
        for (const part of c.slice(i + prefix.length).split("; ")) {
          const j = part.indexOf(": ");
          if (j === -1) continue;
          const name = part.slice(0, j).trim();
          const message = part.slice(j + 2).trim();
          if (seen.has(`${name}\n${message}`)) continue;
          seen.add(`${name}\n${message}`);
          out.push({ name, message });
        }
      }
    }
  }
  return out;
}

console.log(configProblemsFromLogs(`==> Running 'node dist/main.js'
Error: הגדרות שרת לא תקינות — DATABASE_URL: חובה בפרודקשן; CORS_ORIGINS: בפרודקשן רק https ובלי * או נתיב: http://localhost:5500
    at loadServerConfig (/app/dist/server-config.js:31:11)
{"level":"error","msg":"bootstrap failed","err":{"message":"הגדרות לא תקינות ב־.env — JWT_SECRET: לפחות 32 תווים אקראיים"}}`));
