// P26.3-E74: helm template קטן
type Ctx = { Values: Record<string, unknown>; Release: { Name: string }; Chart: { AppVersion: string } };

function lookup(path: string, ctx: Ctx): unknown {
  return path.slice(1).split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), ctx);
}

function literal(token: string, ctx: Ctx): unknown {
  if (token.startsWith('"')) return JSON.parse(token);
  if (token.startsWith(".")) return lookup(token, ctx);
  return Number(token);
}

const empty = (v: unknown) => v === undefined || v === null || v === "" || v === 0 || v === false;

export function renderTemplate(tpl: string, ctx: Ctx): string {
  return tpl.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, expr: string) => {
    const [first, ...pipes] = expr.split("|").map((s) => s.trim());
    let v = lookup(first, ctx);
    let quote = false;
    for (const p of pipes) {
      if (p.startsWith("default ")) {
        if (empty(v)) v = literal(p.slice("default ".length).trim(), ctx);
      } else if (p === "quote") quote = true;
      else throw new Error(`פונקציה לא מוכרת: ${p}`);
    }
    if (v !== null && typeof v === "object") throw new Error(`${first} הוא אובייקט — צריך toYaml`);
    const s = v == null ? "" : String(v);
    return quote ? JSON.stringify(s) : s;
  });
}
