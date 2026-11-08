// P30-E18: התאמה למודעת דרושים
// השם הקנוני ← הכינויים שלו (באותיות קטנות)
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

export function extractSkills(text: string): string[] {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function matchJob(adText: string, mySkills: readonly string[]): { required: string[]; matched: string[]; missing: string[]; score: number } {
  throw new Error("עוד לא כתבת את הפתרון");
}
