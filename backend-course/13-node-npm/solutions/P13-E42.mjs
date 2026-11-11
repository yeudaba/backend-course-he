// P13-E42: תלויות לפי scope
const NONE = "(ללא)";

export function byScope(pkg) {
  const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  const groups = new Map();
  for (const name of names) {
    const scope = name.startsWith("@") ? name.slice(0, name.indexOf("/")) : NONE;
    if (!groups.has(scope)) groups.set(scope, []);
    groups.get(scope).push(name);
  }
  const result = new Map();
  const keys = [...groups.keys()].filter((k) => k !== NONE).sort();
  if (groups.has(NONE)) keys.unshift(NONE);
  for (const k of keys) result.set(k, groups.get(k).sort());
  return result;
}

console.log(byScope({
  dependencies: { express: "^5", "@prisma/client": "^6" },
  devDependencies: { "@types/node": "^24", "@types/express": "^5", eslint: "^9" },
}));
