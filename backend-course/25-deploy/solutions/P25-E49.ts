// P25-E49: .env.example מול הקוד
export function envDrift(exampleText: string, code: string) {
  const used = new Set<string>();
  for (const m of code.matchAll(/process\.env(?:\.([A-Z0-9_]+)|\[["']([A-Z0-9_]+)["']\])/g)) used.add(m[1] ?? m[2]);
  const documented = new Set<string>();
  for (const raw of exampleText.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = /^(?:export\s+)?([A-Z0-9_]+)=/.exec(line);
    if (m) documented.add(m[1]);
  }
  return {
    missing: [...used].filter((k) => !documented.has(k)).sort(),
    unused: [...documented].filter((k) => !used.has(k)).sort(),
  };
}

console.log(envDrift("# הגדרות\nDATABASE_URL=postgresql://...\nJWT_SECRET=change-me\nOLD_FLAG=1", 'const a = process.env.DATABASE_URL; const b = process.env["CORS_ORIGINS"]; const c = process.env.JWT_SECRET;'));
