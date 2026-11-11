// P13-E63: בודק לקובץ .env
export function lintEnv(text) {
  const warnings = [];
  const firstLine = new Map();
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const n = i + 1;
    const t = lines[i].trim();
    if (t === "" || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) {
      warnings.push(`שורה ${n}: חסר =`);
      continue;
    }
    const name = t.slice(0, eq).trim();
    const value = t.slice(eq + 1).trim();
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      warnings.push(`שורה ${n}: שם לא תקין: ${name}`);
      continue;
    }
    if (firstLine.has(name)) {
      warnings.push(`שורה ${n}: ${name} מוגדר שוב (קודם בשורה ${firstLine.get(name)})`);
      continue;
    }
    firstLine.set(name, n);
    const q = value[0];
    if (q === '"' || q === "'") {
      if (value.length < 2 || !value.endsWith(q)) warnings.push(`שורה ${n}: מירכאות לא סגורות`);
    } else if (value.includes(" ")) {
      warnings.push(`שורה ${n}: ערך עם רווחים בלי מירכאות`);
    }
  }
  return warnings;
}

console.log(lintEnv('# הגדרות\nPORT=8080\nport=9\nAPP_NAME=Dana Shop\nPORT=1\nTITLE="Hi\nGOOD="a b"\nBROKEN\n'));
