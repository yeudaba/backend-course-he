// P13-E37: מה יש ב־lockfile
const NM = "node_modules/";

export function lockSummary(lock) {
  let total = 0;
  let dev = 0;
  const sets = new Map();
  for (const [key, info] of Object.entries(lock.packages ?? {})) {
    if (key === "") continue;
    total++;
    if (info.dev === true) dev++;
    const name = key.slice(key.lastIndexOf(NM) + NM.length);
    if (!sets.has(name)) sets.set(name, new Set());
    sets.get(name).add(info.version);
  }
  const versions = new Map();
  for (const [name, set] of sets) versions.set(name, [...set].sort());
  const duplicates = [...versions].filter(([, v]) => v.length > 1).map(([n]) => n).sort();
  return { total, prod: total - dev, dev, versions, duplicates };
}

const lock = {
  packages: {
    "": { name: "app" },
    "node_modules/express": { version: "5.1.0" },
    "node_modules/debug": { version: "4.4.1" },
    "node_modules/send/node_modules/debug": { version: "2.6.9" },
    "node_modules/@types/node": { version: "24.3.0", dev: true },
  },
};
console.log(lockSummary(lock));
