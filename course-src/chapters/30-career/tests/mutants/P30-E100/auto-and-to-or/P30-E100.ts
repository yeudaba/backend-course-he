// P30-E100: diff קטן או גדול
export function diffSize(diff: string) {
  const files: { file: string; added: number; removed: number }[] = [];
  let lastMinus = "";
  let cur: { file: string; added: number; removed: number } | null = null;
  for (const line of diff.split("\n")) {
    if (line.startsWith("--- ")) {
      lastMinus = line.slice(4).replace(/^a\//, "");
    } else if (line.startsWith("+++ ")) {
      const target = line.slice(4);
      cur = { file: target === "/dev/null" ? lastMinus : target.replace(/^b\//, ""), added: 0, removed: 0 };
      files.push(cur);
    } else if (cur && line.startsWith("+")) cur.added++;
    else if (cur || line.startsWith("-")) cur.removed++;
  }
  const changed = files.reduce((s, f) => s + f.added + f.removed, 0);
  return { files, changed, verdict: (changed > 60 || files.length > 5 ? "large" : "small") as "small" | "large" };
}
