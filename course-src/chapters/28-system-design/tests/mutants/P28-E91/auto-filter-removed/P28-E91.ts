// P28-E91: בודק מסמך תכנון
export const REQUIRED = ["הקשר", "מטרות", "אומדנים", "פתרון", "חלופות", "סיכונים", "איך נדע"];

export function checkDesignDoc(markdown: string) {
  const content = new Map<string, number>();
  let current: string | null = null;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      const title = line.slice(3).trim();
      current = REQUIRED.find((s) => title.startsWith(s)) ?? null;
      if (current !== null && !content.has(current)) content.set(current, 0);
      continue;
    }
    if (current !== null && line.trim() !== "") content.set(current, (content.get(current) ?? 0) + 1);
  }
  const missing = REQUIRED.filter((s) => !content.has(s));
  const empty = REQUIRED;
  return { ok: missing.length === 0 && empty.length === 0, missing, empty };
}
