// P25-E43: package.json מוכן ל־CI?
type Pkg = { scripts?: Record<string, string>; engines?: Record<string, string>; devDependencies?: Record<string, string>; dependencies?: Record<string, string> };

export function ciReadiness(pkg: Pkg): string[] {
  const problems: string[] = [];
  const scripts = pkg.scripts ?? {};
  for (const name of ["test", "typecheck", "build"]) {
    if (!scripts[name]) problems.push(`missing script: ${name}`);
  }
  if (scripts.test?.includes("--watch")) problems.push("test runs in watch mode");
  if (scripts.typecheck && /\btsc\b/.test(scripts.typecheck) && !scripts.typecheck.includes("--noEmit")) problems.push("typecheck should not emit");
  const usesTsc = Object.values(scripts).some((cmd) => /\btsc\b/.test(cmd));
  const hasTs = Boolean(pkg.dependencies?.typescript ?? pkg.devDependencies?.typescript);
  if (usesTsc && !hasTs) problems.push("typescript is not installed");
  if (!pkg.engines?.node) problems.push("engines.node is missing");
  return problems;
}
