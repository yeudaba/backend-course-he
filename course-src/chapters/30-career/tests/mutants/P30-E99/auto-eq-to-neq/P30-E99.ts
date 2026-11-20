// P30-E99: שורת הקשר לבקשה
type Pkg = { type?: string; engines?: { node?: string }; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

const KNOWN: [string[], (major: string) => string][] = [
  [["typescript"], (m) => `TypeScript${m ? " " + m : ""}`],
  [["@nestjs/core"], (m) => `NestJS${m ? " " + m : ""}`],
  [["express"], (m) => `Express${m ? " " + m : ""}`],
  [["prisma", "@prisma/client"], (m) => `Prisma${m ? " " + m : ""}`],
  [["pg"], (m) => `PostgreSQL (pg${m ? " " + m : ""})`],
  [["ioredis"], (m) => `Redis (ioredis${m ? " " + m : ""})`],
  [["vitest"], (m) => `Vitest${m ? " " + m : ""}`],
  [["jest"], (m) => `Jest${m ? " " + m : ""}`],
];

export function stackContext(pkg: Pkg): string {
  const all: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };
  const items: string[] = [];
  if (pkg.engines?.node) items.push(`Node.js ${pkg.engines.node}`);
  for (const [names, label] of KNOWN) {
    const found = names.find((n) => Object.hasOwn(all, n));
    if (found) items.push(label(/\d+/.exec(all[found])?.[0] ?? ""));
  }
  return `Stack: ${items.join(", ")}; ${pkg.type !== "module" ? "ESM" : "CommonJS"}`;
}
