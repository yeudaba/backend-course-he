// P13-E35: להוסיף תלות
const sortKeys = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

export function addDependency(pkg, name, version, { dev = false } = {}) {
  const target = dev ? "devDependencies" : "dependencies";
  const other = dev ? "dependencies" : "devDependencies";
  const result = { ...pkg, [target]: sortKeys({ ...pkg[target], [name]: `^${version}` }) };
  if (pkg[other] && name in pkg[other]) {
    const rest = { ...pkg[other] };
    delete rest[name];
    if (Object.keys(rest).length === 0) delete result[other];
    else result[other] = rest;
  }
  return result;
}

const pkg = { name: "app", dependencies: { zod: "^4.1.5" }, devDependencies: { express: "^4.0.0" } };
console.log(addDependency(pkg, "express", "5.1.0"));
console.log(addDependency(pkg, "eslint", "9.39.0", { dev: true }));
console.log(pkg.dependencies);
