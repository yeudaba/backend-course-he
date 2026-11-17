// P13-E62: required ו־optional
export function required(env, name) {
  const value = env[name]?.trim();
  if (value === undefined || value === "") throw new Error(`חסר משתנה סביבה: ${name}`);
  return value;
}

export function optional(env, name, fallback) {
  const value = env[name]?.trim();
  return value === undefined || value === "" ? fallback : value;
}

const env = { DATABASE_URL: " postgres://localhost/shop ", LOG_LEVEL: "" };
console.log(required(env, "DATABASE_URL"), optional(env, "LOG_LEVEL", "info"));
try {
  required(env, "JWT_SECRET");
} catch (err) {
  console.log(err.message);
}
