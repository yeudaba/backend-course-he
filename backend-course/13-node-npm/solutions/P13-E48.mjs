// P13-E48: אילו משתנים מוגדרים?
export function envStatus(env, names) {
  return names.map((name) => {
    const v = env[name];
    if (v === undefined) return `${name}: חסר`;
    if (v.trim() === "") return `${name}: ריק`;
    return `${name}: מוגדר`;
  });
}

console.log(envStatus({ PORT: "8080", DEBUG: "  " }, ["PORT", "DEBUG", "JWT_SECRET"]));
console.log(envStatus(process.env, ["PATH"]));
