// P23-E95: להשלים .env מתוך .env.example
function parse(text: string): [string, string][] {
  const out: [string, string][] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    out.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
  }
  return out;
}

export function syncEnv(example: string, current: string) {
  const have = new Set(parse(current).map(([k]) => k));
  const missing = parse(example).filter(([k]) => !have.has(k));
  let text = current;
  if (text !== "" && !text.endsWith("\n")) text += "\n";
  if (missing.length) text += "# נוסף מ־.env.example\n" + missing.map(([k, v]) => `${k}=${v}`).join("\n") + "\n";
  const placeholders = parse(text).filter(([, v]) => v === "" || v.includes("change-me")).map(([k]) => k);
  return { text, added: missing.map(([k]) => k), placeholders };
}
