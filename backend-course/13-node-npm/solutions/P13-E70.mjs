// P13-E70: סכמה למשתני סביבה
const camel = (name) => name.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

function convert(rule, raw) {
  switch (rule.type) {
    case "string":
      return raw;
    case "int":
      return /^-?\d+$/.test(raw) ? Number(raw) : undefined;
    case "bool": {
      const v = raw.toLowerCase();
      if (v === "true" || v === "1") return true;
      if (v === "false" || v === "0") return false;
      return undefined;
    }
    case "enum":
      return rule.values.includes(raw) ? raw : undefined;
    default:
      throw new Error(`סוג לא מוכר: ${rule.type}`);
  }
}

export function parseEnv(env, schema) {
  const result = {};
  const problems = [];
  for (const [name, rule] of Object.entries(schema)) {
    const raw = env[name]?.trim() ?? "";
    let value;
    if (raw === "") {
      convert(rule, "");
      if (!("default" in rule)) {
        problems.push(`${name}: חסר`);
        continue;
      }
      value = rule.default;
    } else {
      value = convert(rule, raw);
      if (value === undefined) {
        problems.push(`${name}: לא תקין`);
        continue;
      }
    }
    result[camel(name)] = value;
  }
  if (problems.length > 0) throw new Error("הגדרות לא תקינות:\n" + problems.join("\n"));
  return result;
}

const schema = {
  PORT: { type: "int", default: 3000 },
  DATABASE_URL: { type: "string" },
  DEBUG: { type: "bool", default: false },
  LOG_LEVEL: { type: "enum", values: ["debug", "info", "error"], default: "info" },
};
console.log(parseEnv({ DATABASE_URL: "postgres://localhost/shop", DEBUG: "TRUE" }, schema));
try {
  parseEnv({ PORT: "80a", LOG_LEVEL: "verbose" }, schema);
} catch (err) {
  console.log(err.message);
}
