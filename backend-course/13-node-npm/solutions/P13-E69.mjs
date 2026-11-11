// P13-E69: הפניות בין משתנים ב־.env
export function expand(vars) {
  const done = new Map();
  function resolve(key, stack) {
    if (done.has(key)) return done.get(key);
    if (stack.has(key)) throw new Error(`הפניה מעגלית: ${key}`);
    stack.add(key);
    const value = vars[key].replace(/\$\{(\w+)\}/g, (_, name) => {
      if (!(name in vars)) throw new Error(`משתנה לא מוגדר: ${name} (ב־${key})`);
      return resolve(name, stack);
    });
    stack.delete(key);
    done.set(key, value);
    return value;
  }
  const result = {};
  for (const key of Object.keys(vars)) result[key] = resolve(key, new Set());
  return result;
}

console.log(expand({
  DB_USER: "dana",
  DB_HOST: "${HOST}:5432",
  HOST: "localhost",
  DATABASE_URL: "postgres://${DB_USER}@${DB_HOST}/shop",
  PRICE: "$5 or ${CURRENCY}",
  CURRENCY: "ILS",
}));
for (const bad of [{ A: "${B}" }, { A: "x${B}", B: "${A}" }]) {
  try {
    expand(bad);
  } catch (err) {
    console.log(err.message);
  }
}
