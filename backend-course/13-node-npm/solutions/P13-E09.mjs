// P13-E09
export function envInt(env, name, fallback) {
  const raw = env[name]?.trim();
  if (raw === undefined || raw === "") return fallback;
  if (!/^-?\d+$/.test(raw)) throw new Error(`${name} חייב להיות מספר שלם`);
  return Number(raw);
}

export function envBool(env, name, fallback) {
  const raw = env[name]?.trim().toLowerCase();
  if (raw === undefined || raw === "") return fallback;
  if (["true", "1", "yes", "on"].includes(raw)) return true;
  if (["false", "0", "no", "off"].includes(raw)) return false;
  throw new Error(`${name} חייב להיות בוליאני`);
}

console.log(envInt({ PORT: "8080" }, "PORT", 3000), envBool({ DEBUG: "False" }, "DEBUG", true));
