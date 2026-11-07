// P13-E24: פותר תלויות שטוח
const parse = (v) => v.split(".").map(Number);
function compare(a, b) {
  const x = parse(a);
  const y = parse(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}
function satisfies(version, range) {
  if (!range.startsWith("^")) return compare(version, range) === 0;
  const min = range.slice(1);
  return compare(version, min) >= 0 && parse(version)[0] === parse(min)[0];
}

export function resolveDeps(rootDeps, registry) {
  const chosen = {};
  const queue = Object.entries(rootDeps);
  while (queue.length > 0) {
    const [name, range] = queue.shift();
    if (chosen[name]) {
      if (!satisfies(chosen[name], range)) {
        throw new Error(`התנגשות: ${name}`);
      }
      continue;
    }
    const versions = Object.keys(registry[name] ?? {}).filter((v) => satisfies(v, range)).sort(compare);
    const best = versions.at(-1);
    if (!best) {
      throw new Error(`אין גרסה של ${name} שמתאימה ל־${range}`);
    }
    chosen[name] = best;
    queue.push(...Object.entries(registry[name][best].deps ?? {}));
  }
  return Object.fromEntries(Object.entries(chosen).sort(([a], [b]) => a.localeCompare(b)));
}

const registry = {
  express: { "5.0.0": { deps: { router: "^2.0.0", debug: "^4.0.0" } }, "5.1.0": { deps: { router: "^2.1.0", debug: "^4.3.0" } } },
  router: { "2.0.0": {}, "2.2.0": { deps: { debug: "^4.0.0" } } },
  debug: { "4.3.4": {}, "4.4.0": {} },
};
console.log(resolveDeps({ express: "^5.0.0" }, registry));
