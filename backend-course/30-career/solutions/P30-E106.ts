// P30-E106: איפה TypeScript הושתק
type Kind = "as-any" | "explicit-any" | "ts-ignore" | "non-null";

const STRING = /(["'`])(?:\\.|(?!\1).)*\1/g;

export function typeEscapes(source: string): { line: number; kind: Kind }[] {
  const out: { line: number; kind: Kind }[] = [];
  source.split("\n").forEach((raw, i) => {
    const noStrings = raw.replace(STRING, (s) => s[0] + " ".repeat(s.length - 2) + s[0]);
    const comments = (noStrings.match(/\/\/.*$|\/\*.*?\*\//g) ?? []).join(" ");
    const code = noStrings.replace(/\/\*.*?\*\//g, "").replace(/\/\/.*$/, "");
    const kinds: [Kind, boolean][] = [
      ["ts-ignore", /@ts-(ignore|expect-error)/.test(comments)],
      ["as-any", /\bas\s+any\b/.test(code)],
      ["explicit-any", /:\s*any\b/.test(code)],
      ["non-null", /[\w)\]]![.);,[]/.test(code)],
    ];
    for (const [kind, hit] of kinds) if (hit) out.push({ line: i + 1, kind });
  });
  return out;
}
