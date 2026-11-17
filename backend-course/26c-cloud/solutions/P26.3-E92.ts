// P26.3-E92: למצוא סודות במרכאות כפולות
export function findInterpolatedSecrets(text: string, secretVars: string[]) {
  const out: { line: number; variable: string; at: number }[] = [];
  const check = (body: string, startLine: number, startAt: number) => {
    for (const v of secretVars) {
      const re = new RegExp(`\\$(?:\\{(?:env\\.)?${v}\\}|${v}(?![A-Za-z0-9_]))`, "g");
      for (const m of body.matchAll(re)) {
        const before = body.slice(0, m.index);
        out.push({ line: startLine + (before.match(/\n/g)?.length ?? 0), variable: v, at: startAt + m.index! });
      }
    }
  };
  let i = 0;
  let line = 1;
  while (i < text.length) {
    if (text.startsWith("//", i)) {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }
    const quote = ['"""', "'''", '"', "'"].find((q) => text.startsWith(q, i));
    if (!quote) {
      if (text[i] === "\n") line++;
      i++;
      continue;
    }
    const startLine = line;
    const start = i + quote.length;
    let j = start;
    while (j < text.length && !text.startsWith(quote, j)) {
      if (text[j] === "\\") j++;
      else if (text[j] === "\n") line++;
      j++;
    }
    if (quote.startsWith('"')) check(text.slice(start, j), startLine, start);
    i = j + quote.length;
  }
  return out.sort((a, b) => a.at - b.at).map(({ line, variable }) => ({ line, variable }));
}
