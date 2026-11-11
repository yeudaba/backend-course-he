// P26.3-E26 — label selector של Kubernetes
export type Requirement =
  | { key: string; op: "=" | "!="; value: string }
  | { key: string; op: "in" | "notin"; values: string[] }
  | { key: string; op: "exists" | "!exists" };

const EQUALITY = /^([\w./-]+)\s*(==|=|!=)\s*([\w.-]*)$/;
const SET = /^([\w./-]+)\s+(in|notin)\s*\(([^()]*)\)$/;
const EXISTS = /^(!?)\s*([\w./-]+)$/;
const VALUE = /^[\w.-]+$/;

export function parseSelector(selector: string): Requirement[] {
  if (selector.trim() === "") return [];
  // פסיק מפריד בין דרישות — אבל לא פסיק בתוך סוגריים
  return selector.split(/,(?![^()]*\))/).map((raw) => {
    const part = raw.trim();
    let m = part.match(EQUALITY);
    if (m) return { key: m[1], op: m[2] === "!=" ? "!=" : "=", value: m[3] };
    m = part.match(SET);
    if (m) {
      const values = m[3].split(",").map((v) => v.trim());
      if (values.some((v) => !VALUE.test(v))) throw new SyntaxError(`ערך לא תקין ב־"${part}"`);
      return { key: m[1], op: m[2] as "in" | "notin", values };
    }
    m = part.match(EXISTS);
    if (m) return { key: m[2], op: m[1] ? "!exists" : "exists" };
    throw new SyntaxError(`דרישה לא תקינה: "${part}"`);
  });
}

export function matches(labels: Record<string, string>, selector: string): boolean {
  return parseSelector(selector).every((r) => {
    const has = Object.hasOwn(labels, r.key);
    const value = labels[r.key];
    switch (r.op) {
      case "=":
        return has && value === r.value;
      case "!=":
        return !has || value !== r.value;
      case "in":
        return has && r.values.includes(value);
      case "notin":
        return !has || !r.values.includes(value);
      case "exists":
        return has;
      case "!exists":
        return !has;
    }
  });
}

const pods: { name: string; labels: Record<string, string> }[] = [
  { name: "web-7d9f-a", labels: { app: "web", tier: "frontend", env: "prod" } },
  { name: "web-7d9f-b", labels: { app: "web", tier: "frontend", env: "staging", canary: "true" } },
  { name: "api-5c4b-a", labels: { app: "api", tier: "backend", env: "prod" } },
  { name: "db-0", labels: { app: "postgres", tier: "db" } },
];
for (const sel of ["app=web", "env in (prod, staging),!canary", "tier!=db", "env", "tier notin (frontend,db)"]) {
  console.log(sel.padEnd(32), pods.filter((p) => matches(p.labels, sel)).map((p) => p.name).join(" "));
}
console.log(JSON.stringify(parseSelector("app=web,env in (prod,staging),!canary")));
