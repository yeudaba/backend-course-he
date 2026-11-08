// P30-E18
// מודעת דרושים ← אילו כישורים היא מבקשת, מה יש לך, ומה חסר. לא כדי "לעבור סינון" —
// כדי להחליט על מה להתכונן, ומה להבליט בקורות החיים לאותה משרה
export const SKILLS: Record<string, string[]> = {
  "Node.js": ["node.js", "nodejs", "node"],
  TypeScript: ["typescript", "ts"],
  JavaScript: ["javascript", "js"],
  NestJS: ["nestjs", "nest.js"],
  Express: ["express", "express.js"],
  PostgreSQL: ["postgresql", "postgres", "psql"],
  MySQL: ["mysql"],
  MongoDB: ["mongodb", "mongo"],
  Redis: ["redis"],
  Docker: ["docker"],
  Kubernetes: ["kubernetes", "k8s"],
  AWS: ["aws", "amazon web services"],
  "CI/CD": ["ci/cd", "ci", "github actions", "jenkins"],
  REST: ["restful", "rest api", "rest apis"],
  GraphQL: ["graphql"],
  Python: ["python"],
  Go: ["golang"],
  Kafka: ["kafka"],
  SQL: ["sql"],
  Testing: ["jest", "unit tests", "testing", "tdd"],
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export function extractSkills(text: string): string[] {
  const t = ` ${text.toLowerCase()} `;
  return Object.entries(SKILLS)
    .filter(([, aliases]) => aliases.some((a) => new RegExp(`(^|[^a-z0-9+#.])${escape(a)}(?![a-z0-9+#])`).test(t)))
    .map(([name]) => name);
}

export function matchJob(adText: string, mySkills: readonly string[]) {
  const required = extractSkills(adText);
  const mine = new Set(extractSkills(mySkills.join(", ")));
  const matched = required.filter((s) => mine.has(s));
  const missing = required.filter((s) => !mine.has(s));
  return { required, matched, missing, score: required.length ? Math.round((matched.length / required.length) * 100) / 100 : 0 };
}
